// src components Footer Footer.tsx
import './Footer.css';
import Search from '../Search/Search';
import Trending from '../Trending/Trending';

const Footer = () => {
    return (
        <div className="footer">
            <Search/>
            <Trending/>
        </div>
    );
}

export default Footer;