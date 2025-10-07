import React, { useState, useEffect } from 'react';
import { Reward } from '../../types';
import { createReward, updateReward } from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface RewardsFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    reward: Reward | null;
    onSave: () => void;
}

const RewardsFormModal: React.FC<RewardsFormModalProps> = ({ isOpen, onClose, reward, onSave }) => {
    const [formData, setFormData] = useState({
        name: reward?.name || '',
        description: reward?.description || '',
        xp_cost: reward?.xp_cost || 100,
        icon: reward?.icon || '🎁',
    });

    useEffect(() => {
        if (reward) {
            setFormData({
                name: reward.name,
                description: reward.description,
                xp_cost: reward.xp_cost,
                icon: reward.icon,
            });
        } else {
            setFormData({ name: '', description: '', xp_cost: 100, icon: '🎁' });
        }
    }, [reward, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...formData, xp_cost: Number(formData.xp_cost) };
        const success = reward
            ? await updateReward(reward.id, payload)
            : await createReward(payload);

        if (success) {
            onSave();
        } else {
            alert('Failed to save reward.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={reward ? 'Edit Reward' : 'Create Reward'}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Reward Name" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl focus:outline-none focus:border-retro-pink" required />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl focus:outline-none focus:border-retro-pink" rows={3} required />
                    <input name="xp_cost" value={formData.xp_cost} onChange={handleChange} type="number" placeholder="XP Cost" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" required />
                    <input name="icon" value={formData.icon} onChange={handleChange} placeholder="Icon (e.g., ☕)" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" required maxLength={2}/>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Reward</Button>
                </div>
            </form>
        </Modal>
    );
};

export default RewardsFormModal;
