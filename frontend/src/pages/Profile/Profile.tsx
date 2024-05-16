import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NotFound from '../NotFound/NotFound';
import User from '../../UserModel';
import Connection from '../../components/Connection/Connection';
import ConnectionButton from '../../components/ConnectionButton/ConnectionButton';
import { Link } from 'react-router-dom';
import TweetListUser from '../../components/TweetListUser/TweetListUser';

export interface UserData {
    id: string;
    username: string;
    full_name: string;
    bio: string;
    location: string;
    website: string;
    profile_image: string;
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
        <div>
            <h2>Profile Page</h2>
            {userData && <ConnectionButton currentUser={user} visitedUser={userData} />}
            {userData && <Connection currentUser={user} visitedUser={userData} />}
            {/* Render profile data */}
            {userData && (
                <div>
                    <p>Username: {userData.username}</p>
                    <p>Full Name: {userData.full_name}</p>
                    <p>Bio: {userData.bio}</p>
                    <p>Location: {userData.location}</p>
                    <p>Website: {userData.website}</p>
                    <p>Profile Image: {userData.profile_image}</p>
                    {/* Add other profile fields */}
                    {isCurrentUser && (
                        // need to edit got to setting
                        <Link to="/settings"> Edit Profile</Link>
                    )}                
                    <TweetListUser currentUser={user} visitedUser={userData} />
                </div>
            )}
        </div>
    );
};

export default Profile;
