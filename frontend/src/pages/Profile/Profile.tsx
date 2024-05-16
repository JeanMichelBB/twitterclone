import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NotFound from '../NotFound/NotFound';
import User from '../../UserModel';
import Connection from '../../components/Connection/Connection';
import ConnectionButton from '../../components/ConnectionButton/ConnectionButton';

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
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<UserData>({
        id: '',
        username: '',
        full_name: '',
        bio: '',
        location: '',
        website: '',
        profile_image: '',
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/profile/${username}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    console.log('Profile data:', data);
                    setFormData(data as UserData);
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

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setFormData(userData as UserData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            const { full_name, bio, location, website, profile_image } = formData;
            const url = `http://127.0.0.1:8000/profile/${username}?full_name=${full_name}&bio=${bio}&location=${location}&website=${website}&profile_picture=${profile_image}`;    
            const token = localStorage.getItem('token');
            // Send updated profile data to backend
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                // Handle success, e.g., show success message
                console.log('Profile updated successfully');
                setEditing(false);
                setUserData(formData);
            } else {
                // Handle error response, e.g., show error message
                console.error('Profile update failed');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            // Handle fetch error
        }
    };

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
            {userData && <Connection currentUser={user} visitedUser={userData}  />}
            {/* Render profile data */}
            {userData && !editing && (
                <div>
                    <p>Username: {userData.username}</p>
                    <p>Full Name: {userData.full_name}</p>
                    <p>Bio: {userData.bio}</p>
                    <p>Location: {userData.location}</p>
                    <p>Website: {userData.website}</p>
                    <p>Profile Image: {userData.profile_image}</p>
                    {/* Add other profile fields */}
                    {isCurrentUser && <button onClick={handleEdit}>Edit Profile</button>}
                </div>
            )}

            {/* Render input fields when editing */}
            {editing && (
                <div>
                    <label htmlFor="username">Username:</label>
                    <input type="text" name="username" value={formData?.username || ''} onChange={handleChange} />
                    <br />
                    <label htmlFor="full_name">Full Name:</label>
                    <input type="text" name="full_name" value={formData?.full_name || ''} onChange={handleChange} />
                    <br />
                    <label htmlFor="bio">Bio:</label>
                    <input type="text" name="bio" value={formData?.bio || ''} onChange={handleChange} />
                    <br />
                    <label htmlFor="location">Location:</label>
                    <input type="text" name="location" value={formData?.location || ''} onChange={handleChange} />
                    <br />
                    <label htmlFor="website">Website:</label>
                    <input type="text" name="website" value={formData?.website || ''} onChange={handleChange} />
                    <br />
                    <label htmlFor="profile_image">Profile Image:</label>
                    <input type="text" name="profile_image" value={formData?.profile_image || ''} onChange={handleChange} />
                    <br />
                    <button onClick={handleCancel}>Cancel</button>
                    <button onClick={handleSubmit}>Save</button>
                </div>
            )}
        </div>
    );
};

export default Profile;
