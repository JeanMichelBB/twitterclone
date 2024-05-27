import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ComposeMessageForm.css';
import User from '../../UserModel';
import { UserData } from '../../pages/Profile/Profile';
import { apiKey, apiUrl } from '../../api';

interface ComposeMessageFormProps {
  user: User;
  refreshMessageList: (selectedUserId: string) => void;
}

const ComposeMessageForm: React.FC<ComposeMessageFormProps> = ({ user, refreshMessageList }) => {
  const [username, setUsername] = useState('');
  const [suggestions, setSuggestions] = useState<UserData[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<UserData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [message, setMessage] = useState<string>(''); // State to display error messages

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const [suggestionsMessage, setSuggestionsMessage] = useState<string>('');

  const generateSuggestion = () => {
    // one suggestion from faker
    const fakeSuggestion = 'Hey, what\'s up?';
    setSuggestionsMessage(fakeSuggestion);
  };

  useEffect(() => {
    // Fetch users when the component mounts
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${apiUrl}/users`, {
          headers: {
            'Accept': 'application/json',
            'access-token': apiKey
          }
        });
        const users: UserData[] = await response.json();
        setSuggestions(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    generateSuggestion();
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    // Filter suggestions based on the input value
    const filtered = suggestions.filter(user =>
      user.username.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (user: UserData) => {
    setUsername(user.username);
    setSelectedUser(user);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    generateSuggestion(); // Autofill textarea with a Faker sentence
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex(prevIndex =>
        prevIndex < filteredSuggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(prevIndex =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions.length > 0) {
        handleSuggestionClick(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      inputRef.current && !inputRef.current.contains(event.target as Node) &&
      suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
    ) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMessageChange = () => {
    setNewMessage(suggestionsMessage);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    if (!suggestionsMessage.includes(newMessage)) {
      setMessage('Please select a suggestion from the list');
      return; // Return without sending the message
    }

    try {
      const url = `${apiUrl}/messages`;
      const response = await axios.post(url, null, {
        headers: {
          'Accept': 'application/json',
          'access-token': apiKey
        },
        params: {
          sender_id: user.id,
          recipient_id: selectedUser.id,
          content: newMessage,
        }
      });
      console.log('Message sent successfully:', response.data);
      setNewMessage(''); // Clear the input field after sending the message
      refreshMessageList(selectedUser.id); // Pass the selected user's ID to the refresh function
      setUsername(''); // Clear the search input field
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally, handle errors and display a message to the user
    }
  };

  return (
    <div className="compose-message-container">
      <h2>Compose Message</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a user"
          value={username}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul className="suggestions-box" ref={suggestionsRef}>
            {filteredSuggestions.map((user, index) => (
              <li
                key={user.id}
                onClick={() => handleSuggestionClick(user)}
                className={highlightedIndex === index ? 'highlighted' : ''}
              >
                {user.username}
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedUser && (
        <div className="message-form">
          <textarea
            placeholder="Type your message"
            value={newMessage}
            onChange={handleMessageChange}
          ></textarea>
          <p className="error-message">{message}</p>
          <button onClick={handleSendMessage}>Send Message</button>
        </div>
      )}
    </div>
  );
};

export default ComposeMessageForm;
