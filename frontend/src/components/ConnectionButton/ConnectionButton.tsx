// src/components/ConnectionButton/ConnectionButton.tsx

import React, { useState, useEffect } from 'react';
import './ConnectionButton.css';
import User from '../../UserModel';
import { UserData } from '../../pages/Profile/Profile';
import { apiKey, apiUrl } from '../../api';


type ConnectionProps = {
    currentUser: User | null;
    visitedUser: UserData | null;
};

const ConnectionButton: React.FC<ConnectionProps> = ({ currentUser, visitedUser }) => {
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    useEffect(() => {
        const checkIfFollowing = async () => {
            if (!currentUser || !visitedUser) return;
            
            try {
                const response = await fetch(`${apiUrl}/isfollowing/${currentUser.id}?follow_id=${visitedUser.id}`, {
                    headers: {
                        'access-token': apiKey,
                    },
                });
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
    }, [currentUser, visitedUser]);

    const handleFollow = async () => {
        if (!currentUser || !visitedUser) return;

        try {
            if (isFollowing) {
                const response = await fetch(`${apiUrl}/unfollow/${currentUser.id}?unfollow_id=${visitedUser.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        "access-token": apiKey
                    }
                });
                if (response.ok) {
                    setIsFollowing(false); // Update state after successful unfollow
                } else {
                    console.error('Error unfollowing user:', response.statusText);
                }
            } else {
                const response = await fetch(`${apiUrl}/follow/${currentUser.id}?follow_id=${visitedUser.id}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        "access-token": apiKey,
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

    if (!currentUser || !visitedUser) {
        return null; // or return a placeholder or message
    }

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
