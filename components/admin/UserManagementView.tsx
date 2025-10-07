import React, { useEffect, useState } from 'react';
import { Profile } from '../../types';
import { getAllUsers, updateUserRole, deleteUser } from '../../services/api';
import { supabase, isMockMode } from '../../services/supabaseClient';
import Button from '../ui/Button';
import UserAddModal from './UserAddModal';

const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    // Sort by role first, then username
    data.sort((a, b) => {
        if (a.role > b.role) return -1;
        if (a.role < b.role) return 1;
        return a.username.localeCompare(b.username);
    });
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();

    if (isMockMode || !supabase) return;

    // Subscribe to the shared 'online-users' channel for presence updates.
    const channel = supabase.channel('online-users');
    channel
      .on('presence', { event: 'sync' }, () => {
        // The keys of the presence state are the user IDs.
        const presenceState = channel.presenceState();
        const onlineIds = Object.keys(presenceState);
        setOnlineUserIds(new Set(onlineIds));
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        // The 'key' is the user ID that just joined.
        setOnlineUserIds(prev => new Set(prev).add(key));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        // The 'key' is the user ID that just left.
        setOnlineUserIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'student' | 'admin') => {
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
        const success = await updateUserRole(userId, newRole);
        if (success) {
            alert("Role updated successfully!");
            fetchUsers();
        } else {
            alert("Failed to update role.");
        }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('WARNING: Deleting a user is permanent and cannot be undone. Are you sure?')) {
        const success = await deleteUser(userId);
        if (success) {
            alert("User deleted successfully.");
            fetchUsers();
        } else {
            alert("Failed to delete user.");
        }
    }
  }


  if (loading) {
    return <div className="text-center font-press-start text-retro-yellow">LOADING USERS...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-press-start text-retro-yellow">USER MANAGEMENT</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>+ Add User</Button>
      </div>
      <div className="overflow-x-auto bg-retro-dark p-2 border-2 border-retro-purple">
        <table className="w-full font-vt323 text-lg text-left">
          <thead>
            <tr className="border-b-2 border-retro-purple text-retro-yellow">
              <th className="p-3">Status</th>
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-right">XP</th>
              <th className="p-3 text-right">Streak</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
                users.map((user) => (
              <tr key={user.id} className="border-b border-dashed border-retro-purple/50">
                <td className="p-3">
                  {onlineUserIds.has(user.id) ? (
                    <span className="text-retro-cyan flex items-center gap-2">● Online</span>
                  ) : (
                    <span className="text-gray-500 flex items-center gap-2">○ Offline</span>
                  )}
                </td>
                <td className="p-3 flex items-center">
                  <img src={user.avatar_url} alt={user.username} className="w-8 h-8 mr-3" />
                  {user.username}
                </td>
                <td className="p-3 text-retro-white">{user.email}</td>
                <td className="p-3">
                    <span className={`px-2 py-1 text-sm font-press-start ${user.role === 'admin' ? 'bg-retro-cyan text-black' : 'bg-retro-yellow text-black'}`}>
                        {user.role}
                    </span>
                </td>
                <td className="p-3 text-right text-retro-cyan">{user.xp}</td>
                <td className="p-3 text-right text-retro-yellow">{user.current_streak}</td>
                <td className="p-3 text-right">
                  <div className="flex gap-2 justify-end">
                    {user.role === 'student' ? (
                      <Button onClick={() => handleRoleChange(user.id, 'admin')} variant="primary" className="text-xs px-2 py-1">Promote</Button>
                    ) : (
                       <Button onClick={() => handleRoleChange(user.id, 'student')} variant="secondary" className="text-xs px-2 py-1">Demote</Button>
                    )}
                    <Button onClick={() => handleDeleteUser(user.id)} variant="danger" className="text-xs px-2 py-1">Delete</Button>
                  </div>
                </td>
              </tr>
            ))
            ) : (
                <tr>
                    <td colSpan={7} className="text-center p-4 text-retro-white">No users found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      <UserAddModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={() => {
            setIsAddModalOpen(false);
            fetchUsers();
        }}
      />
    </div>
  );
};

export default UserManagementView;