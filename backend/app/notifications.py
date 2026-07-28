from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from .auth import get_current_user
from .database import SessionLocal
from .models import Notification, User

router = APIRouter()


def _actor_summary(db, actor_user_id: str):
    actor = db.query(User).filter(User.id == actor_user_id).first()
    if not actor:
        return {"id": actor_user_id, "username": "unknown", "full_name": None}
    return {"id": actor.id, "username": actor.username, "full_name": actor.full_name}


@router.get("/notifications")
def get_notifications(current_user: str = Depends(get_current_user)):
    with SessionLocal() as db:
        user = db.query(User).filter(User.username == current_user).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        rows = (
            db.query(Notification)
            .filter(Notification.user_id == user.id)
            .order_by(Notification.date_created.desc())
            .all()
        )
        return [
            {
                "id": n.id,
                "notification_type": n.notification_type,
                "actor": _actor_summary(db, n.actor_user_id),
                "tweet_id": n.tweet_id,
                "date_created": n.date_created,
                "read": n.read,
            }
            for n in rows
        ]


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str, current_user: str = Depends(get_current_user)):
    with SessionLocal() as db:
        user = db.query(User).filter(User.username == current_user).first()
        notification = (
            db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user.id)
            .first()
        )
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        notification.read = True
        db.commit()
        return {"read": True}


def create_notification(db, user_id: str, notification_type: str, actor_user_id: str, tweet_id: str | None):
    """Insert a notification row. Skip self-notifications (e.g. liking your own tweet)."""
    if user_id == actor_user_id:
        return
    db.add(
        Notification(
            user_id=user_id,
            notification_type=notification_type,
            actor_user_id=actor_user_id,
            tweet_id=tweet_id,
            date_created=datetime.now(),
            read=False,
        )
    )
