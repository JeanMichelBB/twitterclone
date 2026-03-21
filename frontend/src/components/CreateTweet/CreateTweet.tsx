// src/components/CreateTweet/CreateTweet.tsx
import React, { useState, useRef, useEffect } from 'react'; // useRef kept for formRef
import './CreateTweet.css';
import User from '../../UserModel';
import { faker } from '@faker-js/faker';
import { apiUrl, getAuthHeader } from '../../api';
import { MdOutlineImage, MdOutlineGifBox, MdOutlineBarChart, MdOutlineEmojiEmotions } from 'react-icons/md';
import { useMediaQuery } from 'react-responsive';
import GifPicker from '../GifPicker/GifPicker';

interface ProfileProps {
  user: User;
  onNewTweet: () => void;
}

const CreateTweet: React.FC<ProfileProps> = ({ user, onNewTweet }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const iconSize = isMobile ? 15 : 20;
  const [content, setContent] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionSelected, setSuggestionSelected] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);

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

  const handleRandomImage = () => {
    if (imageUrl) {
      setImageUrl(null);
    } else {
      const seed = Math.floor(Math.random() * 1000);
      setImageUrl(`https://picsum.photos/seed/${seed}/600/400`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const datePosted = getCurrentDateTime();
    const finalContent = suggestionSelected ? content : suggestions[0];

    if (finalContent !== content && !suggestions.includes(content)) {

      return;
    }

    try {
      const response = await fetch(`${apiUrl}/tweets`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          content: finalContent,
          date_posted: datePosted,
          image_url: imageUrl ?? undefined
        })
      });

      if (response.ok) {
        setContent('');
        setImageUrl(null);
        setSuggestionSelected(false);
        setShowGifPicker(false);
        onNewTweet();
      } else {
        const errorData = await response.json();
        console.error('Error data:', errorData);
      }
    } catch (error) {
      console.error('Error creating tweet:', error);
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
          {imageUrl && (
            <div className="image-preview-container">
              <img src={imageUrl} alt="preview" className="image-preview" />
              <button type="button" className="remove-image" onClick={() => setImageUrl(null)}>✕</button>
            </div>
          )}
          </div>
        </form>
      </div>
      <div className="create-tweet-footer" style={{ position: 'relative' }}>
        <button type="button" className="image-upload-label" title={imageUrl ? 'Remove image' : 'Add random image'} onClick={handleRandomImage}>
          <MdOutlineImage size={iconSize} />
        </button>
        <button type="button" className="image-upload-label" title="GIF" onClick={() => { setShowGifPicker(p => !p); setImageUrl(null); }}>
          <MdOutlineGifBox size={iconSize} />
        </button>
        <button type="button" className="image-upload-label" disabled title="Poll"><MdOutlineBarChart size={iconSize} /></button>
        <button type="button" className="image-upload-label" disabled title="Emoji"><MdOutlineEmojiEmotions size={iconSize} /></button>
        <button type="button" onClick={handleButtonClick}>Post</button>
        {showGifPicker && (
          <GifPicker
            onSelect={(url) => { setImageUrl(url); setShowGifPicker(false); }}
            onClose={() => setShowGifPicker(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CreateTweet;
