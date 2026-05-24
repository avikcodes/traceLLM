from fastapi import APIRouter, Query

from app.database.project_service import create_project, list_api_keys, list_projects
from app.models.project import ApiKeySchema, ProjectCreateResponse, ProjectSchema

router = APIRouter()


@router.get("/projects", response_model=list[ProjectSchema])
async def get_projects() -> list[ProjectSchema]:
    return await list_projects()


@router.get("/api-keys", response_model=list[ApiKeySchema])
async def get_api_keys(project_id: str | None = Query(default=None)) -> list[ApiKeySchema]:
    return await list_api_keys(project_id=project_id)


@router.post("/projects", response_model=ProjectCreateResponse)
async def create_project_route(
    name: str,
    environment: str,
    description: str = "",
) -> ProjectCreateResponse:
    return await create_project(name=name, description=description, environment=environment)
