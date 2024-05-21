import React, { useState, useEffect } from 'react';
import './TweetListUser.css';
import User from '../../UserModel';
import { UserData } from '../../pages/Profile/Profile';

type Tweet = {
  id: string;
  user_id: string;
  content: string;
  date_posted: string;
  num_likes: number;
  num_retweets: number;
};

type ConnectionProps = {
  currentUser: User;
  visitedUser: UserData;
};

const TweetListUser: React.FC<ConnectionProps> = ({ currentUser, visitedUser }) => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/tweets/${visitedUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tweets');
        }
        const data = await response.json();
        setTweets(data);
      } catch (error) {
        console.error('Error fetching tweets:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/users');
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
        const response = await fetch(`http://127.0.0.1:8000/tweets/likes/${currentUser.id}`);
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

    fetchTweets();
    fetchUsers();
    checkUserLikes();
  }, [currentUser.id, visitedUser.id]);

  const handleLike = async (tweetId: string) => {
    try {
        const alreadyLiked = userLikes[tweetId];

        if (alreadyLiked) {
            await fetch(`http://127.0.0.1:8000/tweets/unlike?user_id=${currentUser.id}&tweet_id=${tweetId}`, {
                method: 'POST',
                headers: {
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
            await fetch(`http://127.0.0.1:8000/tweets/like?user_id=${currentUser.id}&tweet_id=${tweetId}`, {
                method: 'POST',
                headers: {
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


  return (
    <div className="tweet-list-container">
      <ul>
        {tweets.map((tweet) => (
          <li key={tweet.id} className="tweet-item">
            <img
              src={users[tweet.user_id]?.profile_picture || 'https://via.placeholder.com/150'}
              alt={`${users[tweet.user_id]?.username || 'Unknown'}'s profile`}
              className="profile-picture"
            />
            <div className="tweet-details">
              <div className="tweet-info">
                <span className="tweet-user">{users[tweet.user_id]?.full_name || 'Unknown'}</span>
                <span className="tweet-username">@{users[tweet.user_id]?.username || 'Unknown'}</span>
                <span className="tweet-date">{new Date(tweet.date_posted).toLocaleString()}</span>
              </div>
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

export default TweetListUser;
