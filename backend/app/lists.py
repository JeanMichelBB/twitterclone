from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from .auth import get_current_user
from .database import SessionLocal
from .models import TweetList, TweetListMember, User

router = APIRouter()


class ListCreate(BaseModel):
    name: str


def _current_user(db, current_user: str) -> User:
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _owned_list(db, list_id: str, owner_id: str) -> TweetList:
    tweet_list = db.query(TweetList).filter(TweetList.id == list_id, TweetList.owner_user_id == owner_id).first()
    if not tweet_list:
        raise HTTPException(status_code=404, detail="List not found")
    return tweet_list


@router.get("/lists")
def get_lists(current_user: str = Depends(get_current_user)):
    with SessionLocal() as db:
        user = _current_user(db, current_user)
        lists = db.query(TweetList).filter(TweetList.owner_user_id == user.id).all()
        return [{"id": l.id, "name": l.name, "date_created": l.date_created} for l in lists]


@router.post("/lists")
def create_list(body: ListCreate, current_user: str = Depends(get_current_user)):
    with SessionLocal() as db:
        user = _current_user(db, current_user)
        tweet_list = TweetList(owner_user_id=user.id, name=body.name, date_created=datetime.now())
        db.add(tweet_list)
        db.commit()
        return {"id": tweet_list.id, "name": tweet_list.name}


@router.delete("/lists/{list_id}")
def delete_list(list_id: str, current_user: str = Depends(get_current_user)):
    with SessionLocal() as db:
        user = _current_user(db, current_user)
        tweet_list = _owned_list(db, list_id, user.id)
        db.query(TweetListMember).filter(TweetListMember.list_id == list_id).delete()
        db.delete(tweet_list)
        db.commit()
        return {"deleted": True}


@router.get("/lists/{list_id}/members")
def get_list_members(list_id: str, current_user: str = Depends(get_current_user)):
    with SessionLocal() as db:
        user = _current_user(db, current_user)
        _owned_list(db, list_id, user.id)
        member_rows = db.query(TweetListMember).filter(TweetListMember.list_id == list_id).all()
        member_ids = [m.user_id for m in member_rows]
        members = db.query(User).filter(User.id.in_(member_ids)).all() if member_ids else []
        return [{"id": m.id, "username": m.username, "full_name": m.full_name} for m in members]


@router.post("/lists/{list_id}/members/{user_id}")
def add_list_member(list_id: str, user_id: str, current_user: str = Depends(get_current_user)):
    with SessionLocal() as db:
        owner = _current_user(db, current_user)
        _owned_list(db, list_id, owner.id)
        if db.query(TweetListMember).filter(TweetListMember.list_id == list_id, TweetListMember.user_id == user_id).first():
            raise HTTPException(status_code=400, detail="Already a member")
        db.add(TweetListMember(list_id=list_id, user_id=user_id))
        db.commit()
        return {"added": True}


@router.delete("/lists/{list_id}/members/{user_id}")
def remove_list_member(list_id: str, user_id: str, current_user: str = Depends(get_current_user)):
    with SessionLocal() as db:
        owner = _current_user(db, current_user)
        _owned_list(db, list_id, owner.id)
        member = db.query(TweetListMember).filter(TweetListMember.list_id == list_id, TweetListMember.user_id == user_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Not a member")
        db.delete(member)
        db.commit()
        return {"removed": True}
