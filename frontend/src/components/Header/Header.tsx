// src/components/Header/Header.tsx
import { Link } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  username: string; // Add username prop
}

// Update the component to accept the username prop
const Header = ({ username }: HeaderProps) => {
  // Function to log out the user and remove the token from local storage
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // Redirect to the home page after logout
  };

  return (
    <div className="header">
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to={`/${username}`}>Profile</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          {/* Display the username in the header */}
          <li><span>Welcome, {username}</span></li>
          <li><button onClick={logout}>Logout</button></li>
        </ul>
      </nav>
    </div>
  );
}

export default Header;
