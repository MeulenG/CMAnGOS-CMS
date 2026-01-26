import React, { type ReactNode } from 'react';
import './PageContainer.css';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`page-container ${className}`}>
      <div className="parchment-frame">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
