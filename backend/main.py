from datetime import timedelta
from fastapi import Depends, FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from app.database import engine, Base, SessionLocal
from app.models import User, models
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
    return {"username": user.username, "email": user.email}

@app.get("/profile/{username}")
async def get_user_profile(username: str):
    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    if user:
        return {
            "username": user.username,
            "full_name": user.full_name,
            "bio": user.bio,
            "location": user.location,
            "website": user.website,
            "profile_picture": user.profile_picture
        }
    else:
        raise HTTPException(status_code=404, detail="User not found")
    
@app.put("/profile/{username}")
async def update_user_profile(
    username: str,
    full_name: str,
    bio: str,
    location: str,
    website: str,
    profile_picture: str,
    current_user: str = Depends(get_current_user)
):
    if current_user != username:
        raise HTTPException(status_code=403, detail="You are not authorized to update this profile")
    

    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    if user:
        user.full_name = full_name
        user.bio = bio
        user.location = location
        user.website = website
        user.profile_picture = profile_picture
        db.commit()
        return {"message": "Profile updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="User not found")
