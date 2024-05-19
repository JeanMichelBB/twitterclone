// src/pages/Settings/Settings.tsx
import React, { useState, ChangeEvent } from 'react';
import './Settings.css';
import User from '../../UserModel';
import EditUserInfo from '../../components/EditUserInfo/EditUserInfo';

interface SettingsProps {
  user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [selectedSetting, setSelectedSetting] = useState('changePersonalInfo');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordChange = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/user/${user.id}/password?current_password=${currentPassword}&new_password=${newPassword}`,
        {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
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
      const response = await fetch(
        `http://127.0.0.1:8000/user/${user.id}/username?current_username=${currentUsername}&new_username=${newUsername}`,
        {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.ok) {
        setMessage('Username updated successfully');
        localStorage.removeItem('token');
        alert('Username updated successfully. Please log in again with your new username');
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
      <div className="settings-menu">
        <h2>Settings</h2>
        <ul>
          <li className='selected' onClick={() => setSelectedSetting('changePersonalInfo')}>
            <div>Change Personal Info </div>
         <div className='arrow'> &#8594;</div>
          </li> 
          <li className='selected' onClick={() => setSelectedSetting('changePassword')}>
            <div>Change Password</div>
            <div className='arrow'> &#8594;</div>
            </li>

          <li className='selected' onClick={() => setSelectedSetting('changeUsername')}>
            <div>Change Username</div>
            <div className='arrow'> &#8594;</div>
            </li>
        </ul>
      </div>
      <div className="settings-form">
        {selectedSetting === 'changePersonalInfo' && <EditUserInfo user={user} />}
        {selectedSetting === 'changePassword' && (
          <div>
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmNewPassword(e.target.value)}
            />
            <button onClick={handlePasswordChange}>Change Password</button>
          </div>
        )}
        {selectedSetting === 'changeUsername' && (
          <div>
            <h3>Change Username</h3>
            <p>Changing your username will log you out. You will need to log in again with your new username.</p>
            <input
              type="text"
              placeholder="Current Username"
              value={currentUsername}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentUsername(e.target.value)}
            />
            <input
              type="text"
              placeholder="New Username"
              value={newUsername}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewUsername(e.target.value)}
            />
            <button onClick={handleUsernameChange}>Change Username</button>
          </div>
        )}
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default Settings;
