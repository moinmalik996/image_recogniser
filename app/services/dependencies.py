from pydantic import BaseModel
from fastapi import Query

class PaginationParams(BaseModel):
    skip: int = 0
    limit: int = 10

def pagination_params(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of records to return")
) -> PaginationParams:
    return PaginationParams(skip=skip, limit=limit)