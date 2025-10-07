import React, { useEffect, useState } from 'react';
import { StudyGroup, ProfileWithConnection } from '../types';
import { getStudyGroups, getUsersWithConnectionStatus } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { supabase, isMockMode } from '../services/supabaseClient';
import UserCard from '../components/community/UserCard';
import StudyGroupCard from '../components/community/StudyGroupCard';
import Card from '../components/ui/Card';

const CommunityPage: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<ProfileWithConnection[]>([]);
    const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        const [usersData, groupsData] = await Promise.all([
            getUsersWithConnectionStatus(user.id),
            getStudyGroups()
        ]);
        setUsers(usersData);
        setStudyGroups(groupsData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();

        if (isMockMode || !supabase) return;

        const channel = supabase.channel('online-users');
        const presenceSync = () => {
            const presenceState = channel.presenceState();
            const onlineIds = Object.keys(presenceState);
            setOnlineUserIds(new Set(onlineIds));
        };

        channel
            .on('presence', { event: 'sync' }, presenceSync)
            .on('presence', { event: 'join' }, ({ key }) => setOnlineUserIds(prev => new Set(prev).add(key)))
            .on('presence', { event: 'leave' }, ({ key }) => {
                setOnlineUserIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(key);
                    return newSet;
                });
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    presenceSync();
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);
    
    if (loading) {
        return <div className="text-center font-press-start text-2xl text-retro-yellow">LOADING COMMUNITY HUB...</div>;
    }

    return (
        <div>
            <h1 className="text-4xl font-press-start text-center text-retro-cyan mb-8">Community Hub</h1>

            <section>
                <h2 className="text-3xl font-press-start text-retro-yellow mb-6">Study Groups</h2>
                {studyGroups.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studyGroups.map(group => <StudyGroupCard key={group.id} group={group} />)}
                    </div>
                ) : (
                    <Card><p className="text-center font-vt323 text-xl">No study groups are available at the moment.</p></Card>
                )}
            </section>
            
            <section className="mt-12">
                 <h2 className="text-3xl font-press-start text-retro-yellow mb-6">All Users</h2>
                 {users.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {users.map(profile => (
                            <UserCard 
                                key={profile.id}
                                profile={profile}
                                isOnline={onlineUserIds.has(profile.id)}
                                onAction={fetchData} // Refetch data after a connection action
                            />
                        ))}
                    </div>
                ) : (
                    <Card><p className="text-center font-vt323 text-xl">No other players found in the system.</p></Card>
                )}
            </section>
        </div>
    );
};

export default CommunityPage;
