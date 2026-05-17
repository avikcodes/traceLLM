from fastapi import APIRouter

from app.models.health import HealthResponse

router = APIRouter()


@router.get("/", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(message="TraceLLM backend running")
