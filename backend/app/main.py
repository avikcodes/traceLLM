from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import get_backend
from app.database.project_service import ensure_project_indexes
from app.database.trace_service import ensure_trace_indexes
from app.routes.health import router as health_router
from app.routes.observability import router as observability_router
from app.routes.projects import router as projects_router
from app.websocket.socket import router as websocket_router

load_dotenv()

app = FastAPI(title="TraceLLM Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(observability_router)
app.include_router(projects_router)
app.include_router(websocket_router)


@app.on_event("startup")
async def startup_event() -> None:
    backend = get_backend()
    await backend.initialize()
    await ensure_trace_indexes()
    await ensure_project_indexes()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    backend = get_backend()
    await backend.close()
