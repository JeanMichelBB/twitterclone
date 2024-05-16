import React, { useState, useEffect } from 'react';
import User from '../../UserModel';

type Tweet = {
    id: string;
    user_id: string;
    content: string;
    date_posted: string;
    num_likes: number;
    num_retweets: number;
};

const TweetList: React.FC = () => {
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [users, setUsers] = useState<{ [key: string]: User }>({});

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/tweets');
                if (!response.ok) {
                    throw new Error('Failed to fetch tweets');
                }
                const data = await response.json();
                // Sort tweets by date_posted in descending order (most recent first)
                const sortedTweets = data.sort((a: Tweet, b: Tweet) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime());
                setTweets(sortedTweets);
            } catch (error) {
                console.error('Error fetching tweets:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/users'); // Update the URL to your users endpoint
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

        fetchUsers();
        fetchTweets();
    }, []);

    return (
        <div>
            <h1>All Tweets</h1>
            <ul>
                {tweets.map((tweet) => (
                    <li key={tweet.id}>
                        <div>
                            <strong>Username:</strong> {users[tweet.user_id]?.username || 'Unknown'}
                        </div>
                        <div>
                            <strong>Content:</strong> {tweet.content}
                        </div>
                        <div>
                            <strong>Date Posted:</strong> {new Date(tweet.date_posted).toLocaleString()}
                        </div>
                        <div>
                            <strong>Likes:</strong> {tweet.num_likes}
                        </div>
                        <div>
                            <strong>Retweets:</strong> {tweet.num_retweets}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TweetList;
