import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Message from '../../components/Message/Message';
import User from '../../UserModel';

interface MessagesProps {
  user: User;
}

const Messages: React.FC<MessagesProps> = ({ user }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/messages/${user.id}`);
        if (response.status === 200) {
          setMessages(response.data);
        } else {
          console.error('Error fetching messages:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    const fetchUsernames = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/users');
        if (response.status === 200) {
          setUsers(response.data);
        } else {
          console.error('Error fetching usernames:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    };

    fetchMessages();
    fetchUsernames();
  }, [user.id]);

  const handleSelectMessage = (message: any) => {
    setSelectedMessage(message);
  };

  const getUsernameById = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? user.username : 'Unknown User';
  };

  const getUsernameByMessage = (message: any) => {
    if (message.sender_user_id === user.id) {
      return getUsernameById(message.recipient_user_id);
    } else if (message.recipient_user_id === user.id) {
      return getUsernameById(message.sender_user_id);
    }
    return 'Unknown User';
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%', paddingRight: '20px' }}>
        <h2>List of Messages</h2>
        <ul>
          {messages.map((message: any) => (
            <li key={message.id} onClick={() => handleSelectMessage(message)}>
              {getUsernameByMessage(message)}
            </li>
          ))}
        </ul>
        {messages.length === 0 && <p>No messages found.</p>}
      </div>
      <div style={{ width: '50%' }}>
        <div>
          <h2>Selected Message</h2>
          {selectedMessage && <Message content={selectedMessage.content} />}
        </div>
      </div>
    </div>
  );
};

export default Messages;
