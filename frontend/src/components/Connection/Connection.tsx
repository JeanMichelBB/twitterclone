import React, { useState, useEffect } from 'react';
import './Connection.css';
import User from '../../UserModel';

interface FollowerData {
    id: string;
    user_id: string;
    follower_user_id: string;
}

interface FollowingData {
    id: string;
    user_id: string;
    following_user_id: string;
}

interface ErrorData {
    error: string;
}

type FollowerList = FollowerData[] | ErrorData | null;
type FollowingList = FollowingData[] | ErrorData | null;

interface ConnectionProps {
    user: User;
}

const Connection: React.FC<ConnectionProps> = ({ user }) => {
    const [followers, setFollowers] = useState<FollowerList>(null);
    const [following, setFollowing] = useState<FollowingList>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const followersResponse = await fetch(`http://127.0.0.1:8000/followers/${user.id}`);
                const followingResponse = await fetch(`http://127.0.0.1:8000/following/${user.id}`);

                if (followersResponse.ok && followingResponse.ok) {
                    const followersData = await followersResponse.json();
                    const followingData = await followingResponse.json();

                    setFollowers(followersData);
                    setFollowing(followingData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [user.id]);

    return (
        <div className="connection-container">
            <div className="followers">
                <h3>Followers</h3>
                <p>Total Followers: {followers && !('error' in followers) ? followers.length : 0}</p>
            </div>
            <div className="following">
                <h3>Following</h3>
                <p>Total Following: {following && !('error' in following) ? following.length : 0}</p>
            </div>
        </div>
    );
};

export default Connection;
