import React, { useState, useEffect } from 'react';
import { ProfileWithConnection } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { sendConnectionRequest, acceptConnectionRequest } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface UserCardProps {
    profile: ProfileWithConnection;
    isOnline: boolean;
    onAction: () => void; // Callback to refetch data on the parent page
}

const UserCard: React.FC<UserCardProps> = ({ profile, isOnline, onAction }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [localStatus, setLocalStatus] = useState(profile.connectionStatus);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Sync local state if props change from parent
        setLocalStatus(profile.connectionStatus);
    }, [profile.connectionStatus]);

    const handleConnect = async () => {
        if (!user) return;
        setLoading(true);
        setAnimate(true); // Trigger animation
        setLocalStatus('pending_sent'); // Optimistic UI update

        const success = await sendConnectionRequest(user.id, profile.id);
        if (!success) {
            alert("Failed to send request.");
            setLocalStatus('not_connected'); // Revert on failure
        }
        // NOTE: onAction() is intentionally removed to prevent a full page data refresh,
        // providing an instant UI update as requested.
        setLoading(false);
    };

    const handleAccept = async () => {
        if (!user || !profile.actionUserId) return;
        setLoading(true);
        setAnimate(true);
        setLocalStatus('connected'); // Optimistic update

        const success = await acceptConnectionRequest(user.id, profile.actionUserId);
        if (!success) {
            alert("Failed to accept request.");
            setLocalStatus('pending_received'); // Revert
        }
        // NOTE: onAction() is intentionally removed to prevent a full page data refresh.
        setLoading(false);
    };

    const renderConnectButton = () => {
        switch (localStatus) {
            case 'not_connected':
                return <Button onClick={handleConnect} disabled={loading} className="w-full mt-auto">Connect</Button>;
            case 'pending_sent':
                return <Button disabled className="w-full mt-auto bg-retro-purple text-gray-400 cursor-not-allowed">Pending</Button>;
            case 'pending_received':
                return <Button onClick={handleAccept} disabled={loading} variant="secondary" className="w-full mt-auto">Accept</Button>;
            case 'connected':
                return <Button disabled className="w-full mt-auto bg-retro-cyan text-black">Connected</Button>;
            default:
                return null;
        }
    };
    
    return (
        <Card 
            className={`flex flex-col text-center items-center ${animate ? 'animate-card-flash' : ''}`}
            onAnimationEnd={() => setAnimate(false)}
        >
            <div className="relative">
                <img src={profile.avatar_url} alt={profile.username} className="w-20 h-20 bg-retro-dark border-2 border-black mb-2" />
                <div 
                    className={`absolute bottom-2 right-0 w-4 h-4 rounded-full border-2 border-retro-blue ${isOnline ? 'bg-retro-cyan' : 'bg-gray-500'}`}
                    title={isOnline ? 'Online' : 'Offline'}
                />
            </div>
            <p className="font-press-start text-retro-white text-base truncate w-full">{profile.username}</p>
            <p className="font-vt323 text-lg text-retro-cyan mb-3">LVL {Math.floor(profile.xp / 1000) + 1}</p>
            {renderConnectButton()}
        </Card>
    );
};

export default UserCard;