import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Profile, Badge } from '../types';
import { getProfile, getUserBadges } from '../services/api';
import Card from '../components/ui/Card';
import XpBar from '../components/ui/XpBar';
import BadgeIcon from '../components/ui/BadgeIcon';
import Button from '../components/ui/Button';
import EditProfileModal from '../components/profile/EditProfileModal';

const ProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: currentUser, refreshUserProfile } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    const fetchProfileData = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const profileData = await getProfile(userId);
            const badgeData = await getUserBadges(userId);
            setProfile(profileData);
            setBadges(badgeData);
        } catch (error) {
            console.error("Failed to fetch profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [userId]);

    const handleProfileUpdate = () => {
        // Refresh the profile page data
        fetchProfileData();
        // Refresh the global user state in AuthContext if it's the current user
        if (currentUser?.id === userId) {
            refreshUserProfile();
        }
    }

    if (loading) {
        return <div className="text-center font-press-start text-2xl text-retro-yellow">LOADING PROFILE...</div>;
    }

    if (!profile) {
        return <div className="text-center font-press-start text-2xl text-retro-pink">USER NOT FOUND.</div>;
    }

    const isOwnProfile = currentUser?.id === profile.id;
    const level = Math.floor(profile.xp / 1000) + 1;
    const currentLevelXp = profile.xp - ((level - 1) * 1000);

    return (
        <div>
            <Card>
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                    <img
                        src={profile.avatar_url}
                        alt="User Avatar"
                        className="w-32 h-32 pixel-border border-4 border-retro-cyan mb-4 sm:mb-0 sm:mr-6 bg-retro-dark"
                    />
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-x-4">
                           <h1 className="font-press-start text-3xl text-retro-white">{profile.username}</h1>
                           {profile.role === 'admin' && <span className="text-sm font-press-start text-retro-cyan">[ADMIN]</span>}
                           {isOwnProfile && (
                                <Button onClick={() => setEditModalOpen(true)} className="mt-2 sm:mt-0 text-xs px-2 py-1">Edit</Button>
                           )}
                        </div>
                        <p className="font-vt323 text-lg text-gray-400 mt-1">{profile.email || currentUser?.email}</p>
                        <p className="font-vt323 text-xl text-retro-white my-4 italic">
                            {profile.bio || "This user has not set a bio yet."}
                        </p>
                        <div className="max-w-md">
                           <XpBar currentXp={currentLevelXp} xpForNextLevel={1000} level={level} />
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="mt-8">
                <h2 className="font-press-start text-2xl text-retro-yellow mb-4">Badge Inventory</h2>
                {badges.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                        {badges.map(badge => <BadgeIcon key={badge.id} badge={badge} />)}
                    </div>
                ) : (
                    <p className="font-vt323 text-lg text-gray-400">No badges earned yet.</p>
                )}
            </Card>

            {isOwnProfile && currentUser && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    user={currentUser}
                    onSave={handleProfileUpdate}
                />
            )}
        </div>
    );
};

export default ProfilePage;