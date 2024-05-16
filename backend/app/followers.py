from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import User, Follower, Following

router = APIRouter()

# Get user followers
@router.get("/followers/{user_id}")
def get_followers(user_id: str):
    db = SessionLocal()
    followers = db.query(Follower).filter(Follower.user_id == user_id).all()
    db.close()
    return followers

# Get user following
@router.get("/following/{user_id}")
def get_following(user_id: str):
    db = SessionLocal()
    following = db.query(Following).filter(Following.user_id == user_id).all()
    db.close()
    return following

# Follow a user
@router.post("/follow/{user_id}")
def follow_user(user_id: str, follow_id: str):
    db = SessionLocal()
    follower = db.query(User).filter(User.id == user_id).first()
    followee = db.query(User).filter(User.id == follow_id).first()
    if not follower or not followee:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    if db.query(Following).filter(Following.user_id == user_id, Following.following_user_id == follow_id).first():
        db.close()
        raise HTTPException(status_code=400, detail="Already following this user")
    
    db.add(Following(user_id=user_id, following_user_id=follow_id))
    db.commit()
    db.close()
    return {"message": "You are now following this user"}

# Unfollow a user
@router.delete("/unfollow/{user_id}")
def unfollow_user(user_id: str, unfollow_id: str):
    db = SessionLocal()
    following = db.query(Following).filter(Following.user_id == user_id, Following.following_user_id == unfollow_id).first()
    if not following:
        db.close()
        raise HTTPException(status_code=404, detail="User not found in following list")
    
    db.delete(following)
    db.commit()
    db.close()
    return {"message": "You have unfollowed this user"}

# check if user is following another user
@router.get("/isfollowing/{user_id}")
def is_following(user_id: str, follow_id: str):
    db = SessionLocal()
    following = db.query(Following).filter(Following.user_id == user_id, Following.following_user_id == follow_id).first()
    db.close()
    return {"following": True} if following else {"following": False}
