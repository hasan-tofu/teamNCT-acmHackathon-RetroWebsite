
import React, { useEffect, useState } from 'react';
import { Reward, Redemption } from '../types';
import { getRewards, getUserRedemptions, redeemReward } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const RewardsPage: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [rewardsData, redemptionsData] = await Promise.all([
      getRewards(),
      getUserRedemptions(user.id),
    ]);
    setRewards(rewardsData);
    setRedemptions(redemptionsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setFeedbackMessage('');
    setIsModalOpen(true);
  };

  const handleConfirmRedeem = async () => {
    if (!user || !selectedReward) return;

    setIsSubmitting(true);
    const result = await redeemReward(user.id, selectedReward.id);
    setIsSubmitting(false);

    if (result.success) {
      setFeedbackMessage("Reward redeemed successfully! You'll receive it soon.");
      refreshUserProfile(); // Update global user XP state
      fetchData(); // Refresh page data
    } else {
      setFeedbackMessage(`Redemption failed: ${result.message}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReward(null);
    setFeedbackMessage('');
  };

  if (loading) {
    return <div className="text-center font-press-start text-2xl text-retro-yellow">LOADING REWARDS TERMINAL...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-press-start text-center text-retro-cyan mb-2">REWARDS TERMINAL</h1>
      <p className="text-center font-vt323 text-2xl text-retro-white mb-8">Earn XP. Redeem Real Rewards. Level Up Your Campus Life.</p>
      
      <Card className="mb-8">
        <div className="text-center">
            <span className="font-vt323 text-2xl text-retro-white">Your Current Balance: </span>
            <span className="font-press-start text-3xl text-retro-yellow animate-sparkle">{user?.xp} XP</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map(reward => (
          <Card key={reward.id} interactive className="flex flex-col">
            <div className="text-5xl text-center mb-4">{reward.icon}</div>
            <h2 className="font-press-start text-xl text-retro-yellow mb-2 text-center">{reward.name}</h2>
            <p className="font-vt323 text-lg text-gray-300 mb-4 flex-grow">{reward.description}</p>
            <div className="border-t-2 border-dashed border-retro-purple my-3"></div>
            <p className="font-press-start text-2xl text-retro-cyan text-center mb-4">{reward.xp_cost} XP</p>
            <Button 
              onClick={() => handleRedeemClick(reward)}
              disabled={user ? user.xp < reward.xp_cost : true}
              className="w-full mt-auto"
            >
              {user && user.xp < reward.xp_cost ? 'Not Enough XP' : 'Redeem'}
            </Button>
          </Card>
        ))}
      </div>

      <h2 className="text-3xl font-press-start text-center text-retro-yellow my-12">My Redemptions</h2>
      <Card>
        {redemptions.length > 0 ? (
            <ul>
                {redemptions.map(item => (
                    <li key={item.id} className="flex justify-between items-center p-3 font-vt323 text-2xl border-b-2 border-dashed border-retro-purple last:border-b-0">
                        <div className="flex items-center">
                            <span className="text-3xl mr-4">{item.reward.icon}</span>
                            <div>
                                <p className="text-retro-white">{item.reward.name}</p>
                                <p className="text-sm text-gray-400">{new Date(item.redeemed_at).toLocaleString()}</p>
                            </div>
                        </div>
                         <div className="text-right">
                           <span className={`px-2 py-1 text-sm font-press-start ${item.status === 'Pending' ? 'bg-retro-yellow text-black' : 'bg-retro-cyan text-black'}`}>{item.status}</span>
                           <p className="text-retro-cyan text-lg">-{item.reward.xp_cost} XP</p>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="font-vt323 text-2xl text-center text-retro-white">You haven't redeemed any rewards yet.</p>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Confirm Redemption">
        {selectedReward && (
          <div className="text-center">
            {!feedbackMessage ? (
              <>
                <p className="font-vt323 text-2xl text-retro-white mb-4">
                  Redeem <span className="text-retro-yellow font-bold">{selectedReward.name}</span> for <span className="text-retro-cyan font-bold">{selectedReward.xp_cost} XP</span>?
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <Button onClick={closeModal} variant="secondary" disabled={isSubmitting}>Cancel</Button>
                  <Button onClick={handleConfirmRedeem} variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Confirm'}
                  </Button>
                </div>
              </>
            ) : (
                 <>
                    <p className="font-vt323 text-2xl text-retro-white mb-6">{feedbackMessage}</p>
                    <Button onClick={closeModal} variant="primary">Close</Button>
                 </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RewardsPage;
