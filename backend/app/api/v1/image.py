from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.services.image import save_image
from app.models import Image
from app.models.user import User
from app.api.v1.auth import get_current_user
from typing import Any
from sqlmodel.ext.asyncio.session import AsyncSession
from app.db.session import get_session

router = APIRouter()

@router.post("/upload-image", response_model=Image)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
) -> Any:
    image = await save_image(user_id=current_user.id, file=file, db=db)
    if not image:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Image upload failed.")
    return image

@router.get("/images", response_model=list[Image])
async def list_my_images(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    from sqlalchemy.future import select
    result = await db.execute(select(Image).where(Image.user_id == current_user.id))
    images = result.scalars().all()
    return images
