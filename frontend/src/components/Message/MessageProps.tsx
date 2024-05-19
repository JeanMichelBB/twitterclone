import React from 'react';
import User from '../../UserModel';
import './MessageProps.css'; // Import your CSS file

interface MessageProps {
  message: {
    recipient_user_id: string;
    sender_user_id: string;
    content: string;
    date_sent: string;
  };
  user: User;
}

const Message: React.FC<MessageProps> = ({ message, user }) => {
  const isCurrentUser = message.sender_user_id === user.id;

  return (
    <div className={`message-container ${isCurrentUser ? 'user-right' : 'user-left'}`}>
      <div className="message-content">
        <div className={`message ${isCurrentUser ? 'current-user' : ''}`}>
          <div>{message.content}</div>
        </div>
      </div>
    </div>
  );
};

export default Message;
