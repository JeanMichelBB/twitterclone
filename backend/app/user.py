# user.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from .auth import get_password_hash  
from .models import User
from .database import SessionLocal

router = APIRouter()

class CreateUserRequest(BaseModel):
    username: str
    email: str
    password: str
    date_joined: str = Field(..., description="Date user joined")

# Define a route for user signup
@router.post("/signup")
def signup(user_data: CreateUserRequest):
    with SessionLocal() as db:
        if db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(status_code=400, detail="Username already exists")
        hashed_password = get_password_hash(user_data.password)
        new_user = User(username=user_data.username, email=user_data.email, password=hashed_password, date_joined=user_data.date_joined)
        db.add(new_user)
        db.commit()
        return {"message": "User created successfully"}
