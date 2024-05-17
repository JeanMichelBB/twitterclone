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

interface ProfileProps {
    user: User;
}

const TweetList: React.FC<ProfileProps> = ({ user }) => {
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [users, setUsers] = useState<{ [key: string]: User }>({});
    const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({});

    const handleLike = async (tweetId: string) => {
        try {
            // Check if the tweet is already liked by the user
            const alreadyLiked = userLikes[tweetId];
    
            // If the tweet is already liked, perform unlike action
            if (alreadyLiked) {
                // Perform unlike action here
                // Send a POST request to the unlike endpoint with user_id and tweet_id
                await fetch(`http://127.0.0.1:8000/tweets/unlike?user_id=${user.id}&tweet_id=${tweetId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
    
                // Update the UI to reflect the unlike action
                setUserLikes(prevUserLikes => ({
                    ...prevUserLikes,
                    [tweetId]: false // Mark the tweet as unliked in the local state
                }));
            } 
            // If the tweet is not already liked, perform like action
            else {
                // Perform like action here
                // For example, you might send a like request to your backend API
                // Update the UI to reflect the like action
                setUserLikes(prevUserLikes => ({
                    ...prevUserLikes,
                    [tweetId]: true // Mark the tweet as liked in the local state
                }));
            }
        } catch (error) {
            console.error('Error handling like:', error);
        }
    };
    
    

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
                console.log(sortedTweets);
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

        const checkUserLikes = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/tweets/likes/${user.id}`);
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
                        <div>
                            <button onClick={() => handleLike(tweet.id)}>
                                {userLikes[tweet.id] ? 'Unlike' : 'Like'}
                            </button>
                        </div>
                    </li>
                ))}

            </ul>
        </div>
    );
};

export default TweetList;
