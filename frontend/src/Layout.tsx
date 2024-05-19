import { ReactNode } from 'react';
import Header from './components/Header/Header';
import User from './UserModel';
import './Layout.css'; // Import the CSS file for layout styling

interface LayoutProps {
  leftChild: ReactNode;
  rightChild: ReactNode;
  username: string;
  user: User;
}

const Layout = ({ leftChild, rightChild, username, user }: LayoutProps) => {
  return (
    <div className='layout'>
      <div className="layout-container">
      <Header username={username} user={user} />
        <div className="left-panel">{leftChild}</div>
        <div className="right-panel">{rightChild}</div>
      </div>
    </div>
  );
};

export default Layout;
