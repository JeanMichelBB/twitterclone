// src/pages/Settings/Settings.tsx
import React, { useState } from 'react';
import './Settings.css';
import User from '../../UserModel';
import EditUserInfo from '../../components/EditUserInfo/EditUserInfo';

interface SettingsProps {
  user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => { // Expecting user instead of User
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordChange = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/user/${user.id}/password?current_password=${currentPassword}&new_password=${newPassword}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setMessage('Password updated successfully');
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage('An error occurred while updating password');
    }
  };
  

  const handleUsernameChange = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/user/${user.id}/username?current_username=${currentUsername}&new_username=${newUsername}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setMessage('Username updated successfully');
        // Log out the user by removing the token from local storage
        localStorage.removeItem('token');
        alert('Username updated successfully. Please log in again with your new username');
        // Redirect user to login page
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail);
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setMessage('An error occurred while updating username');
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <EditUserInfo user={user} />
      <div>
        <h3>Change Password</h3>
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
        <button onClick={handlePasswordChange}>Change Password</button>
      </div>
      <div>
        <h3>Change Username</h3>
        <p>Changing your username will log you out. You will need to log in again with your new username.</p>
        <input
          type="text"
          placeholder="Current Username"
          value={currentUsername}
          onChange={(e) => setCurrentUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="New Username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />
        <button onClick={handleUsernameChange}>Change Username</button>
      </div>
      {message && <p className="message">{message}</p>}
      <br />
      <div>
      </div>
      {message && <p className="message">{message}</p>}
     
      </div>
  );
};

export default Settings;
