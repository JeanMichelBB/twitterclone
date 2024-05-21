import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NotFound from '../NotFound/NotFound';
import User from '../../UserModel';
import Connection from '../../components/Connection/Connection';
import ConnectionButton from '../../components/ConnectionButton/ConnectionButton';
import { Link } from 'react-router-dom';
import TweetListUser from '../../components/TweetListUser/TweetListUser';
import './Profile.css';

export interface UserData {
    id: string;
    username: string;
    full_name: string;
    bio: string;
    location: string;
    website: string;
    profile_picture: string;
    // Add other profile fields as needed
}

interface ProfileProps {
    logUsername: string;
    user: User;
}

interface ErrorData {
    error: string;
}

type ProfileData = UserData | ErrorData | null;


const Profile = ({ logUsername, user }: ProfileProps) => {
    const { username } = useParams();
    const [userData, setUserData] = useState<ProfileData>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/profile/${username}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    console.log('Profile data:', data);
                } else {
                    // Redirect to 404 page if user not found
                    setUserData({ error: 'User not found' });
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                // Handle fetch error
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [username]);

    const isCurrentUser = logUsername === username;


    if (loading) {
        return <div>Loading...</div>;
    }

    if (userData && 'error' in userData) {
        return <NotFound />;
    }

    return (
        <div className='profile'>

            {/* Render profile data */}
            {userData && (

                <div>
                    <div className='profile-header'>
                        <Link className='back-button' to="/">&#8592;</Link>
                        <h2>{userData.full_name}</h2>
                    </div>
                    <div className='profile-background'>
                        <img src={userData.profile_picture} alt="Profile" />
                    </div>
                    <div className='profile-header-info'>
                    <img src={userData.profile_picture} alt="Profile" />
                    {isCurrentUser && (
                        // need to edit got to setting
                        <Link to="/settings"> Edit Profile</Link>
                    )
                    }
                    {!isCurrentUser && (
                        <ConnectionButton currentUser={user} visitedUser={userData} />
                    )

                    }
                    </div>
                    <div className='profile-info'>
                    <div>{userData.full_name}</div>
                    <div>@{userData.username}</div>
                    <div>{userData.bio}</div>
                    <div>{userData.location}</div>
                    <div>{userData.website}</div>
                    {/* Add other profile fields */}
                    {userData && <Connection currentUser={user} visitedUser={userData} />}
                    </div>
                    <TweetListUser currentUser={user} visitedUser={userData} />
                </div>
            )}

        </div>
    );
};

export default Profile;
