from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.db.session import init_db


@asynccontextmanager
async def life_span_handeler(app: FastAPI):
    print("Server starting ***************")
    await init_db()
    yield
    print("server stopped *****************")
