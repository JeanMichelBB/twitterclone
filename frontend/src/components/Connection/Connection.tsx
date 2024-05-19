import React, { useState, useEffect } from 'react';
import './Connection.css';
import User from '../../UserModel';
import { UserData } from '../../pages/Profile/Profile';

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

type ConnectionProps = {
    currentUser: User;
    visitedUser: UserData;
};

const Connection: React.FC<ConnectionProps> = ({ currentUser, visitedUser }) => {
    const [followers, setFollowers] = useState<FollowerList>(null);
    const [following, setFollowing] = useState<FollowingList>(null);

    const fetchFollowersAndFollowing = async () => {
        try {
            const followersResponse = await fetch(`http://127.0.0.1:8000/followers/${visitedUser.id}`);
            const followingResponse = await fetch(`http://127.0.0.1:8000/following/${visitedUser.id}`);

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

    useEffect(() => {
        fetchFollowersAndFollowing();
    }, [visitedUser.id]);

    // Handle follow/unfollow action
    const handleFollow = async () => {
        try {
            // Perform follow/unfollow action here

            // After follow/unfollow action, refresh followers and following counts
            fetchFollowersAndFollowing();
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
        }
    };

    return (
        <div className="connection-container">
            <div className="following"> 
                <p>{following && !('error' in following) ? following.length : 0}&nbsp;Following</p>
            </div>
            &nbsp;&nbsp;
            <div className="followers">
                <p>{followers && !('error' in followers) ? followers.length : 0}&nbsp;Followers</p>
            </div>
        </div>
    );
};

export default Connection;
