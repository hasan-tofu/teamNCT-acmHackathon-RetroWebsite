
import React from 'react';
import { Badge } from '../../types';

interface BadgeIconProps {
  badge: Badge;
}

const BadgeIcon: React.FC<BadgeIconProps> = ({ badge }) => {
  return (
    <div className="relative group">
      <div className="bg-retro-purple p-2 text-3xl border-2 border-black shadow-pixel cursor-pointer transition-transform hover:scale-110">
        {badge.icon}
      </div>
      <div className="absolute bottom-full mb-2 w-48 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        <h4 className="font-bold font-press-start text-retro-yellow">{badge.name}</h4>
        <p className="font-vt323 text-base">{badge.description}</p>
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-black"></div>
      </div>
    </div>
  );
};

export default BadgeIcon;
