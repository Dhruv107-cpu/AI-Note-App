from pydantic import BaseModel
from datetime import datetime


# =========================
# USER SCHEMAS
# =========================
class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


# =========================
# NOTE SCHEMAS
# =========================
class NoteCreate(BaseModel):
    content: str


class NoteResponse(BaseModel):
    id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# =========================
# QUESTION SCHEMA
# =========================
class QuestionRequest(BaseModel):
    question: str