import { useEffect, useState } from 'react';
import './Suggestion.css';
import User from '../../UserModel';
import ConnectionButton from '../ConnectionButton/ConnectionButton';
import { UserData } from '../../pages/Profile/Profile';
import { Link } from 'react-router-dom';
import { apiKey, apiUrl } from '../../api';

interface ProfileProps {
    user: User;
}

const Suggestion = ({ user }: ProfileProps) => {
    const [suggestedUsers, setSuggestedUsers] = useState<UserData[]>([]);

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const response = await fetch(`${apiUrl}/users`, {
                    headers: {
                        'access-token': apiKey,
                    },
                });
                if (response.ok) {
                    const userData = await response.json();
                    shuffle(userData); // Shuffle the array
                    setSuggestedUsers(userData.slice(0, 5)); // Slice the array to contain only the first 5 elements
                } else {
                    console.error('Failed to fetch suggested users');
                }
            } catch (error) {
                console.error('Error fetching suggested users:', error);
            }
        };

        fetchSuggestedUsers();
    }, []);

    // Function to shuffle an array
    const shuffle = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

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
