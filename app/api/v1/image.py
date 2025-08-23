import boto3
import boto3.dynamodb.types
from typing import Any
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Path
from sqlalchemy.future import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.services.image import save_image
from app.core.config import settings
from app.models import Image, ImageRead
from app.models.user import User
from app.api.v1.auth import get_current_user
from app.db.session import get_session

router = APIRouter()

@router.delete("/images/{image_id}", status_code=204)
async def delete_image(
    image_id: str = Path(..., description="The ID of the image to delete"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    # Fetch image
    result = await db.execute(select(Image).where(Image.id == image_id, Image.user_id == current_user.id))
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    # If S3, delete from S3
    if image.file_path.startswith("s3://"):
        s3_key = image.file_path.split("/", 3)[-1]
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )
        try:
            s3_client.delete_object(Bucket=settings.AWS_S3_BUCKET_NAME, Key=s3_key)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete from S3: {e}")
    # Delete from DB
    await db.delete(image)
    await db.commit()
    return None


def generate_presigned_url(s3_key: str, expires_in=3600):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    return s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.AWS_S3_BUCKET_NAME, "Key": s3_key},
        ExpiresIn=expires_in,
    )



@router.post("/upload-image", response_model=ImageRead)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
) -> Any:
    if settings.ENV == "production":
        # Upload to S3
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )
        s3_key = file.filename
        file.file.seek(0)
        s3_client.upload_fileobj(file.file, settings.AWS_S3_BUCKET_NAME, s3_key, ExtraArgs={"ContentType": file.content_type})
        image = Image(file_path=f"s3://{settings.AWS_S3_BUCKET_NAME}/{s3_key}", user_id=current_user.id)
        db.add(image)
        await db.commit()
        await db.refresh(image)
        return image
    else:
        # Local upload
        image = await save_image(user_id=current_user.id, file=file, db=db)
        if not image:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Image upload failed.")
        return image



@router.get("/images", response_model=list[ImageRead])
async def list_my_images(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    result = await db.execute(select(Image).where(Image.user_id == current_user.id))
    images = result.scalars().all()
    # Build ImageRead list with presigned_url
    image_reads = []
    for image in images:
        if image.file_path.startswith("s3://"):
            s3_key = image.file_path.split("/", 3)[-1]
            presigned_url = generate_presigned_url(s3_key)
        else:
            presigned_url = image.file_path
        image_reads.append(ImageRead(
            id=image.id,
            created_at=image.created_at,
            updated_at=image.updated_at,
            file_path=image.file_path,
            user_id=image.user_id,
            presigned_url=presigned_url
        ))
    return image_reads


def extract_strings(data, keys=("Categories", "Name", "Parents")):
    """
    Recursively extract all string values for the given keys from nested dict/list structures.
    Returns a dict of key -> set of found strings.
    """
    result = {k: set() for k in keys}
    if isinstance(data, dict):
        for k, v in data.items():
            for key in keys:
                if k == key:
                    if isinstance(v, str):
                        result[key].add(v)
                    elif isinstance(v, list):
                        for item in v:
                            if isinstance(item, dict) and "Name" in item:
                                result[key].add(item["Name"])
                            elif isinstance(item, str):
                                result[key].add(item)
                    elif isinstance(v, dict) and "Name" in v:
                        result[key].add(v["Name"])
            # Recurse into all values
            sub_result = extract_strings(v, keys)
            for key in keys:
                result[key].update(sub_result[key])
    elif isinstance(data, list):
        for item in data:
            sub_result = extract_strings(item, keys)
            for key in keys:
                result[key].update(sub_result[key])
    return result

@router.get("/get-image-analysis/{image_id}")
async def get_image_analysis(
    image_id: str = Path(..., description="The image ID to look up in DynamoDB"),
    current_user: User = Depends(get_current_user)
):
    # Create DynamoDB client
    dynamodb = boto3.client(
        "dynamodb",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )

    # If your table uses user_id as partition key and image_id as sort key:
    response = dynamodb.get_item(
        TableName="imageanalysis",
        Key={
            "image-id": {"S": image_id}
        }
    )

    item = response.get("Item")
    if not item or "results" not in item:
        raise HTTPException(status_code=404, detail="Analysis not found for this image_id")

    deserializer = boto3.dynamodb.types.TypeDeserializer()
    results = deserializer.deserialize(item["results"])

    # Extract comma-separated strings
    extracted = extract_strings(results)
    response_strings = {k: ", ".join(sorted(v)) for k, v in extracted.items()}

    return {
        "image_id": image_id,
        "extracted": response_strings
    }
