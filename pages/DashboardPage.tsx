import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import XpBar from '../components/ui/XpBar';
import BadgeIcon from '../components/ui/BadgeIcon';
import { useNavigate } from 'react-router-dom';
import StreakDisplay from '../components/ui/StreakDisplay';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div>Loading user data...</div>;
  }
  
  const level = Math.floor(user.xp / 1000) + 1;
  const xpForNextLevel = level * 1000;
  const currentLevelXp = user.xp - ((level - 1) * 1000);

  const portalLinks = [
    { name: "Events Portal", path: "/events", color: "cyan" },
    { name: "Quests Log", path: "/courses", color: "pink" },
    { name: "Hall of Fame", path: "/leaderboard", color: "yellow" },
    { name: "Rewards Terminal", path: "/rewards", color: "purple" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Player Profile Column */}
      <div className="lg:col-span-1">
        <Card>
          <h2 className="font-press-start text-2xl text-center text-retro-yellow mb-4">Player Profile</h2>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden pixel-border border-4 border-retro-cyan mb-4">
                <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-press-start text-xl text-retro-white">{user.username}</h3>
            <p className="font-vt323 text-lg text-gray-400">{user.email}</p>
            <StreakDisplay streak={user.currentStreak} />
          </div>
          <div className="my-6">
            <XpBar currentXp={currentLevelXp} xpForNextLevel={1000} level={level} />
          </div>
          <div>
            <h4 className="font-press-start text-lg text-retro-yellow mb-3">Badge Inventory</h4>
            {user.badges.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {user.badges.map(badge => <BadgeIcon key={badge.id} badge={badge} />)}
                </div>
            ) : (
                <p className="font-vt323 text-lg text-gray-400">No badges earned yet. Go complete some quests!</p>
            )}
          </div>
        </Card>
      </div>

      {/* Navigation & Stats Column */}
      <div className="lg:col-span-2">
        <Card>
          <h2 className="font-press-start text-2xl text-retro-yellow mb-6">Navigation Map</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            {portalLinks.map(link => (
                <div key={link.path} onClick={() => navigate(link.path)}
                  className={`p-6 bg-retro-purple pixel-border border-4 border-retro-${link.color} cursor-pointer transition-transform duration-200 hover:scale-105 hover:bg-opacity-80 animate-border-flash`}
                  style={{ animationDelay: `${Math.random() * -1.5}s`}}
                  >
                  <p className="font-press-start text-lg text-retro-white">{link.name}</p>
                </div>
            ))}
          </div>
        </Card>
        <Card className="mt-8">
            <h2 className="font-press-start text-2xl text-retro-yellow mb-4">System Message</h2>
            <p className="font-vt323 text-2xl text-retro-white leading-relaxed">
                Welcome back, {user.username}. The system is online. New events and quests are available. Your mission, should you choose to accept it, is to continue learning and growing. Good luck.
            </p>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;