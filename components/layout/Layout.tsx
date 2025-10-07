import React, { ReactNode, useEffect } from 'react';
import Header from './Header';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!supabase || !user) return;

    // Use a single, shared channel name for all users to track presence globally.
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track the user's presence in this channel.
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

    // Cleanup: remove the channel subscription when the component unmounts.
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user]);


  return (
    <div className="min-h-screen bg-retro-dark text-retro-white font-vt323">
      <Header />
      <main className="container mx-auto px-4 pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;