import React from 'react';

interface MessageProps {
  message: {
    sender_user_id: string;
    content: string;
    date_sent: string;
  };
}

const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div>
      <strong>{message.sender_user_id}</strong>: {message.content} ({message.date_sent})
    </div>
  );
};

export default Message;
