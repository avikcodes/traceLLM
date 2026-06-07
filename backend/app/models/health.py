from pydantic import BaseModel


class HealthResponse(BaseModel):
    message: str
    mongodb_connected: bool = False
    storage_type: str = "sqlite"
    storage_detail: str = ""
