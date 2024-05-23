from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import database_exists, create_database

SQLALCHEMY_DATABASE_URL = "mysql+pymysql://app:app@localhost/mydb"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_timeout=10,
    pool_recycle=1800
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def create_or_rebuild_database():
    if not database_exists(engine.url):
        create_database(engine.url)
        Base.metadata.create_all(bind=engine)
    else:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

create_or_rebuild_database()

def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def enforce_tweet_limit(mapper, connection, target):
    max_tweets = 80
    tweet_count = connection.execute(text('SELECT COUNT(*) FROM tweets')).scalar()
    if tweet_count >= max_tweets:
        oldest_tweet = connection.execute(text('SELECT id FROM tweets ORDER BY date_posted ASC LIMIT 1')).scalar()
        connection.execute(text('DELETE FROM tweets WHERE id = :id'), {'id': oldest_tweet})

def enforce_user_limit(mapper, connection, target):
    max_users = 11
    user_count = connection.execute(text('SELECT COUNT(*) FROM users')).scalar()
    if user_count >= max_users:
        oldest_user_id = connection.execute(text('SELECT id FROM users ORDER BY date_joined ASC LIMIT 1')).scalar()

        # Create a new session for the deletion operation
        Session = sessionmaker(bind=engine)
        session = Session()

        try:
            # Delete related records in the correct order
            session.execute(text('DELETE FROM followers WHERE user_id = :id OR follower_user_id = :id'), {'id': oldest_user_id})
            session.execute(text('DELETE FROM following WHERE user_id = :id OR following_user_id = :id'), {'id': oldest_user_id})
            session.execute(text('DELETE FROM likes WHERE user_id = :id'), {'id': oldest_user_id})
            session.execute(text('DELETE FROM retweets WHERE user_id = :id'), {'id': oldest_user_id})
            session.execute(text('DELETE FROM notifications WHERE user_id = :id OR actor_user_id = :id'), {'id': oldest_user_id})
            session.execute(text('DELETE FROM messages WHERE sender_user_id = :id OR recipient_user_id = :id'), {'id': oldest_user_id})
            session.execute(text('DELETE FROM tweets WHERE user_id = :id'), {'id': oldest_user_id})

            # Now delete the user
            session.execute(text('DELETE FROM users WHERE id = :id'), {'id': oldest_user_id})

            session.commit()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

def enforce_message_limit(mapper, connection, target):
    max_messages = 100
    message_count = connection.execute(text('SELECT COUNT(*) FROM messages')).scalar()
    if message_count >= max_messages:
        oldest_message = connection.execute(text('SELECT id FROM messages ORDER BY date_sent ASC LIMIT 1')).scalar()
        connection.execute(text('DELETE FROM messages WHERE id = :id'), {'id': oldest_message})

# Attach the event listeners to the corresponding models
from .models import Tweet, User, Message

event.listen(Tweet, 'after_insert', enforce_tweet_limit)
event.listen(User, 'after_insert', enforce_user_limit)
event.listen(Message, 'after_insert', enforce_message_limit)
