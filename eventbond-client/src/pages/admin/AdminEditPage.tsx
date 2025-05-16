import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventForm from '../../components/EventForm';
import { getEventById, updateEvent } from '../../services/eventService';
import type { Event as EventType, CreateEventPayload } from '../../types';

const AdminEventEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await getEventById(id);
          setEvent(data);
        } catch (err) {
          setError('Failed to fetch event details for editing.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id]);

  const handleSubmit = async (eventData: CreateEventPayload, eventId?: number) => {
    if (!eventId) return;
    const updatedEvent = await updateEvent(eventId, eventData);
    navigate('/admin/events', { state: { message: 'Event updated successfully!' } });
    return updatedEvent;
  };

  if (loading) return <p>Loading event data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!event) return <p>Event not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Event: {event.title}</h1>
      <EventForm initialEvent={event} onSubmit={handleSubmit} isEditMode={true} />
    </div>
  );
};

export default AdminEventEditPage;