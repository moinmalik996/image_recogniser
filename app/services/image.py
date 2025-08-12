from uuid import UUID
from fastapi import UploadFile
from app.models import Image
from sqlmodel.ext.asyncio.session import AsyncSession
import os
from typing import Optional

async def save_image(user_id: UUID, file: UploadFile, db: AsyncSession, upload_dir: str = "uploads") -> Optional[Image]:
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    contents = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    image = Image(file_path=file_path, user_id=user_id)
    db.add(image)
    await db.commit()
    await db.refresh(image)
    return image
