# app/profile.py

from fastapi import APIRouter, Depends, HTTPException
from .auth import get_current_user
from .database import SessionLocal
from .models import User

router = APIRouter()


def _avatar(user) -> str:
    return f"https://i.pravatar.cc/150?u={user.id}"


def _background(user) -> str:
    if user.profile_picture:
        return user.profile_picture
    return f"https://picsum.photos/seed/{user.id}/600/200"


@router.get("/userdata")
async def get_user_data(current_user: str = Depends(get_current_user)):
    with SessionLocal() as db:
        user = db.query(User).filter(User.username == current_user).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "profile_picture": _avatar(user),
            "background_picture": _background(user),
            "bio": user.bio,
            "location": user.location,
            "website": user.website,
            "date_joined": user.date_joined
        }


# for the url search
@router.get("/profile/{username}")
async def get_user_profile(username: str):
    with SessionLocal() as db:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "profile_picture": _avatar(user),
            "background_picture": _background(user),
            "bio": user.bio,
            "location": user.location,
            "website": user.website,
            "date_joined": user.date_joined
        }


@router.get("/users")
async def get_all_users():
    with SessionLocal() as db:
        users = db.query(User).all()
        return [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "full_name": u.full_name,
                "profile_picture": _avatar(u),
                "background_picture": _background(u),
                "bio": u.bio,
                "location": u.location,
                "website": u.website,
                "date_joined": u.date_joined,
            }
            for u in users
        ]
