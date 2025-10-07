import React, { useEffect, useState, useMemo } from 'react';
import { StudyGroup, Profile, StudyGroupMember } from '../../types';
import { 
    getAllUsers, 
    getStudyGroupMembers, 
    addStudyGroupMember,
    removeStudyGroupMember,
    approveStudyGroupJoinRequest,
} from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface StudyGroupMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: StudyGroup;
}

const StudyGroupMembersModal: React.FC<StudyGroupMembersModalProps> = ({ isOpen, onClose, group }) => {
    const [allUsers, setAllUsers] = useState<Profile[]>([]);
    const [members, setMembers] = useState<StudyGroupMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserToAdd, setSelectedUserToAdd] = useState('');

    const usersMap = useMemo(() => {
        return allUsers.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, Profile>);
    }, [allUsers]);

    const fetchData = async () => {
        setLoading(true);
        const [usersData, membersData] = await Promise.all([
            getAllUsers(),
            getStudyGroupMembers(group.id),
        ]);
        setAllUsers(usersData);
        setMembers(membersData);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, group.id]);

    const { currentMembers, pendingRequests, potentialNewMembers } = useMemo(() => {
        const memberIds = new Set(members.map(m => m.user_id));
        const currentMembers = members.filter(m => m.status === 'member');
        const pendingRequests = members.filter(m => m.status === 'pending_request');
        const potentialNewMembers = allUsers.filter(u => !memberIds.has(u.id));
        setSelectedUserToAdd(potentialNewMembers[0]?.id || '');
        return { currentMembers, pendingRequests, potentialNewMembers };
    }, [members, allUsers]);

    const handleAddUser = async () => {
        if (!selectedUserToAdd) return;
        const success = await addStudyGroupMember(group.id, selectedUserToAdd);
        if(success) fetchData(); else alert("Failed to add user.");
    };
    
    const handleRemoveUser = async (userId: string) => {
        const success = await removeStudyGroupMember(group.id, userId);
        if(success) fetchData(); else alert("Failed to remove user.");
    };

    const handleApproveRequest = async (userId: string) => {
        const success = await approveStudyGroupJoinRequest(group.id, userId);
        if(success) fetchData(); else alert("Failed to approve request.");
    };
    
    // Reject is the same as remove
    const handleRejectRequest = handleRemoveUser;

    const UserRow: React.FC<{ user: Profile, children: React.ReactNode }> = ({ user, children }) => (
        <div className="flex justify-between items-center p-2 border-b border-dashed border-retro-purple/50">
            <div className="flex items-center gap-2">
                <img src={user.avatar_url} className="w-8 h-8" alt={user.username}/>
                <span>{user.username}</span>
            </div>
            <div className="flex gap-1">{children}</div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Manage: ${group.name}`}>
            {loading ? (
                <p className="text-center font-press-start text-retro-yellow">Loading members...</p>
            ) : (
                <div className="font-vt323 text-xl max-h-[60vh] overflow-y-auto">
                    {/* Add Member Section */}
                    <div className="bg-retro-dark p-2 border-2 border-retro-purple mb-4">
                         <h3 className="font-press-start text-retro-yellow text-lg mb-2">Add Member</h3>
                         <div className="flex gap-2">
                            <select 
                                value={selectedUserToAdd} 
                                onChange={(e) => setSelectedUserToAdd(e.target.value)}
                                className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white"
                            >
                                {potentialNewMembers.length > 0 ? (
                                    potentialNewMembers.map(user => <option key={user.id} value={user.id}>{user.username}</option>)
                                ) : (
                                    <option>No users to add</option>
                                )}
                            </select>
                            <Button onClick={handleAddUser} disabled={!selectedUserToAdd}>Add</Button>
                         </div>
                    </div>
                    
                    {/* Pending Requests */}
                    {pendingRequests.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-press-start text-retro-cyan text-lg mb-2">Pending Requests ({pendingRequests.length})</h3>
                            {pendingRequests.map(req => {
                                const user = usersMap[req.user_id];
                                if (!user) return null;
                                return (
                                    <UserRow key={user.id} user={user}>
                                        <Button onClick={() => handleApproveRequest(user.id)} variant="primary" className="text-xs px-1 py-0.5">Approve</Button>
                                        <Button onClick={() => handleRejectRequest(user.id)} variant="danger" className="text-xs px-1 py-0.5">Reject</Button>
                                    </UserRow>
                                );
                            })}
                        </div>
                    )}

                    {/* Current Members */}
                    <div>
                        <h3 className="font-press-start text-retro-yellow text-lg mb-2">Current Members ({currentMembers.length})</h3>
                         {currentMembers.map(member => {
                            const user = usersMap[member.user_id];
                            if (!user) return null;
                            return (
                                <UserRow key={user.id} user={user}>
                                    <Button onClick={() => handleRemoveUser(user.id)} variant="danger" className="text-xs px-1 py-0.5">Remove</Button>
                                </UserRow>
                            );
                        })}
                        {currentMembers.length === 0 && <p className="text-center p-2">No members yet.</p>}
                    </div>

                </div>
            )}
        </Modal>
    );
};

export default StudyGroupMembersModal;
