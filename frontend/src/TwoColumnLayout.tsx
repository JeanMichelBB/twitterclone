// src/layouts/TwoColumnLayout.tsx
import { ReactNode } from 'react';

interface TwoColumnLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

const TwoColumnLayout = ({ leftContent, rightContent }: TwoColumnLayoutProps) => {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>{leftContent}</div>
      <div style={{ flex: 1 }}>{rightContent}</div>
    </div>
  );
};

export default TwoColumnLayout;
