import React, { useEffect, useState } from 'react';
import { getAdminAnalytics } from '../../services/api';
import { supabase, isMockMode } from '../../services/supabaseClient';
import { AdminAnalyticsData } from '../../types';

const AnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const data = await getAdminAnalytics();
      setAnalytics(data);
      setLoading(false);
    };

    fetchAnalytics();

    if (isMockMode || !supabase) return;

    // Subscribe to the shared 'online-users' channel to get presence data.
    const channel = supabase.channel('online-users');
    channel
      .on('presence', { event: 'sync' }, () => {
        // On sync, get the complete state of the channel to count online users.
        const presenceState = channel.presenceState();
        const count = Object.keys(presenceState).length;
        setOnlineUsers(count);
      })
      .subscribe();
      
    return () => {
        supabase.removeChannel(channel);
    }

  }, []);

  const StatCard: React.FC<{ title: string; value: number | string, color: string, glowColor: string }> = ({ title, value, color, glowColor }) => (
    <div className={`bg-retro-purple p-6 pixel-border border-4 ${color}`} style={{boxShadow: `0 0 15px ${glowColor}`}}>
      <h3 className="font-press-start text-lg text-retro-white mb-2">{title}</h3>
      <p className={`font-press-start text-5xl ${color.replace('border-', 'text-')} animate-sparkle`}>{value}</p>
    </div>
  );

  if (loading) {
    return <div className="text-center font-press-start text-retro-yellow">LOADING ANALYTICS...</div>;
  }

  if (!analytics) {
    return <div className="text-center font-press-start text-retro-pink">COULD NOT LOAD ANALYTICS.</div>;
  }

  return (
    <div>
        <h2 className="text-2xl font-press-start text-retro-yellow mb-6">SYSTEM OVERVIEW</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Active Users" value={onlineUsers} color="border-retro-cyan" glowColor="#53dd6c" />
            <StatCard title="Total Users" value={analytics.users} color="border-retro-yellow" glowColor="#f0a500" />
            <StatCard title="Total Admins" value={analytics.admins} color="border-retro-pink" glowColor="#e94560" />
            <StatCard title="Total Events" value={analytics.events} color="border-retro-cyan" glowColor="#53dd6c" />
            <StatCard title="Total Courses" value={analytics.courses} color="border-retro-yellow" glowColor="#f0a500" />
            <StatCard title="Rewards Redeemed" value={analytics.redemptions} color="border-retro-pink" glowColor="#e94560" />
        </div>
    </div>
  );
};

export default AnalyticsView;