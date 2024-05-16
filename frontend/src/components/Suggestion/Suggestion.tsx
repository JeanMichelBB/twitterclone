import React, { useEffect, useState } from 'react';
import './Suggestion.css';
import User from '../../UserModel';
import ConnectionButton from '../ConnectionButton/ConnectionButton';
import { UserData } from '../../pages/Profile/Profile';

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
        <div>
            <h2>Suggestions</h2>
            {suggestedUsers.map((userData) => (
                <div key={userData.id}>
                    <h3>{userData.username}</h3>
                    <p>{userData.full_name}</p>
                    {/* You can add more user details here */}
                    <ConnectionButton currentUser={user} visitedUser={userData} />
                </div>
            ))}
        </div>
    );
};

export default Suggestion;
