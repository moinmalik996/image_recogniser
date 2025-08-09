from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference

from app.db.lifespan import life_span_handeler

from app.api.v1 import auth

app = FastAPI(lifespan=life_span_handeler)
app.include_router(auth.router, prefix="/auth", tags=["auth"])


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
