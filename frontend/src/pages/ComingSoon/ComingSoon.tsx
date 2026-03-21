import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ComingSoon.css';

interface ComingSoonProps {
    pageName: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ pageName }) => {
    const navigate = useNavigate();

    return (
        <div className="coming-soon-page">
            <div className="coming-soon-header">
                <button className="coming-soon-back" onClick={() => navigate(-1)}>&#8592;</button>
                <h2>{pageName}</h2>
            </div>
            <div className="coming-soon-body">
                <span className="coming-soon-icon">🚧</span>
                <h3>Welcome to {pageName}</h3>
                <p>This feature is not yet implemented. Check back soon!</p>
            </div>
        </div>
    );
};

export default ComingSoon;
