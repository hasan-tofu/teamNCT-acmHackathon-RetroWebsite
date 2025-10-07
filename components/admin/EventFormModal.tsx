import React, { useState } from 'react';
import { Event, EventType } from '../../types';
import { createEvent, updateEvent } from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event | null;
    onSave: () => void;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, event, onSave }) => {
  const [formData, setFormData] = useState({
    name: event?.name || '',
    description: event?.description || '',
    date: event ? new Date(event.date).toISOString().substring(0, 10) : '',
    location: event?.location || '',
    xp_reward: event?.xp_reward || 10,
    image_url: event?.image_url || '',
    type: event?.type || 'Talk' as EventType,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      xp_reward: Number(formData.xp_reward),
      date: new Date(formData.date).toISOString(),
    };
    const success = event
      ? await updateEvent(event.id, payload)
      : await createEvent(payload);

    if (success) {
      onSave();
    } else {
      alert('Failed to save event.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event ? 'Edit Event' : 'Create Event'}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Event Name" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl focus:outline-none focus:border-retro-pink" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl focus:outline-none focus:border-retro-pink" rows={3} required />
          <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" required>
            <option>Talk</option>
            <option>Workshop</option>
            <option>Hackathon</option>
            <option>Faith & Tech</option>
          </select>
          <input name="date" value={formData.date} onChange={handleChange} type="date" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" required />
          <input name="location" value={formData.location} onChange={handleChange} placeholder="Location (e.g., Online, Room 101)" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" />
          <input name="xp_reward" value={formData.xp_reward} onChange={handleChange} type="number" placeholder="XP Reward" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" required />
          <input name="image_url" value={formData.image_url} onChange={handleChange} placeholder="Image URL (optional)" className="w-full p-2 bg-retro-purple border-2 border-black text-retro-white font-vt323 text-xl" />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Event</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EventFormModal;
