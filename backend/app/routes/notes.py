from fastapi import APIRouter, Depends,   Query
from sqlalchemy.orm import Session


from .. import models, schemas
from ..database import SessionLocal

from ..services.gemini_service import ask_gemini


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
# CREATE NOTE (Text)
# =========================
@router.post("/", response_model=schemas.NoteResponse)
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):

    # 1️⃣ Save to PostgreSQL
    new_note = models.Note(content=note.content)
    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    # 2️⃣ Generate embedding
    

    return new_note


# =========================
# GET ALL NOTES
# =========================
@router.get("/", response_model=list[schemas.NoteResponse])
def get_notes(db: Session = Depends(get_db)):
    return db.query(models.Note).all()


# =========================
# SEMANTIC SEARCH
# =========================
@router.get("/search")
def semantic_search(q: str = Query(...), db: Session = Depends(get_db)):

    # 1️⃣ Generate embedding for query
    query_vector = generate_embedding(q)

    # 2️⃣ Search Qdrant
    results = search_similar(query_vector, top_k=3)

    # 3️⃣ Extract note IDs
    note_ids = [r.payload["note_id"] for r in results]

    # 4️⃣ Fetch full notes from PostgreSQL
    notes = db.query(models.Note).filter(models.Note.id.in_(note_ids)).all()

    return notes


# =========================
# GET NOTE BY ID
# =========================
@router.get("/{note_id}", response_model=schemas.NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    return db.query(models.Note).filter(models.Note.id == note_id).first()


# =========================
# UPLOAD AUDIO → TRANSCRIBE



# =========================
# RAG – ASK QUESTION
# =========================


from sqlalchemy import or_

@router.post("/ask")
def ask_question(request: schemas.QuestionRequest, db: Session = Depends(get_db)):

    # 1️⃣ Extract keywords
    keywords = request.question.lower().split()

    # 2️⃣ Build OR search (important)
    filters = [models.Note.content.ilike(f"%{word}%") for word in keywords]

    notes = db.query(models.Note).filter(or_(*filters)).all()

    if not notes:
        return {
            "question": request.question,
            "answer": "No relevant notes found.",
            "sources": []
        }

    # 3️⃣ Limit notes
    note_texts = [note.content for note in notes[:5]]

    # 4️⃣ Ask Gemini
    answer = ask_gemini(request.question, note_texts)

    return {
        "question": request.question,
        "answer": answer,
        "sources": note_texts
    }


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        return {"message": "Note not found"}

    db.delete(note)
    db.commit()

    return {"message": "Note deleted"}
@router.delete("/")
def delete_all_notes(db: Session = Depends(get_db)):
    db.query(models.Note).delete()
    db.commit()

    return {"message": "All notes deleted"}

