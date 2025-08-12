from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from scalar_fastapi import get_scalar_api_reference

from app.db.lifespan import life_span_handeler

from app.api.v1 import auth
from app.api.v1 import image
from app.api.v1.s3 import router as s3_router

app = FastAPI(lifespan=life_span_handeler)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(image.router, prefix="/image", tags=["image"])
app.include_router(s3_router, prefix="/s3", tags=["s3"])

# Allow requests from localhost:3000
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],    # Allow all HTTP methods
    allow_headers=["*"],    # Allow all headers
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get('/')
async def home():
    return {
        "Name": "Moin Malik",
        "Age": 34
    }
    
@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )
