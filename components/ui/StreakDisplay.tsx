
import React, { useEffect, useState } from 'react';

interface StreakDisplayProps {
  streak: number;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak }) => {
  const [animationKey, setAnimationKey] = useState(0);

  // By changing the key, we force React to re-render the element, thus re-triggering the CSS animation.
  useEffect(() => {
    if (streak > 0) {
      setAnimationKey(key => key + 1);
    }
  }, [streak]);

  if (streak > 0) {
    return (
      <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 text-center sm:text-left">
        <span
          role="img"
          aria-label="streak flame"
          className="text-3xl animate-flame-flicker"
          style={{ textShadow: '0 0 5px #f0a500, 0 0 10px #e94560' }}
        >
          🔥
        </span>
        <div className="flex items-baseline gap-1 font-vt323 text-xl text-retro-white">
          <span key={animationKey} className="font-press-start text-retro-yellow text-2xl animate-pop-in">
            {streak}
          </span>
          <span>day streak!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 text-center sm:text-left">
      <span role="img" aria-label="cooled off flame" className="text-3xl opacity-50 grayscale">
        🔥
      </span>
      <p className="font-vt323 text-lg text-gray-400">
        Your streak has cooled off—log in tomorrow to reignite it!
      </p>
    </div>
  );
};

export default StreakDisplay;
