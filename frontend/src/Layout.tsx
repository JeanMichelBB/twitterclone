// src/Layout.tsx
import { ReactNode } from 'react';
import Header from './components/Header/Header';

interface LayoutProps {
  leftChild: ReactNode;
  rightChild: ReactNode;
  username: string;
}

const Layout = ({ leftChild, rightChild, username }: LayoutProps) => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Header username={username} />
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>{leftChild}</div>
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>{rightChild}</div>
    </div>
  );
};

export default Layout;
