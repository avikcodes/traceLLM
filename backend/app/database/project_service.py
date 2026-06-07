import secrets
import string
from datetime import datetime, timezone

from fastapi import HTTPException
from rich.console import Console

from app.database import get_backend
from app.models.project import ApiKeySchema, ProjectCreateResponse, ProjectSchema

console = Console()

PROJECTS_COLLECTION = "projects"
API_KEYS_COLLECTION = "api_keys"


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _project_id(name: str) -> str:
    base = "".join(char.lower() if char.isalnum() else "-" for char in name).strip("-")
    compact = "-".join(segment for segment in base.split("-") if segment)
    return compact or f"project-{secrets.token_hex(3)}"


def generate_api_key() -> str:
    alphabet = string.ascii_letters + string.digits
    token = "".join(secrets.choice(alphabet) for _ in range(32))
    return f"tlm_sk_{token}"


async def ensure_project_indexes() -> None:
    backend = get_backend()
    await backend.create_index(PROJECTS_COLLECTION, "project_id", unique=True)
    await backend.create_index(PROJECTS_COLLECTION, "name", unique=True)
    await backend.create_index(API_KEYS_COLLECTION, "key", unique=True)
    await backend.create_index(API_KEYS_COLLECTION, "project_id")
    await backend.create_index(API_KEYS_COLLECTION, "environment")


async def create_project(name: str, description: str, environment: str) -> ProjectCreateResponse:
    backend = get_backend()
    project_id = _project_id(name)

    existing = await backend.find_one(
        PROJECTS_COLLECTION, {"$or": [{"project_id": project_id}, {"name": name}]}
    )
    if existing:
        raise HTTPException(status_code=409, detail="Project already exists")

    project = ProjectSchema(
        project_id=project_id,
        name=name,
        description=description,
        created_at=_utc_now(),
    )
    api_key = ApiKeySchema(
        key=generate_api_key(),
        project_id=project_id,
        environment=environment,
        created_at=_utc_now(),
    )

    await backend.insert_one(PROJECTS_COLLECTION, project.model_dump(mode="python"))
    await backend.insert_one(API_KEYS_COLLECTION, api_key.model_dump(mode="python"))
    console.print(
        f"[bold green]Project created[/bold green] [dim]({project.project_id}, {environment})[/dim]"
    )
    return ProjectCreateResponse(project=project, api_key=api_key)


async def list_projects() -> list[ProjectSchema]:
    backend = get_backend()
    documents = await backend.find_many(
        PROJECTS_COLLECTION, sort=[("created_at", 1)], limit=500
    )
    return [ProjectSchema.model_validate(doc) for doc in documents]


async def list_api_keys(project_id: str | None = None) -> list[ApiKeySchema]:
    backend = get_backend()
    query = {"project_id": project_id} if project_id else {}
    documents = await backend.find_many(
        API_KEYS_COLLECTION, filter=query, sort=[("created_at", -1)], limit=500
    )
    return [ApiKeySchema.model_validate(doc) for doc in documents]


async def get_project_by_api_key(api_key: str) -> ApiKeySchema:
    backend = get_backend()
    document = await backend.find_one(API_KEYS_COLLECTION, {"key": api_key})
    if not document:
        raise HTTPException(status_code=404, detail="API key not found")
    return ApiKeySchema.model_validate(document)
