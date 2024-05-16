import React, { useState, useEffect } from 'react';
import './ConnectionButton.css';
import User from '../../UserModel';
import { UserData } from '../../pages/Profile/Profile';

type ConnectionProps = {
    currentUser: User;
    visitedUser: UserData;
};

const ConnectionButton: React.FC<ConnectionProps> = ({ currentUser, visitedUser }) => {
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    useEffect(() => {
        const checkIfFollowing = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/isfollowing/${currentUser.id}?follow_id=${visitedUser.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setIsFollowing(data.following);
                } else {
                    console.error('Error checking if following:', response.statusText);
                }
            } catch (error) {
                console.error('Error checking if following:', error);
            }
        };

        checkIfFollowing();
    }, [currentUser.id, visitedUser.id]);

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                const response = await fetch(`http://127.0.0.1:8000/unfollow/${currentUser.id}?unfollow_id=${visitedUser.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    setIsFollowing(false); // Update state after successful unfollow
                } else {
                    console.error('Error unfollowing user:', response.statusText);
                }
            } else {
                const response = await fetch(`http://127.0.0.1:8000/follow/${currentUser.id}?follow_id=${visitedUser.id}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    setIsFollowing(true); // Update state after successful follow
                } else {
                    console.error('Error following user:', response.statusText);
                }
            }
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
        }
    };
    
    

    return (
        <div className="connection-button">
            {isFollowing ? (
                <button className="unfollow-button" onClick={handleFollow}>Unfollow</button>
            ) : (
                <button className="follow-button" onClick={handleFollow}>Follow</button>
            )}
        </div>
    );
}

export default ConnectionButton;
