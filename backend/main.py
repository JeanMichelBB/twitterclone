from datetime import timedelta
from fastapi import Depends, FastAPI, HTTPException, Header, Request, Security, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader, APIKey
from fastapi.openapi.models import APIKey as APIKeyModel
from fastapi.openapi.models import APIKeyIn
from fastapi.openapi.utils import get_openapi
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.auth import ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, create_access_token, get_current_user
from app.user import router as signup
from app.messages import router as messages
from app.settings import router as settings
from app.followers import router as followers
from app.tweets import router as tweets
from app.seed import seed_data
from app.models import User, Tweet, Follower, Like, Retweet, Notification, Message
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")

app = FastAPI()

api_key_header = APIKeyHeader(name="access-token", auto_error=False)

def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == API_KEY:
        return api_key_header
    else:
        raise HTTPException(status_code=403, detail="Could not validate credentials")

@app.middleware("http")
async def api_key_middleware(request: Request, call_next):
    allowed_iframe_origin = "https://jeanmichelbb.github.io"

    # Check for API key authentication, except for specific routes
    if request.url.path not in ["/docs", "/openapi.json", "/login"]:
        api_key = request.headers.get("access-token")
        if api_key != API_KEY:
            print(f"Unauthorized access attempt from {request.client.host}")
            return JSONResponse(status_code=403, content={"detail": "Could not validate credentials"})

    response = await call_next(request)

    # Allow iframe embedding only from your portfolio
    response.headers["X-Frame-Options"] = f"ALLOW-FROM {allowed_iframe_origin}"
    response.headers["Content-Security-Policy"] = f"frame-ancestors {allowed_iframe_origin};"

    return response

# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="FastAPI",
        version="1.0.0",
        description="API for Twitter Clone",
        routes=app.routes,
    )
    api_key_security_scheme = {
        "type": "apiKey",
        "name": "access-token",
        "in": "header",
    }
    openapi_schema["components"]["securitySchemes"] = {
        "access-token": api_key_security_scheme
    }
    openapi_schema["security"] = [{"access-token": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables and seed data
Base.metadata.create_all(bind=engine)
seed_data()

#get api key
@app.get("/get_api_key")
async def get_api_key():
    return {"API_KEY": API_KEY}

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
        "https://twitterclone.sacenpapier.org",
        "https://jeanmichelbb.github.io",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)