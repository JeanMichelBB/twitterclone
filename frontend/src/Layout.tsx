// src/Layout.tsx
import { ReactNode } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

interface LayoutProps {
  children: ReactNode;
  username: string; // Add username prop
}

const Layout = ({ children, username }: LayoutProps) => { // Include username prop in the props destructuring
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Header username={username} /> {/* Pass username to the Header component */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
