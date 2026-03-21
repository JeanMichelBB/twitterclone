import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import './Header.css';
import User from '../../UserModel';
import { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import Connection from '../Connection/Connection';



interface HeaderProps {
  username: string;
  user: User;
  hidden?: boolean;
}
const Header = ({ username, user, hidden }: HeaderProps) => {
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

  // Close mobile menu when header hides on scroll
  useEffect(() => {
    if (hidden) setShowMobileMenu(false);
  }, [hidden]);

  const handleMenuLinkClick = () => {
    setShowMobileMenu(false);
  };

  return (
    <div className={`header${hidden ? ' header-hidden' : ''}`}>
      <div className="header-title">
        {isMobile ? (
          <div className="header-container" ref={menuRef}>
            <button className="menu" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              <img className='profile_picture' src={user.profile_picture} alt="Profile" />
            </button>
            <Link to="/" className='logo'>X</Link>
            <div className="header-spacer" />
            {showMobileMenu && createPortal(
              <div
                className="mobile-menu-backdrop"
                onClick={() => setShowMobileMenu(false)}
              />,
              document.body
            )}
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
                  <li><Link to="/explore" onClick={handleMenuLinkClick}>Explore</Link></li>
                  <li><Link to="/notifications" onClick={handleMenuLinkClick}>Notifications</Link></li>
                  <li><Link to="/messages" onClick={handleMenuLinkClick}>Messages</Link></li>
                  <li><Link to="/grok" onClick={handleMenuLinkClick}>Grok</Link></li>
                  <li><Link to="/lists" onClick={handleMenuLinkClick}>Lists</Link></li>
                  <li><Link to="/bookmarks" onClick={handleMenuLinkClick}>Bookmarks</Link></li>
                  <li><Link to="/communities" onClick={handleMenuLinkClick}>Communities</Link></li>
                  <li><Link to="/premium" onClick={handleMenuLinkClick}>Premium</Link></li>
                  <li><Link to="/settings" onClick={handleMenuLinkClick}>Settings</Link></li>
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
                <li><Link to="/explore">Explore</Link></li>
                <li><Link to="/notifications">Notifications</Link></li>
                <li><Link to="/messages">Messages</Link></li>
                <li><Link to="/grok">Grok</Link></li>
                <li><Link to="/lists">Lists</Link></li>
                <li><Link to="/bookmarks">Bookmarks</Link></li>
                <li><Link to="/communities">Communities</Link></li>
                <li><Link to="/premium">Premium</Link></li>
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
