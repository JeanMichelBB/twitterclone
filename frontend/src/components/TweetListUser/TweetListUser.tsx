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

    fetchTweets();
  }, [visitedUser.id]);

  return (
    <div>
      <h1>Tweets for {visitedUser.username}</h1>
      <ul>
        {tweets.map((tweet) => (
          <li key={tweet.id}>
            <div>
              <strong>Content:</strong> {tweet.content}
            </div>
            <div>
              <strong>Date Posted:</strong> {tweet.date_posted}
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
}

export default TweetListUser;
