import React, { useEffect, useState } from 'react';
import axios from 'axios';
import User from '../../UserModel';

interface Message {
  id: string;
  sender_user_id: string;
  recipient_user_id: string;
  content: string;
  date_sent: string;
}

interface MessageListProps {
  User: User;
}

const MessageList: React.FC<MessageListProps> = ({ User }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get<Message[]>('http://127.0.0.1:8000/messages');
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div>
      <h2>Messages</h2>
      <ul>
        {messages.map(message => (
          <li key={message.id}>
            <strong>{message.sender_user_id}</strong>: {message.content} ({message.date_sent})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageList;
