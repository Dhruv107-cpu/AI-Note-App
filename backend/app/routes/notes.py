from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from .. import models, schemas
from ..database import SessionLocal
from ..services.gemini_service import ask_gemini
from ..dependencies.auth import get_current_user

router = APIRouter(prefix="/notes", tags=["Notes"])


# =========================
# DB Dependency
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# CREATE NOTE
# =========================
@router.post("/", response_model=schemas.NoteResponse)
def create_note(
    note: schemas.NoteCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    new_note = models.Note(
        content=note.content,
        user_id=user.id   # 🔥 IMPORTANT
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note

# =========================
# GET ALL NOTES
# =========================
@router.get("/", response_model=list[schemas.NoteResponse])
def get_notes(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    if user.role == "admin":
        return db.query(models.Note).all()
    else:
        return db.query(models.Note).filter(models.Note.user_id == user.id).all()


# =========================
# GET NOTE BY ID
# =========================
@router.get("/{note_id}", response_model=schemas.NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    return db.query(models.Note).filter(models.Note.id == note_id).first()


# =========================
# ASK QUESTION (RAG)
# =========================
@router.post("/ask")
def ask_question(request: schemas.QuestionRequest, db: Session = Depends(get_db),user: models.User = Depends(get_current_user)):

    keywords = request.question.lower().split()
    filters = [models.Note.content.ilike(f"%{word}%") for word in keywords]

    if user.role == "admin":
        notes = db.query(models.Note).filter(or_(*filters)).all()
    else:
        notes = db.query(models.Note).filter(
        models.Note.user_id == user.id,
        or_(*filters)
           ).all()

    if not notes:
        return {
            "question": request.question,
            "answer": "No relevant notes found.",
            "sources": []
        }

    note_texts = [note.content for note in notes[:5]]

    # 🔥 If only one note → no Gemini call (save quota)
    if len(note_texts) == 1:
        return {
            "question": request.question,
            "answer": note_texts[0],
            "sources": note_texts
        }

    # 🔥 Gemini with fallback handled inside service
    answer = ask_gemini(request.question, note_texts)

    return {
        "question": request.question,
        "answer": answer,
        "sources": note_texts
    }


# =========================
# DELETE ONE NOTE
# =========================
@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()

    if not note:
        return {"message": "Note not found"}

    # 🔥 permission check
    if user.role != "admin" and note.user_id != user.id:
        return {"error": "Not authorized"}

    db.delete(note)
    db.commit()

    return {"message": "Note deleted"}

# =========================
# DELETE ALL NOTES
# =========================
@router.delete("/")
def delete_all_notes(db: Session = Depends(get_db)):
    db.query(models.Note).delete()
    db.commit()

    return {"message": "All notes deleted"}