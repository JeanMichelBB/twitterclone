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
            <h2>Create a Tweet</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's happening?"
                        required
                    />
                </div>
                <button type="submit">Tweet</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default CreateTweet;
