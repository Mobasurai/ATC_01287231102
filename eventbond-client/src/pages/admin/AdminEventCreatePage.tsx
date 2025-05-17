import React from 'react';
import { useNavigate } from 'react-router-dom';
import EventForm from '../../components/EventForm';
import { createEvent } from '../../services/eventService';
import type { CreateEventPayload } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const AdminEventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (eventData: CreateEventPayload) => {
    if (!user) throw new Error('No authenticated user');
    const payload = { ...eventData };
    const newEvent = await createEvent(payload);
    navigate('/admin/events', { state: { message: 'Event created successfully!' } });
    return newEvent;
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New Event</h1>
      <EventForm onSubmit={handleSubmit} isEditMode={false} />
    </div>
  );
};

export default AdminEventCreatePage;