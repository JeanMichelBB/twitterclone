import React, { useEffect, useState } from 'react';
import axios from 'axios';
import User from '../../UserModel';
import MessageProps from '../../components/Message/MessageProps';
import './MessageList.css'; // Import CSS file for styling
import ComposeMessageForm from '../../components/NewMessage/ComposeMessageForm';

interface Message {
  id: string;
  sender_user_id: string;
  recipient_user_id: string;
  content: string;
  date_sent: string;
}

interface UserData {
  id: string;
  username: string;
}

interface MessageListProps {
  user: User;
}

const MessageList: React.FC<MessageListProps> = ({ user }) => {
  const [userMessages, setUserMessages] = useState<{ [userId: string]: Message[] }>({});
  const [usernames, setUsernames] = useState<{ [userId: string]: string }>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch list of users
        const usersResponse = await axios.get('http://127.0.0.1:8000/users');
        const usersData: UserData[] = usersResponse.data;
    
        // Create a map of user IDs to usernames
        const usersMap: { [userId: string]: string } = {};
        usersData.forEach(user => {
          usersMap[user.id] = user.username;
        });
        setUsernames(usersMap);
    
        // Fetch messages
        const messagesResponse = await axios.get(`http://127.0.0.1:8000/messages/${user.id}`);
        let messages: Message[] = messagesResponse.data;
    
        // Sort messages by date ascending
        messages = messages.sort((a, b) => new Date(a.date_sent).getTime() - new Date(b.date_sent).getTime());
    
        const groupedMessages = groupMessagesByUsers(messages);
        setUserMessages(groupedMessages);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      // Cleanup code if needed
    };
  }, [user.id]);

  const groupMessagesByUsers = (messages: Message[]): { [userId: string]: Message[] } => {
    const groupedMessages: { [userId: string]: Message[] } = {};
    messages.forEach(message => {
      const userId = user.id === message.sender_user_id ? message.recipient_user_id : message.sender_user_id;
      if (!groupedMessages[userId]) {
        groupedMessages[userId] = [];
      }
      groupedMessages[userId].push(message);
    });
    return groupedMessages;
  };

  const handleUserClick = (userId: string) => {
    setSelectedUser(userId === selectedUser ? null : userId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return; // Ignore empty messages or if no user is selected
    try {
      const url = `http://127.0.0.1:8000/messages?sender_id=${user.id}&recipient_id=${selectedUser}&content=${encodeURIComponent(newMessage)}`;
      await axios.post(url);
      // Optionally, update the UI to reflect the new message
      setNewMessage(''); // Clear the input field after sending the message
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally, handle errors and display a message to the user
    }
  };

  const filteredUsernames = Object.keys(usernames).filter(userId => userMessages[userId]);

  return (
    <div className="message-list-container">
      <div className="user-list">
        <h2>Usernames</h2>
        <ComposeMessageForm user={user} />
        <ul>
          {filteredUsernames.map(userId => (
            <li key={userId} onClick={() => handleUserClick(userId)} className={selectedUser === userId ? 'selected' : ''}>
              {usernames[userId]}
            </li>
          ))}
        </ul>
      </div>
      <div className="message-content">
        {selectedUser && userMessages[selectedUser] ? (
          <ul>
            {userMessages[selectedUser].reverse().map(message => (
              <li key={message.id}>
                <MessageProps message={message} user={user}/>
              </li>
            ))}
          </ul>
        ) : (
          <p>Select a user to view messages</p>
        )}
      </div>
      {selectedUser && (
        <div className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default MessageList;
