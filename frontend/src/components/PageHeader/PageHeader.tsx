import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

interface PageHeaderProps {
    title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
    const navigate = useNavigate();

    return (
        <div className="page-header">
            <button className="page-header-back" onClick={() => navigate(-1)}>&#8592;</button>
            <h2>{title}</h2>
        </div>
    );
};

export default PageHeader;
