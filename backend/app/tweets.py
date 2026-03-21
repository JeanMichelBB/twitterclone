import datetime
from fastapi import APIRouter, Depends, HTTPException
from .database import SessionLocal
from .models import Comment, Like, Retweet, User, Tweet
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

def tweet_dict(t, db, retweeted_by_user_id=None, date_override=None):
    return {
        "id": t.id,
        "user_id": t.user_id,
        "content": t.content,
        "image_url": t.image_url,
        "date_posted": date_override if date_override else t.date_posted,
        "num_likes": t.num_likes,
        "num_retweets": t.num_retweets,
        "num_comments": db.query(Comment).filter(Comment.tweet_id == t.id).count(),
        "retweeted_by_user_id": retweeted_by_user_id,
    }

class TweetCreate(BaseModel):
    user_id: str
    content: str
    date_posted: str
    image_url: Optional[str] = None

# Show all tweets
@router.get("/tweets")
def get_tweets():
    with SessionLocal() as db:
        tweets = db.query(Tweet).all()
        result = [tweet_dict(t, db) for t in tweets]
        retweets = db.query(Retweet).all()
        for rt in retweets:
            original = db.query(Tweet).filter(Tweet.id == rt.original_tweet_id).first()
            if original:
                result.append(tweet_dict(original, db, retweeted_by_user_id=rt.user_id, date_override=rt.date_retweeted))
        return result

# Get a single tweet by ID
@router.get("/tweet/{tweet_id}")
def get_tweet(tweet_id: str):
    with SessionLocal() as db:
        tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
        if not tweet:
            raise HTTPException(status_code=404, detail="Tweet not found")
        return tweet_dict(tweet, db)

# Show user tweets
@router.get("/tweets/{user_id}")
def get_user_tweets(user_id: str):
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        tweets = db.query(Tweet).filter(Tweet.user_id == user_id).all()
        result = [tweet_dict(t, db) for t in tweets]
        retweets = db.query(Retweet).filter(Retweet.user_id == user_id).all()
        for rt in retweets:
            original = db.query(Tweet).filter(Tweet.id == rt.original_tweet_id).first()
            if original:
                result.append(tweet_dict(original, db, retweeted_by_user_id=rt.user_id, date_override=rt.date_retweeted))
        return result

# Create a tweet from a user
@router.post("/tweets")
def create_tweet(body: TweetCreate):
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == body.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        tweet = Tweet(user_id=body.user_id, content=body.content, date_posted=body.date_posted, image_url=body.image_url)
        db.add(tweet)
        db.commit()
        return tweet_dict(tweet, db)

# Delete a tweet
@router.delete("/tweets/{tweet_id}")
def delete_tweet(tweet_id: str):
    with SessionLocal() as db:
        tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
        if not tweet:
            raise HTTPException(status_code=404, detail="Tweet not found")
        db.delete(tweet)
        db.commit()
        return {"message": "Tweet deleted"}

# like a tweet
@router.post("/tweets/like")
def like_tweet(user_id: str, tweet_id: str):
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
        if not user or not tweet:
            raise HTTPException(status_code=404, detail="User or tweet not found")
        if db.query(Like).filter(Like.user_id == user_id, Like.tweet_id == tweet_id).first():
            raise HTTPException(status_code=400, detail="Like already exists")
        tweet.num_likes += 1
        db.add(Like(user_id=user_id, tweet_id=tweet_id, date_liked=datetime.datetime.now()))
        db.commit()
        return {"num_likes": tweet.num_likes}

# unlike a tweet
@router.post("/tweets/unlike")
def unlike_tweet(user_id: str, tweet_id: str):
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
        if not user or not tweet:
            raise HTTPException(status_code=404, detail="User or tweet not found")
        like = db.query(Like).filter(Like.user_id == user_id, Like.tweet_id == tweet_id).first()
        if not like:
            raise HTTPException(status_code=404, detail="Like not found")
        tweet.num_likes -= 1
        db.delete(like)
        db.commit()
        return {"num_likes": tweet.num_likes}

# retweet a tweet
@router.post("/tweets/retweet")
def retweet_tweet(user_id: str, tweet_id: str):
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
        if not user or not tweet:
            raise HTTPException(status_code=404, detail="User or tweet not found")
        if db.query(Retweet).filter(Retweet.user_id == user_id, Retweet.original_tweet_id == tweet_id).first():
            raise HTTPException(status_code=400, detail="Retweet already exists")
        tweet.num_retweets += 1
        db.add(Retweet(user_id=user_id, original_tweet_id=tweet_id, date_retweeted=datetime.datetime.now()))
        db.commit()
        return {"num_retweets": tweet.num_retweets}

# unretweet a tweet
@router.post("/tweets/unretweet")
def unretweet_tweet(user_id: str, tweet_id: str):
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
        if not user or not tweet:
            raise HTTPException(status_code=404, detail="User or tweet not found")
        retweet = db.query(Retweet).filter(Retweet.user_id == user_id, Retweet.original_tweet_id == tweet_id).first()
        if not retweet:
            raise HTTPException(status_code=404, detail="Retweet not found")
        tweet.num_retweets -= 1
        db.delete(retweet)
        db.commit()
        return {"num_retweets": tweet.num_retweets}

# get user retweets
@router.get("/tweets/retweets/{user_id}")
def get_user_retweets(user_id: str):
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        retweets = db.query(Retweet).filter(Retweet.user_id == user_id).all()
        return [{"tweet_id": r.original_tweet_id} for r in retweets]

# get user likes
@router.get("/tweets/likes/{user_id}")
def get_user_likes(user_id: str):
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        likes = db.query(Like).filter(Like.user_id == user_id).all()
        return [{"id": l.id, "user_id": l.user_id, "tweet_id": l.tweet_id, "date_liked": l.date_liked} for l in likes]
