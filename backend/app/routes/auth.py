from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from jose import jwt

from .. import models, schemas
from ..database import SessionLocal

router = APIRouter(prefix="/auth", tags=["Auth"])

SECRET_KEY = "supersecret"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_password = bcrypt.hash(user.password)

    new_user = models.User(
        email=user.email,
        password=hashed_password,
        role="user"
    )

    db.add(new_user)
    db.commit()

    return {"message": "User created"}


@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user or not bcrypt.verify(user.password, db_user.password):
        return {"error": "Invalid credentials"}

    token = jwt.encode(
        {"user_id": db_user.id, "role": db_user.role},
        SECRET_KEY,
        algorithm="HS256"
    )

    return {"access_token": token}