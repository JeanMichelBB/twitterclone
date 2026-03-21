// src/Layout.tsx
import { ReactNode, useRef, useState, useCallback } from 'react';
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
  const lastScrollY = useRef(0);
  const [headerHidden, setHeaderHidden] = useState(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const currentY = e.currentTarget.scrollTop;
    if (currentY > lastScrollY.current && currentY > 50) {
      setHeaderHidden(true);
    } else {
      setHeaderHidden(false);
    }
    lastScrollY.current = currentY;
  }, []);

  return (
    <div className={`layout${headerHidden ? ' scrolled-down' : ''}`}>
      <div className="layout-container" onScroll={handleScroll}>
        <Header username={username} user={user} hidden={headerHidden} />
        <div className={`header-spacer-fixed${headerHidden ? ' header-spacer-hidden' : ''}`} />
        <div className="left-panel" onScroll={handleScroll}>
          {leftChild}
          <div className={`footer-spacer-fixed${headerHidden ? ' footer-spacer-hidden' : ''}`} />
        </div>
        <div className="right-panel">{rightChild}</div>
      </div>
    </div>
  );
};

export default Layout;
