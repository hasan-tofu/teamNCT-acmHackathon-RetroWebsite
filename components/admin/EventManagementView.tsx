import React, { useEffect, useState } from 'react';
import { Event } from '../../types';
import { getEvents, deleteEvent } from '../../services/api';
import Button from '../ui/Button';
import EventFormModal from './EventFormModal';

const EventManagementView: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    const data = await getEvents();
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenModal = (event: Event | null = null) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleDelete = async (eventId: number) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      const success = await deleteEvent(eventId);
      if (success) {
        alert('Event deleted.');
        fetchEvents();
      } else {
        alert('Failed to delete event.');
      }
    }
  };
  
  if (loading) {
    return <div className="text-center font-press-start text-retro-yellow">LOADING EVENTS...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-press-start text-retro-yellow">EVENT MANAGEMENT</h2>
        <Button onClick={() => handleOpenModal()}>+ Create Event</Button>
      </div>
      <div className="overflow-x-auto bg-retro-dark p-2 border-2 border-retro-purple">
        <table className="w-full font-vt323 text-lg text-left">
          <thead>
            <tr className="border-b-2 border-retro-purple text-retro-yellow">
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Date</th>
               <th className="p-3">Location</th>
              <th className="p-3 text-right">XP</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-dashed border-retro-purple/50">
                <td className="p-3">{event.name}</td>
                <td className="p-3">{event.type || 'N/A'}</td>
                <td className="p-3">{new Date(event.date).toLocaleDateString()}</td>
                <td className="p-3">{event.location || 'N/A'}</td>
                <td className="p-3 text-right text-retro-cyan">{event.xp_reward}</td>
                <td className="p-3 text-right space-x-2">
                  <Button onClick={() => handleOpenModal(event)} variant="secondary" className="text-xs px-2 py-1">Edit</Button>
                  <Button onClick={() => handleDelete(event.id)} variant="danger" className="text-xs px-2 py-1">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <EventFormModal 
            isOpen={isModalOpen} 
            onClose={handleCloseModal} 
            event={editingEvent}
            onSave={() => {
                handleCloseModal();
                fetchEvents();
            }} 
        />
      )}
    </div>
  );
};

export default EventManagementView;