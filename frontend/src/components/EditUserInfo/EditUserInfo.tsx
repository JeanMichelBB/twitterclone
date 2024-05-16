// src/components/EditUserInfo.tsx
import React, { useState } from 'react';
import User from '../../UserModel';
import axios from 'axios';

interface EditUserInfoProps {
  user: User;
}

const EditUserInfo: React.FC<EditUserInfoProps> = ({ user }) => {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [profilePicture, setProfilePicture] = useState(user.profile_picture || '');
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [website, setWebsite] = useState(user.website || '');
  const [currentPassword, setCurrentPassword] = useState('');

  const handleUpdateUserInfo = async () => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/user/${user.id}`, null, {
        params: {
          current_username: user.username,
          current_password: currentPassword,
          full_name: fullName,
          profile_picture: profilePicture,
          bio: bio,
          location: location,
          website: website,
        },
      });
      if (response.status === 200) {
        alert('User information updated successfully');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      alert('An error occurred while updating user info');
    }
  };

  return (
    <div>
      <h3>Edit User Info</h3>
      <label>Full Name</label>
      <br/>
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <br/>
      <label>Profile Picture URL</label>
      <br/>
      <input
        type="text"
        placeholder="Profile Picture URL"
        value={profilePicture}
        onChange={(e) => setProfilePicture(e.target.value)}
      />
      <br/>
      <label>Bio</label>
      <br/>
      <input
        type="text"
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <br/>
      <label>Location</label>
      <br/>
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <br/>
      <label>Website</label>
      <br/>
      <input
        type="text"
        placeholder="Website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
      <br/>
      <label>Current Password</label>
      <br/>
      <input
        required
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <br/>
      <button onClick={handleUpdateUserInfo}>Update Info</button>
    </div>
  );
};

export default EditUserInfo;
