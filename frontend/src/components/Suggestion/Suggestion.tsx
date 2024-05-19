import React, { useEffect, useState } from 'react';
import './Suggestion.css';
import User from '../../UserModel';
import ConnectionButton from '../ConnectionButton/ConnectionButton';
import { UserData } from '../../pages/Profile/Profile';
import { Link } from 'react-router-dom';

interface ProfileProps {
    user: User;
}

const Suggestion = ({ user }: ProfileProps) => {
    const [suggestedUsers, setSuggestedUsers] = useState<UserData[]>([]);

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/users');
                if (response.ok) {
                    const userData = await response.json();
                    setSuggestedUsers(userData);
                } else {
                    console.error('Failed to fetch suggested users');
                }
            } catch (error) {
                console.error('Error fetching suggested users:', error);
            }
        };

        fetchSuggestedUsers();
    }, []);

    return (
        <div className='suggestions'>
            <div className='title'>Suggestions</div>
            {suggestedUsers.map((userData) => (
                <Link to={`/${userData.username}`} key={userData.id}>
                <div className="suggestion-container" key={userData.id}>
                <div className='profile-image'>
                        <img src={userData.profile_picture} alt='profile' />
                    </div>
                    <div className="suggestion-info">
                        <h3>{userData.username}</h3>
                        <p>{userData.full_name}</p>
                        {/* You can add more user details here */}
                    </div>
                    <div className="suggestion-button">
                        <ConnectionButton currentUser={user} visitedUser={userData} />
                    </div>
                </div>
            </Link>
            ))}
        </div>
    );
};

export default Suggestion;
