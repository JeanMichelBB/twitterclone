# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "mysql+pymysql://app:app@localhost/mydb"

# Adjust the values according to your needs
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=10,          # Increase pool size
    max_overflow=20,       # Increase max overflow
    pool_timeout=60,       # Increase pool timeout to 60 seconds
    pool_recycle=1800      # Recycle connections every 1800 seconds (30 minutes)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Ensure tables are created if they don't exist already
Base.metadata.create_all(bind=engine)

# Function to get a new session
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
