// src/components/CreateTweet/CreateTweet.tsx
import React, { useState, useRef, useEffect } from 'react';
import './CreateTweet.css';
import User from '../../UserModel';
import { faker } from '@faker-js/faker';

interface ProfileProps {
  user: User;
  onNewTweet: () => void;
}

const CreateTweet: React.FC<ProfileProps> = ({ user, onNewTweet }) => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionSelected, setSuggestionSelected] = useState(false);

  const generateSuggestions = () => {
    const fakeSuggestions: string[] = [];
    for (let i = 0; i < 5; i++) {
      fakeSuggestions.push(faker.lorem.sentence());
    }
    setSuggestions(fakeSuggestions);
  };

  useEffect(() => {
    generateSuggestions();
  }, []);

  const getCurrentDateTime = (): string => {
    const now = new Date();
    now.setHours(now.getHours() - 4); // Adjust for UTC time zone
    return now.toISOString().slice(0, 16); // Format as 'YYYY-MM-DDTHH:MM'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const datePosted = getCurrentDateTime();
    const finalContent = suggestionSelected ? content : suggestions[0];

    if (finalContent !== content && !suggestions.includes(content)) {
      setMessage('Invalid content selected');
      return;
    }

    const queryParams = new URLSearchParams({
      user_id: user.id,
      content: finalContent,
      date_posted: datePosted
    }).toString();

    const url = `http://10.0.0.55:8000/tweets?${queryParams}`;
    console.log('Request URL:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setMessage('Tweet created successfully');
        setContent('');
        setSuggestionSelected(false);
        onNewTweet(); // Call the function passed via props to notify parent component
        console.log(message);
      } else {
        const errorData = await response.json();
        console.error('Error data:', errorData);
        const detailedMessage = errorData.detail.map((err: any) => `${err.msg} (field: ${err.loc[1]})`).join(', ');
        setMessage(detailedMessage || 'Failed to create tweet');
      }
    } catch (error) {
      console.error('Error creating tweet:', error);
      setMessage('An error occurred');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setContent(suggestion);
    setShowSuggestions(false);
    setSuggestionSelected(true);
  };

  const handleButtonClick = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="create-tweet">
      <div className="create-tweet-header">
        <h4></h4>
        <h4>For you</h4>
        <h4>Following</h4>
        <h4>...</h4>
      </div>
      <div className="create-tweet-body">
        <img src={user.profile_picture} alt="Profile" />
        <form ref={formRef} onSubmit={handleSubmit}>
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              required
              readOnly={suggestionSelected}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && (
             <div className="suggestions-box">
             <ul>
               {suggestions.map((suggestion, index) => (
                 <li key={index} onClick={() => handleSuggestionClick(suggestion)}>{suggestion}</li>
               ))}
             </ul>
           </div>
           
            )}
          </div>
        </form>
      </div>
      <div className="create-tweet-footer">
        <p>&#9744;</p>
        <p>&#9786;</p>
        <p>&#9872;</p>
        <p>&#9881;</p>
        <button type="button" onClick={handleButtonClick}>Post</button>
      </div>
    </div>
  );
};

export default CreateTweet;
