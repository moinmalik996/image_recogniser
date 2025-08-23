import boto3
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.config import settings
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.image import Image
from app.db.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

router = APIRouter()

class PresignedUrlRequest(BaseModel):
    filename: str
    content_type: str

class UploadImageS3Request(BaseModel):
    image_id: str
    s3_key: str

@router.post("/generate-presigned-url")
async def generate_presigned_url(
    filename: str = Query(...),
    content_type: str = Query(...),
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Create Image record (empty file_path for now)
    image = Image(file_path="", user_id=current_user.id)
    db.add(image)
    await db.commit()
    await db.refresh(image)

    # 2. Generate presigned URL with image.id as metadata
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    s3_key = f"{filename}"
    presigned_post = s3_client.generate_presigned_post(
        Bucket=settings.AWS_S3_BUCKET_NAME,
        Key=s3_key,
        Fields={
            "Content-Type": content_type,
            "x-amz-meta-image-id": str(image.id),
        },
        Conditions=[
            {"Content-Type": content_type},
            {"x-amz-meta-image-id": str(image.id)},
            ["content-length-range", 0, 10485760]
        ],
        ExpiresIn=3600,
    )

    return {
        "image_id": str(image.id),
        "presigned_post": presigned_post,
        "s3_key": s3_key
    }

# Optionally, keep or update this endpoint if you want to update the file_path after upload
@router.post("/upload-image-s3", response_model=Image)
async def upload_image_s3(
    image_id: str = Query(...),
    s3_key: str = Query(...),
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Update the Image record with the S3 file path
    result = await db.execute(
        select(Image).where(Image.id == image_id, Image.user_id == current_user.id)
    )
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    image.file_path = f"s3://{settings.AWS_S3_BUCKET_NAME}/{s3_key}"
    await db.commit()
    await db.refresh(image)
    return image