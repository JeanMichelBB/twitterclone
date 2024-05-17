from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Message, User
from datetime import datetime

router = APIRouter()

from datetime import datetime, timedelta

@router.post("/messages")
def send_message(sender_id: str, recipient_id: str, content: str):
    # Check if sender and recipient exist
    db = SessionLocal()
    sender = db.query(User).filter(User.id == sender_id).first()
    recipient = db.query(User).filter(User.id == recipient_id).first()

    if not sender or not recipient:
        return {"message": "Sender or recipient not found"}

    # Subtract 4 hours from the current UTC time
    date_sent = datetime.utcnow() - timedelta(hours=4)

    # Create and save the message
    message = Message(sender_user_id=sender_id, recipient_user_id=recipient_id, content=content, date_sent=date_sent)
    db.add(message)
    db.commit()
    return {"message": "Message sent successfully"}


@router.get("/messages/{user_id}")
def get_messages(user_id: str):
    db = SessionLocal()
    messages_sent = db.query(Message).filter(Message.sender_user_id == user_id).all()
    messages_received = db.query(Message).filter(Message.recipient_user_id == user_id).all()

    all_messages = messages_sent + messages_received
    all_messages.sort(key=lambda x: x.date_sent, reverse=True)  # Sort messages by date_sent in descending order

    return all_messages

@router.delete("/messages/{message_id}")
def delete_message(message_id: str, db: Session = Depends(SessionLocal)):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        return {"message": "Message not found"}
    
    db.delete(message)
    db.commit()
    return {"message": "Message deleted successfully"}
