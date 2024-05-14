# main.py
from datetime import timedelta
from fastapi import Depends, FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from app.database import engine, Base, SessionLocal
from app.models import User, models, Message
from sqlalchemy.orm import Session
from app.auth import ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, create_access_token, get_current_user
from app.user import router as signup

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(signup)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/login")
async def login(username: str, password: str):
    db = SessionLocal()
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/protected")
async def protected_route(current_user: str = Depends(get_current_user)):
    return {"message": f"Hello, {current_user}. You are logged in!"}

# /userdata
@app.get("/userdata")
async def get_user_data(current_user: str = Depends(get_current_user)):
    db = SessionLocal()
    user = db.query(User).filter(User.username == current_user).first()
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "profile_picture": user.profile_picture,
        "bio": user.bio,
        "location": user.location,
        "website": user.website,
        "date_joined": user.date_joined
        }

@app.get("/profile/{username}")
async def get_user_profile(username: str):
    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    if user:
        return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "profile_picture": user.profile_picture,
        "bio": user.bio,
        "location": user.location,
        "website": user.website,
        "date_joined": user.date_joined
        }
    else:
        raise HTTPException(status_code=404, detail="User not found")
    
@app.get("/users")
async def get_all_users():
    db = SessionLocal()
    users = db.query(User).all()
    user_info_list = []
    for user in users:
        user_info = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "profile_picture": user.profile_picture,
            "bio": user.bio,
            "location": user.location,
            "website": user.website,
            "date_joined": user.date_joined
        }
        user_info_list.append(user_info)
    return user_info_list


@app.get("/messages/{user_id}")
async def get_user_messages(user_id: str):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch messages where the user is either the sender or the recipient
    messages = db.query(Message).filter(
        (Message.sender_user_id == user_id) | (Message.recipient_user_id == user_id)
    ).all()

    return messages

# send message
@app.post("/messages")
async def send_message(
    sender_user_id: str,
    recipient_user_id: str,
    content: str,
    date_sent: str,
    read: bool = False,
):
    db = SessionLocal()
    user = db.query(User).filter(User.id == recipient_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Recipient not found")
    message = Message(
        sender_user_id=sender_user_id,
        recipient_user_id=recipient_user_id,
        content=content,
        date_sent=date_sent,
        read=read
    )
    db.add(message)
    db.commit()
    return {"message": "Message sent successfully"}

