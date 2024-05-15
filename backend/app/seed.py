from datetime import datetime
from faker import Faker
from app.models import models
from app.database import SessionLocal, engine
from app.auth import get_password_hash  # Import the get_password_hash function

def seed_data():
    # Create a Faker instance
    faker = Faker()

    # Create a database session
    db = SessionLocal()

    try:
        # Create users
        users = []
        for i in range(1, 6):
            # Hash the password using the same function used in signup
            hashed_password = get_password_hash(f"password{i}")
            user = models.User(
                username=f"user{i}",
                email=f"user{i}@example.com",
                password=hashed_password,
                full_name=faker.name(),
                profile_picture=faker.image_url(),  # Generate random profile picture URL
                bio=faker.sentence(),  # Generate random bio
                location=faker.city(),  # Generate random location
                website=faker.url(),  # Generate random website URL
                date_joined=datetime.utcnow()
            )
            users.append(user)
            db.add(user)
        db.commit()  # Commit users first to ensure user IDs are available for other tables

        # Create tweets, followers, likes, retweets, notifications, and messages
        for i in range(1, 6):
            user = users[i-1]  # Get the user object from the list

            # Create tweets
            tweet = models.Tweet(
                user_id=user.id,
                content=faker.text(),
                date_posted=datetime.utcnow(),
                num_likes=0,
                num_retweets=0
            )
            db.add(tweet)
            db.commit()  # Commit tweet to ensure tweet ID is available for other tables

            # Create followers
            follower_user = users[(i % 5) - 1]  # Ensure each user follows the next user in a circular manner
            follower = models.Follower(
                user_id=user.id,
                follower_user_id=follower_user.id
            )
            db.add(follower)

            # Create likes
            like_tweet = db.query(models.Tweet).filter_by(user_id=follower_user.id).first()
            if like_tweet:
                like = models.Like(
                    user_id=user.id,
                    tweet_id=like_tweet.id,
                    date_liked=datetime.utcnow()
                )
                db.add(like)

            # Create retweets
            retweet_tweet = db.query(models.Tweet).filter_by(user_id=follower_user.id).first()
            if retweet_tweet:
                retweet = models.Retweet(
                    user_id=user.id,
                    original_tweet_id=retweet_tweet.id,
                    date_retweeted=datetime.utcnow()
                )
                db.add(retweet)

            # Create notifications
            notification_tweet = db.query(models.Tweet).filter_by(user_id=follower_user.id).first()
            notification_actor_user = users[i % 5]  # Ensure each user gets a notification from the next user in a circular manner
            if notification_tweet:
                notification = models.Notification(
                    user_id=user.id,
                    notification_type="Like",
                    actor_user_id=notification_actor_user.id,
                    tweet_id=notification_tweet.id,
                    date_created=datetime.utcnow(),
                    read=False
                )
                db.add(notification)

            # Create messages
            recipient_user = users[(i % 5)]  # Ensure each message is sent to the next user in a circular manner
            message = models.Message(
                sender_user_id=user.id,
                recipient_user_id=recipient_user.id,
                content=faker.text(),
                date_sent=datetime.utcnow(),
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
