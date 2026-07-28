from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from .auth import get_current_user
from .database import SessionLocal
from .models import Bookmark, Tweet, User

router = APIRouter()


def _current_user(db, current_user: str) -> User:
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/bookmarks")
def get_bookmarks(current_user: str = Depends(get_current_user)):
    with SessionLocal() as db:
        user = _current_user(db, current_user)
        bookmarks = db.query(Bookmark).filter(Bookmark.user_id == user.id).order_by(Bookmark.date_bookmarked.desc()).all()
        tweet_ids = [b.tweet_id for b in bookmarks]
        tweets = db.query(Tweet).filter(Tweet.id.in_(tweet_ids)).all() if tweet_ids else []
        tweets_by_id = {t.id: t for t in tweets}
        return [
            {
                "id": t.id,
                "user_id": t.user_id,
                "content": t.content,
                "image_url": t.image_url,
                "date_posted": t.date_posted,
                "num_likes": t.num_likes,
                "num_retweets": t.num_retweets,
            }
            for b in bookmarks
            if (t := tweets_by_id.get(b.tweet_id)) is not None
        ]


@router.post("/bookmarks/{tweet_id}")
def add_bookmark(tweet_id: str, current_user: str = Depends(get_current_user)):
    with SessionLocal() as db:
        user = _current_user(db, current_user)
        tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
        if not tweet:
            raise HTTPException(status_code=404, detail="Tweet not found")
        if db.query(Bookmark).filter(Bookmark.user_id == user.id, Bookmark.tweet_id == tweet_id).first():
            raise HTTPException(status_code=400, detail="Already bookmarked")
        db.add(Bookmark(user_id=user.id, tweet_id=tweet_id, date_bookmarked=datetime.now()))
        db.commit()
        return {"bookmarked": True}


@router.delete("/bookmarks/{tweet_id}")
def remove_bookmark(tweet_id: str, current_user: str = Depends(get_current_user)):
    with SessionLocal() as db:
        user = _current_user(db, current_user)
        bookmark = db.query(Bookmark).filter(Bookmark.user_id == user.id, Bookmark.tweet_id == tweet_id).first()
        if not bookmark:
            raise HTTPException(status_code=404, detail="Bookmark not found")
        db.delete(bookmark)
        db.commit()
        return {"bookmarked": False}
