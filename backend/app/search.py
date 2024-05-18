from fastapi import APIRouter, Depends, HTTPException
from .database import SessionLocal
from .models import User

router = APIRouter()

# search for users by username
@router.get("/search")
def search_users(username: str):
    db = SessionLocal()
    users = db.query(User).filter(User.username.contains(username)).all()
    db.close()
    return users

# search for users by full name
@router.get("/search")
def search_users(full_name: str):
    db = SessionLocal()
    users = db.query(User).filter(User.full_name.contains(full_name)).all()
    db.close()
    return users

