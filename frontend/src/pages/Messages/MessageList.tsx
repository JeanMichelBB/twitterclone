import React, { useEffect, useState } from 'react';
import axios from 'axios';
import User from '../../UserModel';
import MessageProps from '../../components/Message/MessageProps';
import './MessageList.css'; // Import CSS file for styling
import ComposeMessageForm from '../../components/NewMessage/ComposeMessageForm';
import { UserData } from '../../pages/Profile/Profile';
import { faker } from '@faker-js/faker';
import { apiKey, apiUrl } from '../../api';

interface Message {
  id: string;
  sender_user_id: string;
  recipient_user_id: string;
  content: string;
  date_sent: string;
}

interface UserNames {
  username: string;
  full_name: string;
}

interface MessageListProps {
  user: User;
}

const MessageList: React.FC<MessageListProps> = ({ user }) => {
  const [userMessages, setUserMessages] = useState<{ [userId: string]: Message[] }>({});
  const [usernames, setUsernames] = useState<{ [userId: string]: UserNames }>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false); // State to control suggestion visibility
  const [suggestionSelected, setSuggestionSelected] = useState(false); // State to track if a suggestion is selected
  const [message, setMessage] = useState(''); // State to display error messages
  const [refresh, setRefresh] = useState(false); // State to trigger app refresh


  // Function to refresh the MessageList component
  const refreshMessageList = async (selectedUserId: string) => {
    setRefresh(prevRefresh => !prevRefresh);
    setSelectedUser(selectedUserId); // Set the selected user's ID
  };


  // Function to generate fake suggestions
  const generateSuggestions = () => {
    const fakeSuggestions: string[] = [];
    for (let i = 0; i < 5; i++) {
      fakeSuggestions.push(faker.lorem.sentence());

    }
    setSuggestions(fakeSuggestions);
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch list of users
        const usersResponse = await axios.get(`${apiUrl}/users`, {
          headers: {
            'Accept': 'application/json',
            'access-token': apiKey,
          },
        });
        const usersData: UserData[] = usersResponse.data;

        // Create a map of user IDs to usernames and full names
        const usersMap: { [userId: string]: UserNames } = {};
        usersData.forEach(user => {
          usersMap[user.id] = {
            username: user.username,
            full_name: user.full_name,
          };
        });
        setUsernames(usersMap);

        // Fetch messages
        const messagesResponse = await axios.get(`${apiUrl}/messages/${user.id}`, {
          headers: {
            'Accept': 'application/json',
            'access-token': apiKey,
          },
        });
        let messages: Message[] = messagesResponse.data;

        // Sort messages by date ascending
        messages = messages.sort((a, b) => new Date(a.date_sent).getTime() - new Date(b.date_sent).getTime());

        const groupedMessages = groupMessagesByUsers(messages);
        setUserMessages(groupedMessages);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    generateSuggestions();
    fetchData();

    // Cleanup function
    return () => {
      // Cleanup code if needed
    };
  }, [user.id, refresh]);

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

  // Function to find the latest message date for each user
  const getLatestMessageDate = (userId: string): Date | null => {
    const messages = userMessages[userId];
    if (messages && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      return new Date(latestMessage.date_sent);
    }
    return null;
  };

  // Sort the list of users based on the latest message date
  const sortedUserIds = Object.keys(usernames).sort((a, b) => {
    const dateA = getLatestMessageDate(a);
    const dateB = getLatestMessageDate(b);
    if (dateA && dateB) {
      return dateB.getTime() - dateA.getTime();
    }
    return 0;
  });

  const handleUserClick = (userId: string) => {
    setSelectedUser(userId === selectedUser ? null : userId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return; // Ignore empty messages or if no user is selected
    const finalContent = suggestionSelected ? newMessage : suggestions[0]; // Use suggestion content if selected, otherwise use the first suggestion

    // Check if finalContent matches the selected suggestion
    if (finalContent !== newMessage && !suggestions.includes(newMessage)) {
      setMessage('Invalid content selected');
      return;
    }

    const queryParams = new URLSearchParams({
      sender_id: user.id,
      recipient_id: selectedUser,
      content: newMessage,
    }).toString();
    try {
      const url = `${apiUrl}/messages?${queryParams}`;
      try {
        const response = await axios.post(url, null, {
          headers: {
            'Accept': 'application/json',
            'access-token': apiKey,
          },
      } );
        console.log('Message sent successfully:', response.data);
        setRefresh(prevRefresh => !prevRefresh); // Toggle refresh state to trigger app refresh
      }
      catch (error) {
        console.error('Error sending message:', error);
      }
      setNewMessage(''); // Clear the input field after sending the message
      setSuggestionSelected(false); // Reset suggestion selection
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally, handle errors and display a message to the user
    }
  }

  const filteredUsernames = sortedUserIds.filter(userId => userMessages[userId]);

  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion); // Set the message to the selected suggestion
    setShowSuggestions(false); // Hide suggestions when clicking on a suggestion
    setSuggestionSelected(true); // Mark a suggestion as selected
  }

  return (
    <div className="message-list-container">
      <div className="user-list">
        <ComposeMessageForm user={user} refreshMessageList={refreshMessageList} />
        <ul>
          {filteredUsernames.map(userId => (
            <li key={userId} onClick={() => handleUserClick(userId)} className={selectedUser === userId ? 'selected' : 'unselected'}>
              <div>{usernames[userId].full_name} </div>
              <div className='username'>@{usernames[userId].username}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="message-content-container">
        <div className="message-content">
          {selectedUser && userMessages[selectedUser] ? (
            <ul>
              {userMessages[selectedUser].map(message => (
                <li key={message.id}>
                  <MessageProps message={message} user={user} />
                </li>
              ))}
            </ul>
          ) : (
            <p>Select a user to view messages</p>
          )}

        </div>
        {selectedUser && (
          <div className="message-input-container">
            {showSuggestions && (
              <div className="suggestions-box">
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li key={index} onClick={() => handleSuggestionClick(suggestion)}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                readOnly={suggestionSelected} // Disable manual input when a suggestion is selected
                onFocus={() => setShowSuggestions(true)}
              />
            </div>
            <div className="send-button-container">
              <button onClick={handleSendMessage}>Send</button>
            </div>
            {message && <div className="error-message">{message}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
