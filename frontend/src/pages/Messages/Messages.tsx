import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TwoColumnLayout from '../../TwoColumnLayout';

interface Message {
  id: string;
  senderUserId: string;
  recipientUserId: string;
  content: string;
  dateSent: string;
  read: boolean;
}

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);


  useEffect(() => {
    // Fetch messages from your FastAPI backend
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/messages');
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  return (
        <TwoColumnLayout
        leftContent={
            <>
                <div>

      <h1>Messages</h1>
      <table>
        <thead>
          <tr>
            <th>Sender</th>
            <th>Recipient</th>
            <th>Content</th>
            <th>Date Sent</th>
            <th>Read</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr key={message.id}>
              <td>{message.senderUserId}</td>
              <td>{message.recipientUserId}</td>
              <td>{message.content}</td>
              <td>{message.dateSent}</td>
              <td>{message.read ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
        }
        rightContent={
            <>

            </>
        }
        />
    );
};

export default Messages;
