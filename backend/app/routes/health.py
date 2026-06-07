from fastapi import APIRouter

from app.database import get_backend
from app.models.health import HealthResponse

router = APIRouter()


@router.get("/", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    backend = get_backend()
    return HealthResponse(
        message="TraceLLM backend running",
        mongodb_connected=backend.is_connected and backend.storage_type == "mongodb",
        storage_type=backend.storage_type,
        storage_detail=backend.storage_detail,
    )
