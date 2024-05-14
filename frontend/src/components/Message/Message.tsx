// src/components/Message/Message.tsx
import React from 'react';

interface MessageProps {
  content: string;
}

const Message: React.FC<MessageProps> = ({ content }) => {
  return (
    <div>
      <h3>Message</h3>
      {content ? (
        <p>{content}</p>
      ) : (
        <p>No message selected.</p>
      )}
    </div>
  );
};

export default Message;
