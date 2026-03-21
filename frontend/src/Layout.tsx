// src/Layout.tsx
import { ReactNode, useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  const scrollPeak = useRef(0);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [footerFaded, setFooterFaded] = useState(false);
  const location = useLocation();
  const leftPanelRef = useRef<HTMLDivElement>(null);

  // Native scroll listener — saves position and drives header hide animation
  useEffect(() => {
    const el = leftPanelRef.current;
    if (!el) return;
    const key = location.key;

    const onScroll = () => {
      const y = el.scrollTop;
      sessionStorage.setItem(`scroll:${key}`, String(y));

      const scrollingDown = y > lastScrollY.current;

      if (scrollingDown && y > 50) {
        setHeaderHidden(true);
        setFooterFaded(true);
        scrollPeak.current = y;
      } else if (!scrollingDown) {
        setHeaderHidden(false);
        if (scrollPeak.current - y >= 100) setFooterFaded(false);
      }

      lastScrollY.current = y;
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [location.key]);

  // Restore scroll — retries until content is tall enough to reach saved position
  useEffect(() => {
    const saved = sessionStorage.getItem(`scroll:${location.key}`);
    if (!saved) return;
    const target = Number(saved);
    const delays = [50, 150, 300, 600];
    const timers = delays.map(d =>
      setTimeout(() => {
        const el = leftPanelRef.current;
        if (el && el.scrollHeight >= target) el.scrollTop = target;
      }, d)
    );
    return () => timers.forEach(clearTimeout);
  }, [location.key]);

  return (
    <div className={`layout${headerHidden ? ' scrolled-down' : ''}${footerFaded ? ' footer-faded' : ''}`}>
      <div className="layout-container">
        <Header username={username} user={user} hidden={headerHidden} />
        <div className={`header-spacer-fixed${headerHidden ? ' header-spacer-hidden' : ''}`} />
        <div className="left-panel" ref={leftPanelRef}>
          {leftChild}
          <div className={`footer-spacer-fixed${headerHidden ? ' footer-spacer-hidden' : ''}`} />
        </div>
        <div className="right-panel">{rightChild}</div>
      </div>
    </div>
  );
};

export default Layout;
