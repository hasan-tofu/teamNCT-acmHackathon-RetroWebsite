
import React from 'react';

interface XpBarProps {
  currentXp: number;
  xpForNextLevel: number;
  level: number;
}

const XpBar: React.FC<XpBarProps> = ({ currentXp, xpForNextLevel, level }) => {
  const percentage = Math.min((currentXp / xpForNextLevel) * 100, 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-retro-yellow">
        <span className="font-press-start text-xs">LEVEL {level}</span>
        <span className="font-vt323 text-lg">{currentXp} / {xpForNextLevel} XP</span>
      </div>
      <div className="w-full bg-retro-purple border-2 border-black shadow-pixel-inset p-1">
        <div 
          className="bg-retro-cyan h-4 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default XpBar;
