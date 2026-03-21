from datetime import timedelta
from fastapi import Depends, FastAPI, HTTPException, Header, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.auth import ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, create_access_token, get_current_user, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from app.user import router as signup
from app.messages import router as messages
from app.settings import router as settings
from app.followers import router as followers
from app.tweets import router as tweets
from app.seed import seed_data
from app.models import User, Tweet, Follower, Like, Retweet, Notification, Message

app = FastAPI()

PUBLIC_PATHS = ["/docs", "/openapi.json", "/login", "/users", "/signup", "/health"]

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    allowed_iframe_origin = "https://jeanmichelbb.github.io"

    if request.url.path not in PUBLIC_PATHS:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Not authenticated"})
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("sub") is None:
                return JSONResponse(status_code=401, content={"detail": "Could not validate credentials"})
        except JWTError:
            return JSONResponse(status_code=401, content={"detail": "Could not validate credentials"})

    response = await call_next(request)

    # Allow iframe embedding only from your portfolio
    response.headers["X-Frame-Options"] = f"ALLOW-FROM {allowed_iframe_origin}"
    response.headers["Content-Security-Policy"] = f"frame-ancestors {allowed_iframe_origin};"

    return response

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

models = {
    'User': User,
    'Tweet': Tweet,
    'Follower': Follower,
    'Like': Like,
    'Retweet': Retweet,
    'Notification': Notification,
    'Message': Message
}

app.include_router(signup)
app.include_router(messages)
app.include_router(settings)
app.include_router(followers)
app.include_router(tweets)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://x.sacenpapier.org",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)