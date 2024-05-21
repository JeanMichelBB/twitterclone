# app/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import database_exists, create_database

SQLALCHEMY_DATABASE_URL = "mysql+pymysql://app:app@mysql/mydb"

# Adjust the values according to your needs
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=20,          # Increase pool size
    max_overflow=40,       # Increase max overflow
    pool_timeout=10,       # Increase pool timeout to 60 seconds
    pool_recycle=1800      # Recycle connections every 1800 seconds (30 minutes)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Function to create or rebuild the database
def create_or_rebuild_database():
    if not database_exists(engine.url):
        create_database(engine.url)
        Base.metadata.create_all(bind=engine)
    else:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

# Ensure tables are created if they don't exist already
create_or_rebuild_database()

# Function to get a new session
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
