from fastapi import Header, Depends
from jose import jwt
from sqlalchemy.orm import Session

from ..database import SessionLocal
from .. import models

SECRET_KEY = "supersecret"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Header(...), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")

        user = db.query(models.User).filter(models.User.id == user_id).first()
        return user

    except Exception as e:
        print("Auth error:", e)
        return None