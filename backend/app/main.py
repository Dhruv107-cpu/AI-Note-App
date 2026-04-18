from fastapi import FastAPI
from .database import engine, Base
from .routes import notes



from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(notes.router)

@app.get("/")
def root():
    return {"message": "Voice AI Backend Running 🚀"}




