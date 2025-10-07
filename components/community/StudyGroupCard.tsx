import React, { useState } from 'react';
import { StudyGroup } from '../../types';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { requestToJoinStudyGroup } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface StudyGroupCardProps {
    group: StudyGroup;
}

const StudyGroupCard: React.FC<StudyGroupCardProps> = ({ group }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [requested, setRequested] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRequestJoin = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click navigation
        if (!user) return;
        setLoading(true);
        const success = await requestToJoinStudyGroup(group.id, user.id);
        if (success) {
            setRequested(true);
        } else {
            alert("Failed to send join request. You may already be a member or have a pending request.");
        }
        setLoading(false);
    };

    return (
        <Card interactive onClick={() => navigate(`/study-groups/${group.id}`)} className="cursor-pointer">
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl bg-retro-purple p-3 border-2 border-black">{group.icon}</div>
                    <h3 className="font-press-start text-xl text-retro-yellow truncate">{group.name}</h3>
                </div>
                <p className="font-vt323 text-lg text-retro-white flex-grow mb-4">{group.description}</p>
                <Button 
                    onClick={handleRequestJoin} 
                    disabled={requested || loading}
                    variant="secondary"
                    className="w-full mt-auto"
                >
                    {loading ? 'Sending...' : requested ? 'Request Sent' : 'Request to Join'}
                </Button>
            </div>
        </Card>
    );
};

export default StudyGroupCard;