import React, { useState } from 'react';
import User from '../../UserModel';
import axios from 'axios';
import { faker } from '@faker-js/faker';

interface EditUserInfoProps {
  user: User;
}

const EditUserInfo: React.FC<EditUserInfoProps> = ({ user }) => {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [profilePicture, setProfilePicture] = useState(user.profile_picture || '');
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [website, setWebsite] = useState(user.website || '');
  const [currentPassword, setCurrentPassword] = useState('password');
  const [errorMessage, setErrorMessage] = useState('');
  const [inputsDisabled, setInputsDisabled] = useState(false);

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
    } catch (error: any) {
      console.error('Error updating user info:', error);
      if (error.response && error.response.status === 400) {
        setErrorMessage('Wrong password. Please try again.');
      } else {
        setErrorMessage('An error occurred while updating user info');
      }
    }
  };

  const generateFakerData = () => {
    setFullName(faker.person.fullName());
    setProfilePicture(faker.internet.avatar());
    setBio(faker.lorem.sentences());
    setLocation(faker.address.city());
    setWebsite(faker.internet.url());
  };

  const handleGenerateFakerData = () => {
    generateFakerData();
    setInputsDisabled(false); // Enable input fields after generating Faker data
  };

  return (
    <div>
      <h3>Edit User Info</h3>
      <p>The input fields are disabled. Click the "Generate Faker Data" button to fill them with random data.</p>
      <label>Full Name</label>
      <br />
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        disabled
      />
      <br />
      <label>Profile Picture URL</label>
      <br />
      <input
        type="text"
        placeholder="Profile Picture URL"
        value={profilePicture}
        onChange={(e) => setProfilePicture(e.target.value)}
        disabled
      />
      <br />
      <label>Bio</label>
      <br />
      <input
        type="text"
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        disabled
      />
      <br />
      <label>Location</label>
      <br />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        disabled
      />
      <br />
      <label>Website</label>
      <br />
      <input
        type="text"
        placeholder="Website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        disabled
      />
      <br />
      <label>Current Password</label>
      <br />
      <input
        required
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        disabled
      />
      <br />
      <button onClick={handleGenerateFakerData}>Generate Faker Data</button>
      <br />
      <button onClick={handleUpdateUserInfo}>Update Info</button>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default EditUserInfo;
