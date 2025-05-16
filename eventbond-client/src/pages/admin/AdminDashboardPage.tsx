import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getEvents, deleteEvent } from '../../services/eventService';
import type { Event as EventType, PaginatedEventsResponse } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const EditIcon = () => (
  <svg className="w-4 h-4 mr-1 inline" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
);
const DeleteIcon = () => (
  <svg className="w-4 h-4 mr-1 inline" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
);

const AdminDashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchAdminEvents = useCallback(async () => {
    if (!isAuthenticated) {
      setError(t('adminDashboard.errors.notAdmin'));
      setLoading(false);
      setEvents([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response: PaginatedEventsResponse = await getEvents(1, 100); 
      setEvents(response.data); 
    } catch (err) {
      console.error(t('adminDashboard.errors.fetchEventsConsole'), err);
      setError(t('adminDashboard.errors.fetchEventsUser'));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAdminEvents();
  }, [fetchAdminEvents]);

  const handleDeleteEvent = async (eventId: number | string) => {
    if (!window.confirm(t('adminDashboard.confirmations.deleteEvent'))) {
      return;
    }
    setDeletingId(eventId);
    setFeedback(null);
    try {
      await deleteEvent(eventId);
      setFeedback({ type: 'success', message: t('adminDashboard.feedback.deleteSuccess') });
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || t('adminDashboard.errors.deleteEvent') });
      console.error("Deletion error:", err);
    } finally {
      setDeletingId(null);
    }
  };
  
  const getEventImageUrl = (event: EventType): string => {
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
    return `https://placehold.co/150x100?text=${t('adminDashboard.eventPlaceholder')}`;
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        <p className="ml-3 text-sky-700 font-semibold">{t('adminDashboard.loadingEvents')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
        <p className="font-bold">{t('adminDashboard.errorTitle')}</p>
        <p>{error}</p>
        {!isAuthenticated && (
          <Link to="/signin" className="text-sky-600 hover:text-sky-800 underline font-semibold mt-2 block">
            {t('adminDashboard.pleaseSignIn')}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('adminDashboard.manageEventsTitle')}</h1>
        <Link 
          to="/admin/events/new" 
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
        >
          <svg className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4"></path></svg>
          {t('adminDashboard.buttons.createNewEvent')}
        </Link>
      </div>

      {feedback && (
        <div className={`p-4 mb-6 rounded-lg shadow-md ${feedback.type === 'success' ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-red-100 border border-red-300 text-red-700'}`}>
          {feedback.message}
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-xl p-8">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('adminDashboard.noEvents.title')}</h2>
          <p className="text-gray-600 mb-6">{t('adminDashboard.noEvents.message')}</p>
          <Link 
            to="/admin/events/new" 
            className="inline-flex items-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
             <svg className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4"></path></svg>
            {t('adminDashboard.buttons.createFirstEvent')}
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.table.image')}</th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.table.title')}</th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.table.date')}</th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.table.venue')}</th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.table.price')}</th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={getEventImageUrl(event)} 
                      alt={i18n.language === 'ar' ? event.titleAr || event.title : event.title} 
                      className="w-20 h-12 object-cover rounded-md shadow-sm"
                      onError={(e) => (e.currentTarget.src = `https://placehold.co/150x100?text=${t('adminDashboard.eventPlaceholder')}`)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/events/${event.id}`} className="text-sm font-medium text-sky-600 hover:text-sky-800 hover:underline" title={t('adminDashboard.viewEventLinkTitle', { title: i18n.language === 'ar' ? event.titleAr || event.title : event.title })}>
                      {i18n.language === 'ar' ? event.titleAr || event.title : event.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(event.startDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs" title={i18n.language === 'ar' ? event.venueAr || event.venue : event.venue}>{i18n.language === 'ar' ? event.venueAr || event.venue : event.venue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.price === 0 ? t('free') : `${event.price?.toFixed(2)} ${t('currency.egp')}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      to={`/admin/events/edit/${event.id}`}
                      className="text-yellow-600 hover:text-yellow-800 inline-flex items-center py-1 px-2 rounded-md hover:bg-yellow-100 transition-colors"
                      title={t('adminDashboard.buttons.editEventTitle')}
                    >
                      <EditIcon /> {t('adminDashboard.buttons.edit')}
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-pink-600 hover:text-pink-800 inline-flex items-center py-1 px-2 rounded-md hover:bg-pink-100 transition-colors disabled:opacity-50"
                      disabled={deletingId === event.id}
                      title={t('adminDashboard.buttons.deleteEventTitle')}
                    >
                      {deletingId === event.id ? t('adminDashboard.buttons.deleting') : <><DeleteIcon /> {t('adminDashboard.buttons.delete')}</>}
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

export default AdminDashboardPage;