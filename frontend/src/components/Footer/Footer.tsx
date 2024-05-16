// src components Footer Footer.tsx
import './Footer.css';
import Search from '../Search/Search';
import Suggestion from '../Suggestion/Suggestion';
import User from '../../UserModel';

interface ProfileProps {
    user: User;
}

const Footer = ({ user }: ProfileProps) => {
    return (
        <div className="footer">
            <Search/>
            <Suggestion user={user}/>
        </div>
    );
}

export default Footer;