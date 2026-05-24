import secrets
import string
from datetime import datetime, timezone

from fastapi import HTTPException
from rich.console import Console

from app.database.mongodb import get_database_connection
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
    db = await get_database_connection()
    await db[PROJECTS_COLLECTION].create_index("project_id", unique=True)
    await db[PROJECTS_COLLECTION].create_index("name", unique=True)
    await db[API_KEYS_COLLECTION].create_index("key", unique=True)
    await db[API_KEYS_COLLECTION].create_index("project_id")
    await db[API_KEYS_COLLECTION].create_index("environment")


async def create_project(name: str, description: str, environment: str) -> ProjectCreateResponse:
    db = await get_database_connection()
    project_id = _project_id(name)

    existing = await db[PROJECTS_COLLECTION].find_one(
        {"$or": [{"project_id": project_id}, {"name": name}]}
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

    await db[PROJECTS_COLLECTION].insert_one(project.model_dump(mode="python"))
    await db[API_KEYS_COLLECTION].insert_one(api_key.model_dump(mode="python"))
    console.print(
        f"[bold green]Project created[/bold green] [dim]({project.project_id}, {environment})[/dim]"
    )
    return ProjectCreateResponse(project=project, api_key=api_key)


async def list_projects() -> list[ProjectSchema]:
    db = await get_database_connection()
    documents = await db[PROJECTS_COLLECTION].find({}).sort("created_at", 1).to_list(length=500)
    return [
        ProjectSchema.model_validate({key: value for key, value in document.items() if key != "_id"})
        for document in documents
    ]


async def list_api_keys(project_id: str | None = None) -> list[ApiKeySchema]:
    db = await get_database_connection()
    query = {"project_id": project_id} if project_id else {}
    documents = await db[API_KEYS_COLLECTION].find(query).sort("created_at", -1).to_list(length=500)
    return [
        ApiKeySchema.model_validate({key: value for key, value in document.items() if key != "_id"})
        for document in documents
    ]


async def get_project_by_api_key(api_key: str) -> ApiKeySchema:
    db = await get_database_connection()
    document = await db[API_KEYS_COLLECTION].find_one({"key": api_key})
    if not document:
        raise HTTPException(status_code=404, detail="API key not found")
    return ApiKeySchema.model_validate({key: value for key, value in document.items() if key != "_id"})
