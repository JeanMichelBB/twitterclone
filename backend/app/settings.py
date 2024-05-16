from fastapi import APIRouter, Depends, HTTPException
from .database import SessionLocal
from .auth import verify_password, get_password_hash
from .models import User

router = APIRouter()

# Define routes for different user operations

# Show user information
@router.get("/user/{user_id}")
def get_user_info(user_id: str):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()
    return user

# Edit password
@router.put("/user/{user_id}/password")
def edit_password(user_id: str, current_password: str, new_password: str):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if not verify_password(current_password, user.password):
        raise HTTPException(status_code=400, detail="Invalid current password")
    hashed_password = get_password_hash(new_password)
    user.password = hashed_password
    db.commit()
    db.close()
    return {"message": "Password updated successfully"}

# Edit username
@router.put("/user/{user_id}/username")
def edit_username(user_id: str, current_username: str, new_username: str):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if user.username != current_username:
        raise HTTPException(status_code=400, detail="Invalid current username")
    user.username = new_username
    db.commit()
    db.close()
    return {"message": "Username updated successfully"}

# Edit additional user information
@router.put("/user/{user_id}")
def edit_user_info(user_id: str, current_username: str, current_password: str,
                   full_name: str = None, profile_picture: str = None, bio: str = None,
                   location: str = None, website: str = None):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if user.username != current_username:
        raise HTTPException(status_code=400, detail="Invalid current username")
    if not verify_password(current_password, user.password):
        raise HTTPException(status_code=400, detail="Invalid current password")
    if full_name:
        user.full_name = full_name
    if profile_picture:
        user.profile_picture = profile_picture
    if bio:
        user.bio = bio
    if location:
        user.location = location
    if website:
        user.website = website
    db.commit()
    db.close()
    return {"message": "User information updated successfully"}

# Delete user
@router.delete("/user/{user_id}")
def delete_user(user_id: str, current_username: str, current_password: str):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if user.username != current_username:
        raise HTTPException(status_code=400, detail="Invalid current username")

    if not verify_password(current_password, user.password):
        raise HTTPException(status_code=400, detail="Invalid current password")

    try:
        db.delete(user)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="An error occurred while deleting user")

    db.close()
    return {"message": "User deleted successfully"}
