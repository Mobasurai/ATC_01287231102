import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUserBookings, deleteUserBooking, deleteBookingForAdmin } from '../services/bookingsService';
import type { Booking } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';


const CalendarIcon = () => (
  <svg className="w-4 h-4 mr-1.5 inline text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
);
const LocationIcon = () => (
  <svg className="w-4 h-4 mr-1.5 inline text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();

  const PLACEHOLDER_IMAGE = `https://placehold.co/300x150.png?text=${t('bookings.placeholderImage')}`;

  const fetchBookings = useCallback(async () => {
    if (user && isAuthenticated) {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserBookings();
        setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError(t('bookings.errors.fetchBookings'));
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setBookings([]);
    }
  }, [user, isAuthenticated, t]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm(t('bookings.confirmations.cancelBooking'))) {
      return;
    }
    setCancellingId(bookingId);
    setFeedback(null);
    try {
      if (user && user.role === 'admin') {
        await deleteBookingForAdmin(bookingId);
      } else {
        await deleteUserBooking(bookingId);
      }
      setFeedback({ type: 'success', message: t('bookings.feedback.cancelSuccess') });
      setBookings(prevBookings => prevBookings.filter(b => b.id !== bookingId));
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || t('bookings.errors.cancelBooking') });
      console.error("Cancellation error:", err);
    } finally {
      setCancellingId(null);
    }
  };
  
  const getEventImageUrl = (event: Booking['event']): string => {
    const primaryImage = event.images?.find(img => img.isPrimary) || event.images?.[0];
    let imageUrl = primaryImage?.imageUrl;

    if (imageUrl) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = `${baseUrl}/eventbond-uploads/${imageUrl.replace(/\\/g, '/')}`;
      } else if (!imageUrl.startsWith('http')) {
        imageUrl = `${baseUrl}${imageUrl.replace(/\\/g, '/')}`;
      }
      return imageUrl;
    }
    return PLACEHOLDER_IMAGE;
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Loading state for the whole page
  if (loading && bookings.length === 0) { // Show full page loader only if no bookings are yet visible
    return (
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-3"></div>
          <p className="text-lg font-semibold text-sky-700">{t('bookings.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state for the whole page
  if (error && bookings.length === 0) { // Show full page error only if no bookings can be shown
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-2">{t('bookings.errors.fetchTitle')}</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-sky-700">{t('bookings.title')}</h1>
        {/* Optionally, a button to refresh bookings if needed */}
      </div>

      {feedback && (
        <div className={`p-4 mb-6 rounded-lg shadow-md ${feedback.type === 'success' ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-red-100 border border-red-300 text-red-700'}`}>
          {feedback.message}
        </div>
      )}

      {bookings.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-lg shadow-xl p-8">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v1.5M3 21v-1.5M21 3v1.5M21 21v-1.5M12 18.375V16.5m0-12v1.875m0 0A4.125 4.125 0 1012 15a4.125 4.125 0 000-8.625zM8.25 12H6m12 0h-2.25" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6.75h1.5a3 3 0 013 3v1.5M8.25 6.75H6.75a3 3 0 00-3 3v1.5m0 3.75V18a3 3 0 003 3h1.5m9-3.75V18a3 3 0 01-3 3h-1.5" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('bookings.noBookings.title')}</h2>
          <p className="text-gray-600 mb-6">{t('bookings.noBookings.message')}</p>
          <Link 
            to="/events" 
            className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {t('bookings.noBookings.exploreButton')}
          </Link>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="space-y-6 md:space-y-8">
          {bookings.map((booking) => {
            const eventTitle = i18n.language === 'ar' ? booking.event.titleAr || booking.event.title : booking.event.title;
            const eventVenue = i18n.language === 'ar' ? booking.event.venueAr || booking.event.venue : booking.event.venue;
            return (
            <div 
              key={booking.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row transition-shadow hover:shadow-2xl"
            >
              <Link to={`/events/${booking.event.id}`} className="md:w-1/3 block overflow-hidden">
                <img 
                  src={getEventImageUrl(booking.event)} 
                  alt={eventTitle} 
                  className="w-full h-48 md:h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                />
              </Link>
              <div className="p-5 md:p-6 flex-grow flex flex-col justify-between md:w-2/3">
                <div>
                  <Link to={`/events/${booking.event.id}`} className="hover:underline">
                    <h2 className="text-2xl font-semibold text-sky-700 mb-1.5 leading-tight">{eventTitle}</h2>
                  </Link>
                  <div className="text-sm text-gray-600 mb-3 space-y-1">
                    <p><CalendarIcon /> {t('bookings.labels.eventDate')}: {formatDate(booking.event.startDate)}</p>
                    <p><LocationIcon /> {t('bookings.labels.venue')}: {eventVenue}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t('bookings.labels.bookedOn')}: {formatDate(booking.createdAt!)}
                  </p>
                </div>
                <div className="mt-4 text-right">
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className={`bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={cancellingId === booking.id}
                  >
                    {cancellingId === booking.id ? t('bookings.buttons.cancelling') : t('bookings.buttons.cancel')}
                  </button>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;