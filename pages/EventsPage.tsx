import React, { useEffect, useState } from 'react';
import { Event, EventType } from '../types';
import { getEvents, completeEvent, getUserCompletedEventIds } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [completedEvent, setCompletedEvent] = useState<Event | null>(null);
  const [attendedEventIds, setAttendedEventIds] = useState<Set<number>>(new Set());
  const { user, refreshUserProfile } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const data = await getEvents();
      // Sort events by date, newest first
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(data);
      if (user) {
        const attendedIds = await getUserCompletedEventIds(user.id);
        setAttendedEventIds(attendedIds);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [user]);

  const handleParticipate = async (event: Event) => {
    if (!user) return;
    const success = await completeEvent(user.id, event);
    if (success) {
      setCompletedEvent(event);
      setModalOpen(true);
      // Optimistic update
      setAttendedEventIds(prev => new Set(prev).add(event.id));
      refreshUserProfile(); // Refresh user data to show new XP
    } else {
      alert("Failed to record event completion. You may have already participated.");
    }
  };
  
  const EventCard: React.FC<{ event: Event, attended: boolean }> = ({ event, attended }) => (
    <Card interactive={!attended} className={`flex flex-col ${attended ? 'opacity-70' : ''}`}>
      <div className="flex flex-col h-full flex-grow">
        <h2 className="font-press-start text-xl text-retro-yellow mb-2">{event.name}</h2>
        <p className="font-vt323 text-lg text-gray-300 mb-4 flex-grow">{event.description}</p>
        <div className="border-t-2 border-dashed border-retro-purple my-3"></div>
        <p className="font-vt323 text-lg text-retro-white mb-1">
          <span className="font-bold text-retro-cyan">Date:</span> {new Date(event.date).toLocaleDateString()}
        </p>
         <p className="font-vt323 text-lg text-retro-white mb-1">
          <span className="font-bold text-retro-cyan">Location:</span> {event.location || 'TBA'}
        </p>
        <p className="font-vt323 text-lg text-retro-pink mb-4">
          <span className="font-bold">XP Reward:</span> {event.xp_reward} XP
        </p>
        <Button onClick={() => handleParticipate(event)} className="w-full mt-auto" disabled={attended}>
          {attended ? 'Attended' : 'Participate'}
        </Button>
      </div>
    </Card>
  );

  if (loading) {
    return <div className="text-center font-press-start text-2xl text-retro-yellow">LOADING EVENTS...</div>;
  }
  
  const upcomingEvents = events.filter(event => !attendedEventIds.has(event.id));
  const attendedEvents = events.filter(event => attendedEventIds.has(event.id));

  return (
    <div>
      <h1 className="text-4xl font-press-start text-center text-retro-cyan mb-8">Upcoming Events</h1>
      {upcomingEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map(event => <EventCard key={event.id} event={event} attended={false} />)}
        </div>
      ) : (
         <Card><p className="font-vt323 text-2xl text-center text-retro-white">No upcoming events — check back soon!</p></Card>
      )}

      {attendedEvents.length > 0 && (
        <>
          <h2 className="text-3xl font-press-start text-center text-retro-yellow my-12">Your Attended Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attendedEvents.map(event => <EventCard key={event.id} event={event} attended={true} />)}
          </div>
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="EVENT COMPLETE!">
        {completedEvent && (
          <div className="text-center">
            <p className="font-vt323 text-2xl text-retro-white mb-4">
              You have participated in <span className="text-retro-yellow font-bold">{completedEvent.name}</span>!
            </p>
            <p className="font-press-start text-3xl text-retro-cyan animate-sparkle">
              +{completedEvent.xp_reward} XP
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EventsPage;
