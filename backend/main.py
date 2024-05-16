from datetime import timedelta
from fastapi import Depends, FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from app.database import engine, Base, SessionLocal
from sqlalchemy.orm import Session
from app.auth import ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, create_access_token, get_current_user
from app.user import router as signup
from app.messages import router as messages
from app.settings import router as settings
from app.followers import router as followers
from app.tweets import router as tweets
from app.seed import seed_data
from app.models import User, Tweet, Follower, Like, Retweet, Notification, Message

app = FastAPI()

app.include_router(signup)
app.include_router(messages)
app.include_router(settings)
app.include_router(followers)
app.include_router(tweets)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models = {
    'User': User,
    'Tweet': Tweet,
    'Follower': Follower,
    'Like': Like,
    'Retweet': Retweet,
    'Notification': Notification,
    'Message': Message
}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables and seed data
Base.metadata.create_all(bind=engine)
seed_data()

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

# for the url search
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

