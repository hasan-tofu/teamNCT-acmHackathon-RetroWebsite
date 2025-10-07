import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { getLeaderboard } from '../services/api';
import { Link } from 'react-router-dom';

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const data = await getLeaderboard();
      setLeaderboard(data);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-retro-yellow';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-yellow-700';
    return 'text-retro-white';
  };

  if (loading) {
    return <div className="text-center font-press-start text-2xl text-retro-yellow">LOADING HALL OF FAME...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-press-start text-center text-retro-cyan mb-8">HIGH SCORES</h1>
      <div className="bg-retro-blue pixel-border border-4 border-retro-pink p-4">
        <div className="overflow-x-auto">
          <table className="w-full font-vt323 text-2xl">
            <thead>
              <tr className="border-b-4 border-retro-purple text-left text-retro-yellow">
                <th className="p-3 font-press-start text-lg">RANK</th>
                <th className="p-3 font-press-start text-lg">PLAYER</th>
                <th className="p-3 font-press-start text-lg text-right">LEVEL</th>
                <th className="p-3 font-press-start text-lg text-right">XP</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry.id} className={`border-b-2 border-dashed border-retro-purple ${index % 2 === 0 ? 'bg-retro-purple/30' : ''}`}>
                  <td className={`p-3 font-press-start text-2xl ${getRankColor(entry.rank)}`}>{entry.rank}</td>
                  <td className="p-3">
                    <Link to={`/profile/${entry.id}`} className="flex items-center hover:opacity-80 transition-opacity">
                      <img src={entry.avatar_url} alt={entry.username} className="w-10 h-10 mr-4 border-2 border-black" />
                      <span className="flex items-center gap-2">
                        {entry.username}
                        {entry.role === 'admin' && <span className="text-xs font-press-start text-retro-cyan">[ADMIN]</span>}
                      </span>
                    </Link>
                  </td>
                  <td className="p-3 text-right">{entry.level}</td>
                  <td className="p-3 text-right text-retro-cyan">{entry.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;