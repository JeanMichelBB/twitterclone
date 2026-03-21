import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .database import SessionLocal
from .models import Comment, CommentLike, Tweet, User

router = APIRouter()

class CommentCreate(BaseModel):
    user_id: str
    content: str

# Get comments for a tweet
@router.get("/tweets/{tweet_id}/comments")
def get_comments(tweet_id: str):
    with SessionLocal() as db:
        comments = db.query(Comment).filter(Comment.tweet_id == tweet_id).order_by(Comment.date_posted.asc()).all()
        result = []
        for c in comments:
            user = db.query(User).filter(User.id == c.user_id).first()
            result.append({
                "id": c.id,
                "user_id": c.user_id,
                "tweet_id": c.tweet_id,
                "content": c.content,
                "date_posted": c.date_posted,
                "num_likes": c.num_likes,
                "username": user.username if user else "Unknown",
                "full_name": user.full_name if user else "Unknown",
                "profile_picture": f"https://i.pravatar.cc/150?u={user.id}" if user else "",
            })
        return result

# Create a comment
@router.post("/tweets/{tweet_id}/comments")
def create_comment(tweet_id: str, body: CommentCreate):
    with SessionLocal() as db:
        tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
        if not tweet:
            raise HTTPException(status_code=404, detail="Tweet not found")
        comment = Comment(
            user_id=body.user_id,
            tweet_id=tweet_id,
            content=body.content,
            date_posted=datetime.datetime.now(),
            num_likes=0,
        )
        db.add(comment)
        db.commit()
        user = db.query(User).filter(User.id == body.user_id).first()
        return {
            "id": comment.id,
            "user_id": comment.user_id,
            "tweet_id": comment.tweet_id,
            "content": comment.content,
            "date_posted": comment.date_posted,
            "num_likes": comment.num_likes,
            "username": user.username if user else "Unknown",
            "full_name": user.full_name if user else "Unknown",
            "profile_picture": f"https://i.pravatar.cc/150?u={user.id}" if user else "",
        }

# Delete a comment
@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: str):
    with SessionLocal() as db:
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        db.delete(comment)
        db.commit()
        return {"message": "Comment deleted"}

# Like a comment
@router.post("/comments/like")
def like_comment(user_id: str, comment_id: str):
    with SessionLocal() as db:
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        if db.query(CommentLike).filter(CommentLike.user_id == user_id, CommentLike.comment_id == comment_id).first():
            raise HTTPException(status_code=400, detail="Already liked")
        comment.num_likes += 1
        db.add(CommentLike(user_id=user_id, comment_id=comment_id, date_liked=datetime.datetime.now()))
        db.commit()
        return {"num_likes": comment.num_likes}

# Unlike a comment
@router.post("/comments/unlike")
def unlike_comment(user_id: str, comment_id: str):
    with SessionLocal() as db:
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        like = db.query(CommentLike).filter(CommentLike.user_id == user_id, CommentLike.comment_id == comment_id).first()
        if not like:
            raise HTTPException(status_code=404, detail="Like not found")
        comment.num_likes -= 1
        db.delete(like)
        db.commit()
        return {"num_likes": comment.num_likes}

# Get user's comment likes
@router.get("/comments/likes/{user_id}")
def get_user_comment_likes(user_id: str):
    with SessionLocal() as db:
        likes = db.query(CommentLike).filter(CommentLike.user_id == user_id).all()
        return [{"comment_id": l.comment_id} for l in likes]
