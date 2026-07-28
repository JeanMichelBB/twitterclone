import React from 'react';
import PageHeader from '../../components/PageHeader/PageHeader';
import './ComingSoon.css';

interface ComingSoonProps {
    pageName: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ pageName }) => {
    return (
        <div className="coming-soon-page">
            <PageHeader title={pageName} />
            <div className="coming-soon-body">
                <span className="coming-soon-icon">🚧</span>
                <h3>Welcome to {pageName}</h3>
                <p>This feature is not yet implemented. Check back soon!</p>
            </div>
        </div>
    );
};

export default ComingSoon;
