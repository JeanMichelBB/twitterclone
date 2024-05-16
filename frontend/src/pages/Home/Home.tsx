// src/pages/Home/Home.tsx
import './Home.css';
import TweetList from '../../components/TweetList/TweetList';
import CreateTweet from '../../components/CreateTweet/CreateTweet';
import User from '../../UserModel';

interface ProfileProps {
  user: User;
}

const Home: React.FC<ProfileProps> = ({ user }) => {
  
    return (
      <div>
        <CreateTweet user={user} />
        <TweetList />
        

      </div>
    );
  };
  
  export default Home;
