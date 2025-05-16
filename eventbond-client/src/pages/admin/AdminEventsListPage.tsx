import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, deleteEvent } from '../../services/eventService';
import type { Event as EventType, PaginatedEventsResponse } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const PLACEHOLDER_IMAGE = 'https://placehold.co/150x100?text=Event';

const EditIcon = () => (
  <svg className="w-4 h-4 mr-1 inline" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
);
const DeleteIcon = () => (
  <svg className="w-4 h-4 mr-1 inline" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
);

const AdminEventsListPage: React.FC = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { isAuthenticated } = useAuth();
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const fetchEvents = useCallback(async (page = 1, limit = 100) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        setError(null);
        setFeedback(null);
        const response: PaginatedEventsResponse = await getEvents(page, limit);
        setEvents(response.data);
      } catch (err) {
        setError('Failed to fetch events.');
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    } else {
      setError('You must be logged in to view events.');
      setLoading(false);
      setEvents([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDeleteEvent = async (eventId: number | string) => {
    if (!window.confirm('Are you sure you want to permanently delete this event? This action cannot be undone.')) {
      return;
    }
    setDeletingId(eventId);
    setFeedback(null);
    try {
      await deleteEvent(eventId);
      setFeedback({ type: 'success', message: 'Event deleted successfully.' });
      fetchEvents();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete event.' });
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };
  
  const getEventImageUrl = (event: EventType) => {
    const primaryImage = event.images?.find(img => img.isPrimary) || event.images?.[0];
    let imageUrl = primaryImage?.imageUrl;
    if (imageUrl) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        return `${baseUrl}/eventbond-uploads/${imageUrl.replace(/\\/g, '/')}`;
      } else if (!imageUrl.startsWith('http')) {
        return `${baseUrl}${imageUrl.replace(/\\/g, '/')}`;
      }
      return imageUrl;
    }
    return PLACEHOLDER_IMAGE;
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) return <p className="text-center mt-8 text-sky-700 font-semibold">Loading events...</p>;
  if (error) return (
    <div className="container mx-auto p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            {!isAuthenticated && (
              <Link to="/signin" className="text-sky-600 hover:text-sky-800 underline font-semibold mt-2 block">
                Please Sign In
              </Link>
            )}
        </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Events</h1>
        <Link 
          to="/admin/events/new" 
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4"></path></svg>
          Create New Event
        </Link>
      </div>

      {feedback && (
        <div className={`p-4 mb-6 rounded-lg shadow-md ${feedback.type === 'success' ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-red-100 border border-red-300 text-red-700'}`}>
          {feedback.message}
        </div>
      )}
      {events.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-xl p-8">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Events Found</h2>
          <p className="text-gray-600 mb-6">There are no events to manage yet. Get started by creating one.</p>
          <Link 
            to="/admin/events/new" 
            className="inline-flex items-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
             <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4"></path></svg>
            Create First Event
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={getEventImageUrl(event)} 
                      alt={event.title} 
                      className="w-20 h-12 object-cover rounded-md shadow-sm"
                      onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/events/${event.id}`} className="text-sm font-medium text-sky-600 hover:text-sky-800 hover:underline" title={`View event: ${event.title}`}>
                      {event.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(event.startDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs" title={event.venue}>{event.venue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.price?.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      to={`/admin/events/edit/${event.id}`}
                      className="text-yellow-600 hover:text-yellow-800 inline-flex items-center py-1 px-2 rounded-md hover:bg-yellow-100 transition-colors"
                      title="Edit Event"
                    >
                      <EditIcon /> Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-pink-600 hover:text-pink-800 inline-flex items-center py-1 px-2 rounded-md hover:bg-pink-100 transition-colors disabled:opacity-50"
                      disabled={deletingId === event.id}
                      title="Delete Event"
                    >
                      {deletingId === event.id ? 'Deleting...' : <><DeleteIcon /> Delete</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEventsListPage;