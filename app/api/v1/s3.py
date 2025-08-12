import boto3
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.config import settings
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.image import Image
from app.db.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

@router.post("/generate-presigned-url")
def generate_presigned_url(
    filename: str,
    content_type: str,
    current_user: User = Depends(get_current_user)
):
    try:
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )
        presigned_post = s3_client.generate_presigned_post(
            Bucket=settings.AWS_S3_BUCKET_NAME,
            Key=filename,
            Fields={"Content-Type": content_type},
            Conditions=[["content-length-range", 0, 10485760]],  # 10MB max
            ExpiresIn=3600,
        )
        return presigned_post
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/upload-image-s3", response_model=Image)
async def upload_image_s3(
    filename: str,
    s3_key: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    # Save S3 image reference in DB (no file upload, just record)
    image = Image(file_path=f"s3://{settings.AWS_S3_BUCKET_NAME}/{s3_key}", user_id=current_user.id)
    db.add(image)
    await db.commit()
    await db.refresh(image)
    return image