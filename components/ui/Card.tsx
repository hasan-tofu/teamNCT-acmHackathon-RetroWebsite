

import React, { ReactNode, HTMLAttributes } from 'react';

// FIX: Extended with HTMLAttributes to allow passing standard div props like onClick.
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', interactive = false, ...props }) => {
  const interactiveClasses = interactive
    ? 'transition-transform duration-200 hover:-translate-y-1 hover:shadow-pixel-light hover:border-retro-cyan'
    : '';

  return (
    // FIX: Spread the rest of the props onto the div element.
    <div className={`bg-retro-blue p-4 border-4 border-retro-purple shadow-pixel ${interactiveClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
