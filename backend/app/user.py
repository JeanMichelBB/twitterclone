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
    # Create a new session
    db = SessionLocal()
    # Check if the username already exists
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    # Hash the password
    hashed_password = get_password_hash(user_data.password)
    # Create a new user instance
    new_user = User(username=user_data.username, email=user_data.email, password=hashed_password, date_joined=user_data.date_joined)
    # Add the user to the session
    db.add(new_user)
    # Commit the changes to the database
    db.commit()
    # Close the session
    db.close()
    # Return a success message
    return {"message": "User created successfully"}
