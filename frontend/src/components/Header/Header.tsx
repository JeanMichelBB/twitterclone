import { Link } from 'react-router-dom';
import './Header.css';
import User from '../../UserModel';
import { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  username: string; // Add username prop
  user: User;
}

const Header = ({ username, user }: HeaderProps) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null); // Ref to modal element
  
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // Redirect to the home page after logout
  };

  useEffect(() => {
    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutsideModal);
    // Remove event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideModal);
    };
  }, []);

  // Function to handle clicking outside the logout modal
  const handleClickOutsideModal = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setShowLogoutModal(false);
    }
  };

  return (
    <div className="header">
      <nav>
        <ul>
          <li><Link to="/">X</Link></li>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/" className='none'>Explore</Link></li>
          <li><Link to="/" className='none'>Notifications</Link></li>
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to="/" className='none'>Grok</Link></li>
          <li><Link to="/" className='none'>Lists</Link></li>
          <li><Link to="/" className='none'>Bookmarks</Link></li>
          <li><Link to="/" className='none'>Communities</Link></li>
          <li><Link to="/" className='none'>Premium</Link></li>
          <li><Link to={`/${username}`}>Profile</Link></li>
          <li><Link to="/settings">More</Link></li>
        </ul>
        <button className='post'>Post</button>
        <button className="user-info" onClick={() => setShowLogoutModal(!showLogoutModal)}>
          <img className='profile_picture' src={user.profile_picture} alt="Profile" />
          <div className='user-info-text'>
            <span className='full_name'>{user.full_name}</span>
            <span className='username'>@{username}</span>
          </div>
          <div className='logout'>...</div>
        </button>
      </nav>
      {showLogoutModal && (
        <div className="logout-modal" ref={modalRef}>
          <div className="logout-modal-content">
            <button className='logoutButton' onClick={logout}><h3>Log out @{username}?</h3></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
