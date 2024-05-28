import './Footer.css';
import Search from '../Search/Search';
import Suggestion from '../Suggestion/Suggestion';
import User from '../../UserModel';
import { useMediaQuery } from 'react-responsive'; // Import useMediaQuery hook
import { FaHome, FaSearch, FaPlus, FaBell, FaEnvelope } from 'react-icons/fa'; // Import icons
import { Link } from 'react-router-dom';

interface ProfileProps {
    user: User;
}

const Footer = ({ user }: ProfileProps) => {
    // Define breakpoints for mobile devices
    const isMobile = useMediaQuery({ maxWidth: 767 });

    return (
        <div className="footer">
            {/* Render content based on the screen size */}
            {isMobile ? (
                // Mobile footer with buttons
                <div className="footer-buttons">
                    <Link to="/" ><button><FaHome /></button></Link>
                    <Link to="/search" ><button><FaSearch /></button></Link>
                    <Link to="/" ><button><FaPlus /></button></Link>
                    <Link to="/" ><button><FaBell /></button></Link>
                    <Link to="/messages" ><button><FaEnvelope /></button></Link>
                </div>
            ) : (
                // Web footer with content
                <div className="footer-content">
                    <Search />
                    <Suggestion user={user} />
                </div>
            )}
        </div>
    );
}

export default Footer;
