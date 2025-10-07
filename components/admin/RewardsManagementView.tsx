import React, { useEffect, useState } from 'react';
import { Reward, Redemption } from '../../types';
import { getRewards, deleteReward, getAllRedemptions, updateRedemptionStatus } from '../../services/api';
import Button from '../ui/Button';
import RewardsFormModal from './RewardsFormModal';

type ViewMode = 'manage' | 'redemptions';

const RewardsManagementView: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('manage');

  const fetchData = async () => {
    setLoading(true);
    const [rewardsData, redemptionsData] = await Promise.all([
      getRewards(),
      getAllRedemptions()
    ]);
    setRewards(rewardsData);
    setRedemptions(redemptionsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (reward: Reward | null = null) => {
    setEditingReward(reward);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReward(null);
  };

  const handleDelete = async (rewardId: number) => {
    if (confirm('Are you sure you want to delete this reward? This cannot be undone.')) {
      const success = await deleteReward(rewardId);
      if (success) {
        alert('Reward deleted.');
        fetchData();
      } else {
        alert('Failed to delete reward.');
      }
    }
  };

  const handleStatusChange = async (redemptionId: number, newStatus: 'Pending' | 'Completed') => {
    const success = await updateRedemptionStatus(redemptionId, newStatus);
    if(success) {
        alert("Status updated.");
        fetchData();
    } else {
        alert("Failed to update status.");
    }
  }

  if (loading) {
    return <div className="text-center font-press-start text-retro-yellow">LOADING REWARDS DATA...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-press-start text-retro-yellow">REWARDS MANAGEMENT</h2>
         <div className="flex gap-2">
            <Button variant={viewMode === 'manage' ? 'primary' : 'secondary'} onClick={() => setViewMode('manage')}>Manage Rewards</Button>
            <Button variant={viewMode === 'redemptions' ? 'primary' : 'secondary'} onClick={() => setViewMode('redemptions')}>View Redemptions</Button>
            {viewMode === 'manage' && <Button onClick={() => handleOpenModal()}>+ Create Reward</Button>}
         </div>
      </div>

    {viewMode === 'manage' ? (
        <div className="overflow-x-auto bg-retro-dark p-2 border-2 border-retro-purple">
            <table className="w-full font-vt323 text-lg text-left">
            <thead>
                <tr className="border-b-2 border-retro-purple text-retro-yellow">
                <th className="p-3">Icon</th>
                <th className="p-3">Name</th>
                <th className="p-3 text-right">XP Cost</th>
                <th className="p-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {rewards.map((reward) => (
                <tr key={reward.id} className="border-b border-dashed border-retro-purple/50">
                    <td className="p-3 text-3xl">{reward.icon}</td>
                    <td className="p-3">{reward.name}</td>
                    <td className="p-3 text-right text-retro-cyan">{reward.xp_cost}</td>
                    <td className="p-3 text-right space-x-2">
                    <Button onClick={() => handleOpenModal(reward)} variant="secondary" className="text-xs px-2 py-1">Edit</Button>
                    <Button onClick={() => handleDelete(reward.id)} variant="danger" className="text-xs px-2 py-1">Delete</Button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    ) : (
         <div className="overflow-x-auto bg-retro-dark p-2 border-2 border-retro-purple">
            <table className="w-full font-vt323 text-lg text-left">
            <thead>
                <tr className="border-b-2 border-retro-purple text-retro-yellow">
                    <th className="p-3">User</th>
                    <th className="p-3">Reward</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {redemptions.map((item) => (
                <tr key={item.id} className="border-b border-dashed border-retro-purple/50">
                    <td className="p-3">{item.user?.username || 'N/A'}</td>
                    <td className="p-3">{item.reward.name}</td>
                    <td className="p-3">{new Date(item.redeemed_at).toLocaleString()}</td>
                    <td className="p-3">
                        <span className={`px-2 py-1 text-sm font-press-start ${item.status === 'Pending' ? 'bg-retro-yellow text-black' : 'bg-retro-cyan text-black'}`}>{item.status}</span>
                    </td>
                    <td className="p-3 text-right">
                       {item.status === 'Pending' && (
                         <Button onClick={() => handleStatusChange(item.id, 'Completed')} variant="primary" className="text-xs px-2 py-1">Mark as Completed</Button>
                       )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    )}

      {isModalOpen && (
        <RewardsFormModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            reward={editingReward}
            onSave={() => {
                handleCloseModal();
                fetchData();
            }} 
        />
      )}
    </div>
  );
};

export default RewardsManagementView;