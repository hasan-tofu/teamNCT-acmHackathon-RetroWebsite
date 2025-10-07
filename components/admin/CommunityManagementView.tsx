import React, { useEffect, useState, useMemo } from 'react';
import { StudyGroup, Connection, Profile } from '../../types';
import { 
    getStudyGroups, 
    deleteStudyGroup, 
    getAllPendingConnections,
    adminApproveConnection,
    adminRejectConnection,
    getAllUsers
} from '../../services/api';
import Button from '../ui/Button';
import StudyGroupFormModal from './StudyGroupFormModal';
import StudyGroupMembersModal from './StudyGroupMembersModal';

type ViewMode = 'groups' | 'connections';

const CommunityManagementView: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('groups');
    const [loading, setLoading] = useState(true);

    // Group state
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);

    // Connection state
    const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
    const [allUsers, setAllUsers] = useState<Profile[]>([]);

    const usersMap = useMemo(() => {
        return allUsers.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, Profile>);
    }, [allUsers]);

    const fetchData = async () => {
        setLoading(true);
        const [groupsData, connectionsData, usersData] = await Promise.all([
            getStudyGroups(),
            getAllPendingConnections(),
            getAllUsers()
        ]);
        setGroups(groupsData);
        setPendingConnections(connectionsData);
        setAllUsers(usersData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenFormModal = (group: StudyGroup | null = null) => {
        setSelectedGroup(group);
        setIsFormModalOpen(true);
    };

    const handleOpenMembersModal = (group: StudyGroup) => {
        setSelectedGroup(group);
        setIsMembersModalOpen(true);
    };

    const handleDeleteGroup = async (groupId: number) => {
        if (confirm('Are you sure you want to delete this study group? All members will be removed. This cannot be undone.')) {
            const success = await deleteStudyGroup(groupId);
            if (success) {
                alert('Group deleted.');
                fetchData();
            } else {
                alert('Failed to delete group.');
            }
        }
    };

    const handleApproveConnection = async (conn: Connection) => {
        const success = await adminApproveConnection(conn.user_1_id, conn.user_2_id);
        if(success) fetchData();
        else alert('Failed to approve connection');
    };
    
    const handleRejectConnection = async (conn: Connection) => {
        const success = await adminRejectConnection(conn.user_1_id, conn.user_2_id);
        if(success) fetchData();
        else alert('Failed to reject connection');
    };

    const renderGroupsView = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-press-start text-retro-yellow">Manage Study Groups</h3>
                <Button onClick={() => handleOpenFormModal()}>+ Create Group</Button>
            </div>
            <div className="overflow-x-auto bg-retro-dark p-2 border-2 border-retro-purple">
                <table className="w-full font-vt323 text-lg text-left">
                    <thead>
                        <tr className="border-b-2 border-retro-purple text-retro-yellow">
                            <th className="p-3">Name</th>
                            <th className="p-3">Description</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.length > 0 ? (
                            groups.map((group) => (
                                <tr key={group.id} className="border-b border-dashed border-retro-purple/50">
                                    <td className="p-3 flex items-center gap-2"><span className="text-2xl">{group.icon}</span>{group.name}</td>
                                    <td className="p-3 truncate max-w-sm">{group.description}</td>
                                    <td className="p-3 text-center">
                                        <div className="flex gap-2 justify-center">
                                            <Button onClick={() => handleOpenMembersModal(group)} variant="primary" className="text-xs px-2 py-1">Members</Button>
                                            <Button onClick={() => handleOpenFormModal(group)} variant="secondary" className="text-xs px-2 py-1">Edit</Button>
                                            <Button onClick={() => handleDeleteGroup(group.id)} variant="danger" className="text-xs px-2 py-1">Delete</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="text-center p-4 text-retro-white">No study groups created yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderConnectionsView = () => (
         <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-press-start text-retro-yellow">Pending Connections</h3>
            </div>
            <div className="overflow-x-auto bg-retro-dark p-2 border-2 border-retro-purple">
                <table className="w-full font-vt323 text-lg text-left">
                    <thead>
                        <tr className="border-b-2 border-retro-purple text-retro-yellow">
                            <th className="p-3">Requester</th>
                            <th className="p-3">Requested</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingConnections.map((conn, index) => {
                            const requester = usersMap[conn.action_user_id];
                            const requested = usersMap[conn.user_1_id === conn.action_user_id ? conn.user_2_id : conn.user_1_id];
                            if(!requester || !requested) return null;

                            return (
                                <tr key={`${conn.user_1_id}-${conn.user_2_id}`} className="border-b border-dashed border-retro-purple/50">
                                    <td className="p-3 flex items-center gap-2"><img src={requester.avatar_url} className="w-8 h-8"/>{requester.username}</td>
                                    <td className="p-3 flex items-center gap-2"><img src={requested.avatar_url} className="w-8 h-8"/>{requested.username}</td>
                                    <td className="p-3 text-center">
                                        <div className="flex gap-2 justify-center">
                                            <Button onClick={() => handleApproveConnection(conn)} variant="primary" className="text-xs px-2 py-1">Approve</Button>
                                            <Button onClick={() => handleRejectConnection(conn)} variant="danger" className="text-xs px-2 py-1">Reject</Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                         {pendingConnections.length === 0 && (
                            <tr><td colSpan={3} className="p-4 text-center">No pending connection requests.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );


    if (loading) return <div className="text-center font-press-start text-retro-yellow">LOADING COMMUNITY DATA...</div>;

    return (
        <div>
            <div className="flex justify-center gap-4 mb-6">
                 <Button onClick={() => setViewMode('groups')} variant={viewMode === 'groups' ? 'primary' : 'secondary'}>Manage Groups</Button>
                 <Button onClick={() => setViewMode('connections')} variant={viewMode === 'connections' ? 'primary' : 'secondary'}>Manage Connections</Button>
            </div>

            {viewMode === 'groups' ? renderGroupsView() : renderConnectionsView()}

            <StudyGroupFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                group={selectedGroup}
                onSave={() => {
                    setIsFormModalOpen(false);
                    fetchData();
                }}
            />
             {selectedGroup && (
                <StudyGroupMembersModal
                    isOpen={isMembersModalOpen}
                    onClose={() => setIsMembersModalOpen(false)}
                    group={selectedGroup}
                />
            )}
        </div>
    );
};

export default CommunityManagementView;