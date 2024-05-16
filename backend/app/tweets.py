from fastapi import APIRouter, Depends, HTTPException
from .database import SessionLocal
from .models import User, Tweet

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
    