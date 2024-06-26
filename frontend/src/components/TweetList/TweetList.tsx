// src/components/TweetList/TweetList.tsx
import React, { useState, useEffect } from 'react';
import User from '../../UserModel';
import './TweetList.css';
import { Link } from 'react-router-dom';
import { apiKey, apiUrl } from '../../api';

type Tweet = {
    id: string;
    user_id: string;
    content: string;
    date_posted: string;
    num_likes: number;
    num_retweets: number;
};

interface TweetListProps {
    user: User;
    refresh: boolean;  // Add this line to accept the refresh prop
}

const TweetList: React.FC<TweetListProps> = ({ user, refresh }) => {
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [users, setUsers] = useState<{ [key: string]: User }>({});
    const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({});

    const handleLike = async (tweetId: string) => {
        try {
            const alreadyLiked = userLikes[tweetId];
    
            if (alreadyLiked) {
                await fetch(`${apiUrl}/tweets/unlike?user_id=${user.id}&tweet_id=${tweetId}`, {
                    method: 'POST',
                    headers: {
                        "access-token": apiKey,
                        'Accept': 'application/json'
                    }
                });
    
                // Decrement num_likes by one
                setTweets(prevTweets => prevTweets.map(tweet => {
                    if (tweet.id === tweetId) {
                        return {
                            ...tweet,
                            num_likes: tweet.num_likes - 1
                        };
                    }
                    return tweet;
                }));
    
                setUserLikes(prevUserLikes => ({
                    ...prevUserLikes,
                    [tweetId]: false
                }));
            } else {
                await fetch(`${apiUrl}/tweets/like?user_id=${user.id}&tweet_id=${tweetId}`, {
                    method: 'POST',
                    headers: {
                        "access-token": apiKey,
                        'Accept': 'application/json'
                    }
                });
    
                // Increment num_likes by one
                setTweets(prevTweets => prevTweets.map(tweet => {
                    if (tweet.id === tweetId) {
                        return {
                            ...tweet,
                            num_likes: tweet.num_likes + 1
                        };
                    }
                    return tweet;
                }));
    
                setUserLikes(prevUserLikes => ({
                    ...prevUserLikes,
                    [tweetId]: true
                }));
            }
        } catch (error) {
            console.error('Error handling like:', error);
        }
    };
    

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                const response = await fetch(`${apiUrl}/tweets`, {
                    headers: {
                        "access-token": apiKey
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch tweets');
                }
                const data = await response.json();
                // Sort tweets by date_posted in descending order
                const sortedTweets = data.sort((a: Tweet, b: Tweet) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime());
                setTweets(sortedTweets);
            } catch (error) {
                console.error('Error fetching tweets:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await fetch(`${apiUrl}/users`, {
                    headers: {
                        "access-token": apiKey
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                const usersMap: { [key: string]: User } = {};
                data.forEach((user: User) => {
                    usersMap[user.id] = user;
                });
                setUsers(usersMap);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const checkUserLikes = async () => {
            try {
                const response = await fetch(`${apiUrl}/tweets/likes/${user.id}` , {
                    headers: {
                        "access-token": apiKey
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to check user likes');
                }
                const data = await response.json();
                const userLikes: { [key: string]: boolean } = {};
                data.forEach((like: any) => {
                    userLikes[like.tweet_id] = true;
                });
                setUserLikes(userLikes);
            } catch (error) {
                console.error('Error checking user likes:', error);
            }
        };

        checkUserLikes();
        fetchUsers();
        fetchTweets();
    }, [refresh]);  // Add refresh to the dependency array

    return (
        <div className="tweet-list-container">
            <ul>
                {tweets.map((tweet) => (
                    <li key={tweet.id} className="tweet-item">
                        <Link to={`/${users[tweet.user_id]?.username}`} className="tweet-link">
                            <img
                                src={users[tweet.user_id]?.profile_picture || 'https://via.placeholder.com/150'}
                                alt={`${users[tweet.user_id]?.username || 'Unknown'}'s profile`}
                                className="profile-picture"
                            />
                        </Link>
                        <div className="tweet-details">
                            <Link to={`/${users[tweet.user_id]?.username}`} className="tweet-link">
                                <div className="tweet-info">
                                    <span className="tweet-user">{users[tweet.user_id]?.full_name || 'Unknown'}</span>
                                    <span className="tweet-username">@{users[tweet.user_id]?.username || 'Unknown'}</span>
                                    <span className="tweet-date">{new Date(tweet.date_posted).toLocaleString()}</span>
                                </div>
                            </Link>
                            <div className="tweet-content">
                                {tweet.content}
                            </div>
                            <div className="tweet-actions">
                                <button onClick={() => handleLike(tweet.id)}>
                                    {userLikes[tweet.id] ? 'Unlike' : 'Like'} {tweet.num_likes}
                                </button>
                                <span><strong>Retweets:</strong> {tweet.num_retweets}</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TweetList;
