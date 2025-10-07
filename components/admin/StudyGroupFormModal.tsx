import React, { useState, useEffect } from 'react';
import { StudyGroup } from '../../types';
import { createStudyGroup, updateStudyGroup } from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface StudyGroupFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: StudyGroup | null;
    onSave: () => void;
}

const StudyGroupFormModal: React.FC<StudyGroupFormModalProps> = ({ isOpen, onClose, group, onSave }) => {
    const [formData, setFormData] = useState({ name: '', description: '', icon: '📚' });

    useEffect(() => {
        if (group) {
            setFormData({ name: group.name, description: group.description, icon: group.icon });
        } else {
            setFormData({ name: '', description: '', icon: '📚' });
        }
    }, [group, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = group
            ? await updateStudyGroup(group.id, formData)
            : await createStudyGroup(formData);

        if (success) {
            onSave();
        } else {
            alert('Failed to save study group.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={group ? 'Edit Study Group' : 'Create Study Group'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-retro-yellow font-vt323 text-2xl mb-2" htmlFor="name">Group Name</label>
                    <input name="name" id="name" value={formData.name} onChange={handleChange} className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" required />
                </div>
                 <div>
                    <label className="block text-retro-yellow font-vt323 text-2xl mb-2" htmlFor="icon">Icon</label>
                    <input name="icon" id="icon" value={formData.icon} onChange={handleChange} className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" required maxLength={2} />
                </div>
                <div>
                    <label className="block text-retro-yellow font-vt323 text-2xl mb-2" htmlFor="description">Description</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" rows={3} required />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
                    <Button type="submit">Save Group</Button>
                </div>
            </form>
        </Modal>
    );
};

export default StudyGroupFormModal;
