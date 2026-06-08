from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

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

app.include_router(health_router, prefix="/api")
app.include_router(observability_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(websocket_router)

DASHBOARD_DIR = Path(__file__).resolve().parent / "dashboard"
_next_dir = DASHBOARD_DIR / "_next"

if DASHBOARD_DIR.is_dir() and _next_dir.is_dir():
    app.mount("/_next", StaticFiles(directory=str(_next_dir)), name="next-assets")


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


@app.middleware("http")
async def _serve_dashboard(request: Request, call_next):
    response = await call_next(request)
    if response.status_code == 404 and DASHBOARD_DIR.is_dir():
        path = request.url.path
        if not path.startswith("/api/") and not path.startswith("/_next/") and path != "/ws":
            file_path = DASHBOARD_DIR / path.lstrip("/")
            if file_path.is_file():
                return FileResponse(file_path)
            if file_path.is_dir() and (file_path / "index.html").is_file():
                return FileResponse(file_path / "index.html", media_type="text/html")
            index = DASHBOARD_DIR / "index.html"
            if index.is_file():
                return FileResponse(index, media_type="text/html")
    return response
