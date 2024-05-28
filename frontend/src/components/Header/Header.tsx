import { Link } from 'react-router-dom';
import './Header.css';
import User from '../../UserModel';
import { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import Connection from '../Connection/Connection';
import { IoIosSettings } from "react-icons/io";



interface HeaderProps {
  username: string; 
  user: User;
}
const Header = ({ username, user }: HeaderProps) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; 
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (modalRef.current && !modalRef.current.contains(event.target as Node)) ||
        (menuRef.current && !menuRef.current.contains(event.target as Node))
      ) {
        setShowLogoutModal(false);
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuLinkClick = () => {
    setShowMobileMenu(false);
  };

  return (
    <div className="header">
      <div className="header-title">
        {isMobile ? (
          <div className="header-container" ref={menuRef}>
            <button className="menu" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              <img className='profile_picture' src={user.profile_picture} alt="Profile" />
            </button>
            <Link to="/" className='logo'>X</Link>
            <Link to="/settings" className='logo'><IoIosSettings/></Link>
            {showMobileMenu && (
              <nav className="mobile-menu">
                <Link to={`/${username}`} onClick={handleMenuLinkClick}>
                  <img className='profile_picture' src={user.profile_picture} alt="Profile" />
                </Link>
                <div className='user-info-text'>
                  <span className='full_name'>{user.full_name}</span>
                  <span className='username'>@{username}</span>
                </div>
                <Connection currentUser={user} visitedUser={user} />
                <ul>
                  <li><Link to="/" onClick={handleMenuLinkClick}>Home</Link></li>
                  <li><Link to="/" className='none' onClick={handleMenuLinkClick}>Explore</Link></li>
                  <li><Link to="/" className='none' onClick={handleMenuLinkClick}>Notifications</Link></li>
                  <li><Link to="/messages" onClick={handleMenuLinkClick}>Messages</Link></li>
                  <li><Link to="/" className='none' onClick={handleMenuLinkClick}>Grok</Link></li>
                  <li><Link to="/" className='none' onClick={handleMenuLinkClick}>Lists</Link></li>
                  <li><Link to="/" className='none' onClick={handleMenuLinkClick}>Bookmarks</Link></li>
                  <li><Link to="/" className='none' onClick={handleMenuLinkClick}>Communities</Link></li>
                  <li><Link to="/" className='none' onClick={handleMenuLinkClick}>Premium</Link></li>
                  <li><Link to="/" onClick={logout}>Log out @{username}?</Link></li>
                </ul>
              </nav>
            )}
          </div>
        ) : (
          <div className="header-container">
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
        )}
      </div>
    </div>
  );
}

export default Header;
