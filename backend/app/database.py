import os
import pathlib
import subprocess
import time

from dotenv import load_dotenv
from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.exc import OperationalError

load_dotenv(pathlib.Path(__file__).parents[1] / ".env")

MYSQL_DB = os.getenv("MYSQL_DB", "mysql")
MYSQL_USER = os.getenv("MYSQL_USER", "app")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "app")
MYSQL_ROOT_PASSWORD = os.getenv("MYSQL_ROOT_PASSWORD", "root")
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_DB}/twitter_db"


def run_dev_sh():
    """Start MySQL via dev.sh (local dev only)."""
    dev_script = pathlib.Path(__file__).parents[1] / "dev.sh"
    if dev_script.exists():
        print("Running dev.sh to start MySQL...")
        subprocess.run(["bash", str(dev_script)], check=False)


def provision_mysql():
    """Create the app user and database using the root account."""
    import pymysql
    try:
        conn = pymysql.connect(host=MYSQL_DB, user="root", password=MYSQL_ROOT_PASSWORD)
        with conn.cursor() as cur:
            cur.execute("CREATE DATABASE IF NOT EXISTS twitter_db")
            cur.execute(
                f"CREATE USER IF NOT EXISTS '{MYSQL_USER}'@'%' IDENTIFIED BY '{MYSQL_PASSWORD}'"
            )
            cur.execute(
                f"GRANT ALL PRIVILEGES ON twitter_db.* TO '{MYSQL_USER}'@'%'"
            )
            cur.execute("FLUSH PRIVILEGES")
        conn.close()
        print(f"Provisioned user '{MYSQL_USER}' and database 'twitter_db'.")
    except Exception as e:
        print(f"WARNING: Could not provision MySQL user/db: {e}")


run_dev_sh()
provision_mysql()

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_timeout=10,
    pool_recycle=1800,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)
Base = declarative_base()


def wait_for_db():
    max_retries = 3
    retry_interval = 2
    for attempt in range(1, max_retries + 1):
        try:
            with engine.connect() as connection:
                print(f"Database is up and running! (host={MYSQL_DB})")
                return
        except OperationalError as e:
            if attempt < max_retries:
                print(f"DB not ready (attempt {attempt}/{max_retries}, host={MYSQL_DB}): {e}. Retrying in {retry_interval}s...")
                time.sleep(retry_interval)
            else:
                print(f"ERROR: Could not connect to database at '{MYSQL_DB}' after {max_retries} attempts. Is MySQL running?")
                raise SystemExit(1)


wait_for_db()


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

