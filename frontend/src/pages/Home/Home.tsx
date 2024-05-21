// src/pages/Home/Home.tsx
import './Home.css';
import TweetList from '../../components/TweetList/TweetList';
import CreateTweet from '../../components/CreateTweet/CreateTweet';
import User from '../../UserModel';
import React, { useState } from 'react';

interface ProfileProps {
  user: User;
}

const Home: React.FC<ProfileProps> = ({ user }) => {
  const [refresh, setRefresh] = useState(false);

  const handleNewTweet = () => {
    setRefresh(prevRefresh => !prevRefresh);
  };

  return (
    <div className='home'>
      <CreateTweet user={user} onNewTweet={handleNewTweet} />
      <TweetList user={user} refresh={refresh} />
    </div>
  );
};

export default Home;
