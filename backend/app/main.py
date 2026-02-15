from fastapi import FastAPI
from .database import engine, Base
from .routes import notes
from .services.embedding_service import generate_embedding
from .services.qdrant_service import create_collection
from .services.qdrant_service import search_similar
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
create_collection()

app.include_router(notes.router)

@app.get("/")
def root():
    return {"message": "Voice AI Backend Running 🚀"}




