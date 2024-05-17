import datetime
from fastapi import APIRouter, Depends, HTTPException
from .database import SessionLocal
from .models import Like, User, Tweet
from pydantic import BaseModel

router = APIRouter()

# Show all tweets
@router.get("/tweets")
def get_tweets():
    db = SessionLocal()
    tweets = db.query(Tweet).all()
    tweet_list = []
    for tweet in tweets:
        tweet_info = {
            "id": tweet.id,
            "user_id": tweet.user_id,
            "content": tweet.content,
            "date_posted": tweet.date_posted,
            "num_likes": tweet.num_likes,
            "num_retweets": tweet.num_retweets
        }
        tweet_list.append(tweet_info)
    return tweet_list


# Show user tweets
@router.get("/tweets/{user_id}")
def get_user_tweets(user_id: str):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        tweets = db.query(Tweet).filter(Tweet.user_id == user_id).all()
        tweet_list = []
        for tweet in tweets:
            tweet_info = {
                "id": tweet.id,
                "user_id": tweet.user_id,
                "content": tweet.content,
                "date_posted": tweet.date_posted,
                "num_likes": tweet.num_likes,
                "num_retweets": tweet.num_retweets
            }
            tweet_list.append(tweet_info)
        return tweet_list
    else:
        raise HTTPException(status_code=404, detail="User not found")

# Create a tweet from a user
@router.post("/tweets")
def create_tweet(user_id: str, content: str, date_posted: str):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        tweet = Tweet(user_id=user_id, content=content, date_posted=date_posted)
        db.add(tweet)
        db.commit()
        db.refresh(tweet)
        return tweet
    else:
        raise HTTPException(status_code=404, detail="User not found")
    
# Delete a tweet
@router.delete("/tweets/{tweet_id}")
def delete_tweet(tweet_id: str):
    db = SessionLocal()
    tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if tweet:
        db.delete(tweet)
        db.commit()
        return {"message": "Tweet deleted"}
    else:
        raise HTTPException(status_code=404, detail="Tweet not found")
    
# like a tweet
@router.post("/tweets/like")
def like_tweet( user_id: str, tweet_id: str):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if user and tweet:
        like = db.query(Like).filter(Like.user_id == user_id, Like.tweet_id == tweet_id).first()
        if like:
            raise HTTPException(status_code=400, detail="Like already exists")
        tweet.num_likes += 1
        like = Like(user_id=user_id, tweet_id=tweet_id, date_liked=datetime.datetime.now())
        db.add(like)
        db.commit()
        db.refresh(tweet)
        return tweet
    else:
        raise HTTPException(status_code=404, detail="User or tweet not found")


# unlike a tweet
@router.post("/tweets/unlike")
def unlike_tweet(user_id: str, tweet_id: str):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if user and tweet:
        like = db.query(Like).filter(Like.user_id == user_id, Like.tweet_id == tweet_id).first()
        if like:
            tweet.num_likes -= 1
            db.delete(like)
            db.commit()
            db.refresh(tweet)
            return tweet
        else:
            raise HTTPException(status_code=404, detail="Like not found")
    else:
        raise HTTPException(status_code=404, detail="User or tweet not found")

# get user likes
@router.get("/tweets/likes/{user_id}")
def get_user_likes(user_id: str):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        likes = db.query(Like).filter(Like.user_id == user_id).all()
        like_list = []
        for like in likes:
            tweet = db.query(Tweet).filter(Tweet.id == like.tweet_id).first()
            like_info = {
                "id": like.id,
                "user_id": like.user_id,
                "tweet_id": like.tweet_id,
                "date_liked": like.date_liked,
                "tweet_content": tweet.content
            }
            like_list.append(like_info)
        return like_list
    else:
        raise HTTPException(status_code=404, detail="User not found")