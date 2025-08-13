from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Path
from sqlalchemy.future import select
from app.services.image import save_image
from app.core.config import settings
import boto3
from app.models import Image, ImageRead
from app.models.user import User
from app.api.v1.auth import get_current_user
from typing import Any
from sqlmodel.ext.asyncio.session import AsyncSession
from app.db.session import get_session
# ...existing code...

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
