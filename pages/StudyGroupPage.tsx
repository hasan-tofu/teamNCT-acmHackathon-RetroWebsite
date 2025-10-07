import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StudyGroupDetails } from '../types';
import { getStudyGroupDetails } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const StudyGroupPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<StudyGroupDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [membersLoading, setMembersLoading] = useState(true);

    useEffect(() => {
        const fetchGroup = async () => {
            if (!groupId) return;
            setLoading(true);
            setMembersLoading(true);
            const data = await getStudyGroupDetails(Number(groupId));
            setGroup(data);
            setLoading(false);
            setMembersLoading(false);
        };
        fetchGroup();
    }, [groupId]);

    if (loading) {
        return <div className="text-center font-press-start text-2xl text-retro-yellow">LOADING STUDY GROUP...</div>;
    }

    if (!group) {
        return <div className="text-center font-press-start text-2xl text-retro-pink">STUDY GROUP NOT FOUND.</div>;
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                 <Button onClick={() => navigate('/community')} variant="secondary">
                    &lt; Back to Community
                 </Button>
            </div>
            <Card className="text-center mb-8">
                <div className="text-6xl mb-4">{group.icon}</div>
                <h1 className="text-5xl font-press-start text-retro-cyan mb-2">{group.name}</h1>
                <p className="font-vt323 text-2xl text-retro-white max-w-2xl mx-auto">{group.description}</p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h2 className="font-press-start text-2xl text-retro-yellow mb-4">Member Roster</h2>
                    {membersLoading ? (
                         <p className="font-vt323 text-xl text-retro-white text-center">Loading members...</p>
                    ) : group.members.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto">
                            <ul>
                                {group.members.map((member) => (
                                    <li key={member.id} className="border-b-2 border-dashed border-retro-purple last:border-b-0">
                                        <Link to={`/profile/${member.id}`} className="flex items-center p-3 hover:bg-retro-purple/50 transition-colors">
                                            <img src={member.avatar_url} alt={member.username} className="w-10 h-10 mr-4 border-2 border-black" />
                                            <span className="font-vt323 text-2xl flex items-center gap-2">
                                                {member.username}
                                                {member.role === 'admin' && <span className="text-xs font-press-start text-retro-cyan">[ADMIN]</span>}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                         <p className="font-vt323 text-xl text-retro-white text-center p-4">No members have joined yet.</p>
                    )}
                </Card>
                <Card>
                    <h2 className="font-press-start text-2xl text-retro-yellow mb-4">Discussion Board</h2>
                    <div className="text-center p-8 border-2 border-dashed border-retro-purple">
                        <p className="font-vt323 text-2xl text-retro-white">Discussion board feature coming soon!</p>
                        <p className="text-lg text-gray-400 mt-2">Check back later for updates.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StudyGroupPage;