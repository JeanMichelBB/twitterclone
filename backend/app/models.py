# app/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from uuid import uuid4

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()), unique=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)  # Assuming hashed password is stored
    full_name = Column(String(100))
    profile_picture = Column(String(255))
    bio = Column(String(255))
    location = Column(String(100))
    website = Column(String(255))
    # i need to put like that: 2024-05-12T10:14:08.476Z
    date_joined = Column(DateTime)

class Tweet(Base):
    __tablename__ = "tweets"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()), unique=True)
    user_id = Column(String(36), ForeignKey('users.id'))
    content = Column(String(280), nullable=False)
    date_posted = Column(DateTime)
    num_likes = Column(Integer, default=0)
    num_retweets = Column(Integer, default=0)

class Follower(Base):
    __tablename__ = "followers"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()), unique=True)
    user_id = Column(String(36), ForeignKey('users.id'))
    follower_user_id = Column(String(36), ForeignKey('users.id'))

class Like(Base):
    __tablename__ = "likes"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()), unique=True)
    user_id = Column(String(36), ForeignKey('users.id'))
    tweet_id = Column(String(36), ForeignKey('tweets.id'))
    date_liked = Column(DateTime)

class Retweet(Base):
    __tablename__ = "retweets"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()), unique=True)
    user_id = Column(String(36), ForeignKey('users.id'))
    original_tweet_id = Column(String(36), ForeignKey('tweets.id'))
    date_retweeted = Column(DateTime)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()), unique=True)
    user_id = Column(String(36), ForeignKey('users.id'))
    notification_type = Column(String(20))  # e.g., Mention, Like, Retweet
    actor_user_id = Column(String(36), ForeignKey('users.id'))
    tweet_id = Column(String(36), ForeignKey('tweets.id'))
    date_created = Column(DateTime)
    read = Column(Boolean, default=False)

class Message(Base):
    __tablename__ = "messages"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()), unique=True)
    sender_user_id = Column(String(36), ForeignKey('users.id'))
    recipient_user_id = Column(String(36), ForeignKey('users.id'))
    content = Column(String(280), nullable=False)
    date_sent = Column(DateTime)
    read = Column(Boolean, default=False)

class models:
    User = User
    Tweet = Tweet
    Follower = Follower
    Like = Like
    Retweet = Retweet
    Notification = Notification
    Message = Message