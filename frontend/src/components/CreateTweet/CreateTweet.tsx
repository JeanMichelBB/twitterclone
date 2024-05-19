import React, { useState } from 'react';
import './CreateTweet.css';
import User from '../../UserModel';

interface ProfileProps {
    user: User;
}

const CreateTweet: React.FC<ProfileProps> = ({ user }) => {
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');

    const getCurrentDateTime = (): string => {
        const now = new Date();
        now.setHours(now.getHours() - 4); // Adjust for UTC time zone
        return now.toISOString().slice(0, 16); // Format as 'YYYY-MM-DDTHH:MM'
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const datePosted = getCurrentDateTime();
        try {
            const response = await fetch(`http://127.0.0.1:8000/tweets?user_id=${user.id}&content=${encodeURIComponent(content)}&date_posted=${encodeURIComponent(datePosted)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMessage('Tweet created successfully');
                setContent(''); // Clear the input after successful submission
            } else {
                const errorData = await response.json();
                setMessage(errorData.detail || 'Failed to create tweet');
            }
        } catch (error) {
            console.error('Error creating tweet:', error);
            setMessage('An error occurred');
        }
    };

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
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's happening?"
                        required
                    />
                </div>

            </form>
            {message && <p>{message}</p>}
            </div>
            <div className='create-tweet-footer'>
                <p>&#9744;</p>
                <p>&#9786;</p>
                <p>&#9872;</p>
                <p>&#9881;</p>
                <button type="submit">Post</button>
                </div>
        </div>
    );
};

export default CreateTweet;
