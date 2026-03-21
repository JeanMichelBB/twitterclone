from datetime import datetime, timedelta
from faker import Faker
import random
import os
try:
    import requests as http_requests
except ImportError:
    http_requests = None
import json
from app.models import models, GifCache
from app.database import SessionLocal, engine
from app.auth import get_password_hash  # Import the get_password_hash function


def _fetch_giphy_urls(limit=30) -> list:
    """Fetch trending GIFs from Giphy. Returns list of {id, url, thumbnail, title} dicts."""
    api_key = os.environ.get("GIPHY_API_KEY", "")
    if not api_key or not http_requests:
        return []
    try:
        resp = http_requests.get(
            "https://api.giphy.com/v1/gifs/trending",
            params={"api_key": api_key, "limit": limit, "rating": "g"},
            timeout=5
        )
        data = resp.json()
        return [
            {
                "id": g["id"],
                "url": g["images"]["downsized"]["url"],
                "thumbnail": g["images"]["fixed_height_small"]["url"],
                "title": g.get("title", ""),
            }
            for g in data.get("data", [])
        ]
    except Exception:
        return []

def seed_data():
    # Create a Faker instance
    faker = Faker()

    # Fetch GIF URLs once — 1 API call total, reused for all tweets
    gif_data = _fetch_giphy_urls(30)   # list of {id, url, thumbnail, title}
    gif_urls = [g["url"] for g in gif_data]

    # Create a database session
    db = SessionLocal()

    try:
        # Clear existing data (order matters for foreign key constraints)
        db.query(models.CommentLike).delete()
        db.query(models.Comment).delete()
        db.query(models.Like).delete()
        db.query(models.Retweet).delete()
        db.query(models.Notification).delete()
        db.query(models.Message).delete()
        db.query(models.Following).delete()
        db.query(models.Follower).delete()
        db.query(models.Tweet).delete()
        db.query(models.User).delete()
        db.commit()

        # Pre-warm gif_cache so the app never needs to call Giphy on first load
        if gif_data:
            existing = db.query(GifCache).filter(GifCache.query == "__trending__").first()
            if existing:
                existing.data = json.dumps(gif_data)
                existing.fetched_at = datetime.utcnow()
            else:
                db.add(GifCache(
                    query="__trending__",
                    data=json.dumps(gif_data),
                    fetched_at=datetime.utcnow()
                ))
            db.commit()

        # Create users
        users = []
        num_users = 10  # Increase the number of users to 50
        for i in range(1, num_users + 1):
            # Generate random email and username using Faker
            email = faker.email()
            username = faker.user_name()
            
            # Hash the password using the same function used in signup
            hashed_password = get_password_hash("password")
            user = models.User(
                username=username,
                email=email,
                password=hashed_password,
                full_name=faker.name(),
                profile_picture=faker.image_url(placeholder_url="https://picsum.photos/{width}/{height}"), 
                bio=faker.sentence(),  # Generate random bio
                location=faker.city(),  # Generate random location
                website=faker.url(),  # Generate random website URL
                date_joined=datetime.utcnow() - timedelta(hours=4)  # Adjust date joined to 4 hours earlier
            )
            users.append(user)
            db.add(user)
        db.commit()  # Commit users first to ensure user IDs are available for other tables

        # Create tweets, followers, likes, retweets, notifications, and messages
        for i in range(1, num_users + 1):
            user = users[i-1]  # Get the user object from the list

            # Create tweets
            num_tweets = 10  # Increase the number of tweets per user to 10
            for idx in range(num_tweets):
                # 40% of tweets get media; of those, 50% GIF / 50% picture
                if random.random() < 0.4:
                    if gif_urls and random.random() < 0.5:
                        image_url = random.choice(gif_urls)
                    else:
                        image_url = f"https://picsum.photos/seed/{user.id[:8]}{idx}/600/400"
                else:
                    image_url = None
                tweet = models.Tweet(
                    user_id=user.id,
                    content=faker.text(),
                    image_url=image_url,
                    date_posted=datetime.utcnow() - timedelta(hours=random.randint(1, 72)),
                    num_likes=0,
                    num_retweets=0
                )
                db.add(tweet)

            db.flush()  # Make tweets visible to subsequent queries in this session

            # Create followers
            num_followers = 5  # Increase the number of followers per user to 5
            for j in range(1, num_followers + 1):
                follower_user = users[(i + j) % num_users]  # Ensure each user follows the next user in a circular manner
                follower = models.Follower(
                    user_id=user.id,
                    follower_user_id=follower_user.id
                )
                db.add(follower)
                
                # Create following
                following_user = users[(i + j) % num_users]  # Ensure each user follows the next user in a circular manner
                following = models.Following(
                    user_id=user.id,
                    following_user_id=following_user.id
                )
                db.add(following)

                # Create likes (40% chance per tweet of followed user)
                like_candidates = db.query(models.Tweet).filter_by(user_id=follower_user.id).all()
                liked_ids = {l.tweet_id for l in db.query(models.Like).filter_by(user_id=user.id).all()}
                for lt in like_candidates:
                    if random.random() < 0.4 and lt.id not in liked_ids:
                        db.add(models.Like(
                            user_id=user.id,
                            tweet_id=lt.id,
                            date_liked=datetime.utcnow() - timedelta(hours=random.randint(1, 48))
                        ))
                        lt.num_likes += 1
                        liked_ids.add(lt.id)

                # Create retweets (30% chance, pick a random tweet from the followed user)
                if random.random() < 0.3:
                    candidate_tweets = db.query(models.Tweet).filter_by(user_id=follower_user.id).all()
                    if candidate_tweets:
                        retweet_tweet = random.choice(candidate_tweets)
                        already_retweeted = db.query(models.Retweet).filter_by(
                            user_id=user.id, original_tweet_id=retweet_tweet.id
                        ).first()
                        if not already_retweeted:
                            retweet = models.Retweet(
                                user_id=user.id,
                                original_tweet_id=retweet_tweet.id,
                                date_retweeted=datetime.utcnow() - timedelta(hours=random.randint(1, 48))
                            )
                            db.add(retweet)
                            retweet_tweet.num_retweets += 1

                # Create comments (50% chance per followed user's tweet)
                comment_tweets = db.query(models.Tweet).filter_by(user_id=follower_user.id).all()
                for ct in comment_tweets:
                    if random.random() < 0.5:
                        comment = models.Comment(
                            user_id=user.id,
                            tweet_id=ct.id,
                            content=faker.sentence(),
                            date_posted=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
                            num_likes=0
                        )
                        db.add(comment)
                        db.flush()

                        # 40% chance to like someone else's comment on this tweet
                        other_comments = db.query(models.Comment).filter(
                            models.Comment.tweet_id == ct.id,
                            models.Comment.user_id != user.id
                        ).all()
                        for oc in other_comments:
                            if random.random() < 0.4:
                                already_liked = db.query(models.CommentLike).filter_by(
                                    user_id=user.id, comment_id=oc.id
                                ).first()
                                if not already_liked:
                                    db.add(models.CommentLike(
                                        user_id=user.id,
                                        comment_id=oc.id,
                                        date_liked=datetime.utcnow() - timedelta(hours=random.randint(1, 24))
                                    ))
                                    oc.num_likes += 1

                # Create notifications
                notification_tweet = db.query(models.Tweet).filter_by(user_id=follower_user.id).first()
                notification_actor_user = users[(i + j) % num_users]  # Ensure each user gets a notification from the next user in a circular manner
                if notification_tweet:
                    notification = models.Notification(
                        user_id=user.id,
                        notification_type="Like",
                        actor_user_id=notification_actor_user.id,
                        tweet_id=notification_tweet.id,
                        date_created=datetime.utcnow() - timedelta(hours=4),  # Adjust date joined to 4 hours earlier,
                        read=False
                    )
                    db.add(notification)

            # Create messages
            num_messages = 5  # Increase the number of messages per user to 5
            for _ in range(num_messages):
                recipient_user = users[(i + 1) % num_users]  # Ensure each message is sent to the next user in a circular manner
                message = models.Message(
                    sender_user_id=user.id,
                    recipient_user_id=recipient_user.id,
                    content=faker.text(),
                    date_sent=datetime.utcnow() - timedelta(hours=4), # Adjust date joined to 4 hours earlier,
                    read=False
                )
                db.add(message)

        # Commit changes
        db.commit()
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        # Close the database session
        db.close()

if __name__ == "__main__":
    seed_data()
