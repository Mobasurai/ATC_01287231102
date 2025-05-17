import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { getEventById } from '../services/eventService';
import { getUserBookings, createBooking } from '../services/bookingsService'; // Added createBooking
import type { Event as EventType } from '../types';


const CalendarIcon = () => (
  <svg className="w-5 h-5 mr-2 inline text-sky-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
);
const ClockIcon = () => (
  <svg className="w-5 h-5 mr-2 inline text-sky-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const LocationIcon = () => (
  <svg className="w-5 h-5 mr-2 inline text-sky-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);
const TagIcon = () => (
  <svg className="w-5 h-5 mr-2 inline text-sky-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm10 10h.01M17 13h5a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2v-5a2 2 0 012-2z"></path></svg>
);
const UserIcon = () => (
  <svg className="w-5 h-5 mr-2 inline text-sky-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
);

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const PLACEHOLDER_IMAGE = `https://placehold.co/1200x600.png?text=${t('eventDetail.bannerPlaceholder')}`;

  const getFullImageUrl = useCallback((imagePath?: string): string => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    if (imagePath.startsWith('/')) {
        return `${baseUrl}${imagePath.replace(/\\/g, '/')}`;
    }
    return `${baseUrl}/eventbond-uploads/${imagePath.replace(/\\/g, '/')}`;
  }, []);

  const sortedImages = useMemo(() => {
    if (!event?.images || event.images.length === 0) {
      return [];
    }
    const primary = event.images.find(img => img.isPrimary);
    const others = event.images.filter(img => !img.isPrimary);
    return primary ? [primary, ...others] : others;
  }, [event?.images]);

  useEffect(() => {
    if (id) {
      const fetchEventAndCheckBooking = async () => {
        try {
          setLoading(true);
          setError(null);
          setBookingMessage(null);
          setBookingError(null);
          setIsAlreadyBooked(false);

          const eventData = await getEventById(id);
          setEvent(eventData);

          if (isAuthenticated && user && eventData) {
            try {
              const userBookings = await getUserBookings();
              const alreadyBooked = userBookings.some(booking => booking.event?.id === eventData.id);
              if (alreadyBooked) {
                setIsAlreadyBooked(true);
              }
            } catch (bookingFetchError) {
              console.error(t('eventDetail.errors.fetchBookingsConsole'), bookingFetchError);
            }
          }
        } catch (err) {
          console.error(t('eventDetail.errors.fetchEventConsole'), err);
          setError(t('eventDetail.errors.fetchEventUser'));
        } finally {
          setLoading(false);
        }
      };
      fetchEventAndCheckBooking();
    }
  }, [id, isAuthenticated, user]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [sortedImages]);

  const handleNextImage = () => {
    setCurrentImageIndex(prevIndex => 
      sortedImages.length > 0 ? (prevIndex + 1) % sortedImages.length : 0
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prevIndex =>
      sortedImages.length > 0 ? (prevIndex - 1 + sortedImages.length) % sortedImages.length : 0
    );
  };

  const handleBookEvent = async () => {
    if (!isAuthenticated || !user) {
      navigate('/signin', { state: { from: `/events/${id}` } });
      return;
    }
    if (isAlreadyBooked) {
        return;
    }
    if (event && !bookingMessage) {
      setBookingMessage(null);
      setBookingError(null);
      setIsBooking(true);
      try {
        await createBooking(event.id);
        setBookingMessage(t('eventDetail.booking.success'));
        setIsAlreadyBooked(true);
      } catch (err: any) {
        setBookingError(err.response?.data?.message || t('eventDetail.booking.error'));
        console.error("Booking error:", err);
      } finally {
        setIsBooking(false);
      }
    }
  };

  const EventDateTimeDisplay: React.FC<{ startDateStr: string, endDateStr: string }> = ({ startDateStr, endDateStr }) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const locale = i18n.language;
    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

    const formattedStartDate = startDate.toLocaleDateString(locale, dateOptions);
    const formattedStartTime = startDate.toLocaleTimeString(locale, timeOptions);
    const formattedEndDate = endDate.toLocaleDateString(locale, dateOptions);
    const formattedEndTime = endDate.toLocaleTimeString(locale, timeOptions);

    if (formattedStartDate === formattedEndDate) {
      return (
        <>
          <li><CalendarIcon /> <strong>{t('eventDetail.dateTime.date')}:</strong> {formattedStartDate}</li>
          <li>
            <ClockIcon /> <strong>{t('eventDetail.dateTime.time')}:</strong> {formattedStartTime}
            {formattedStartTime !== formattedEndTime && ` - ${formattedEndTime}`}
          </li>
        </>
      );
    } else {
      return (
        <>
          <li><CalendarIcon /> <strong>{t('eventDetail.dateTime.from')}:</strong> {formattedStartDate} {t('eventDetail.dateTime.at')} {formattedStartTime}</li>
          <li><CalendarIcon /> <strong>{t('eventDetail.dateTime.to')}:</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {formattedEndDate} {t('eventDetail.dateTime.at')} {formattedEndTime}</li>
        </>
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-sky-700 dark:text-sky-300">{t('eventDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-lg mx-auto dark:bg-red-900 dark:text-red-200 dark:border-red-700">
          <h2 className="text-2xl font-bold mb-3">{t('eventDetail.errorTitle')}</h2>
          <p>{error}</p>
          <Link to="/events" className="mt-4 inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg">
            {t('eventDetail.buttons.backToEvents')}
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg shadow-md max-w-lg mx-auto dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700">
            <h2 className="text-2xl font-bold mb-3">{t('eventDetail.notFound.title')}</h2>
            <p>{t('eventDetail.notFound.message')}</p>
            <Link to="/events" className="mt-4 inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg">
                {t('eventDetail.buttons.exploreEvents')}
            </Link>
        </div>
      </div>
    );
  }

  const eventTitle = i18n.language === 'ar' && event.titleAr ? event.titleAr : event.title;
  const eventCategoryName = i18n.language === 'ar' && event.category?.name ? event.category.name : event.category?.name;
  const eventVenue = i18n.language === 'ar' && event.venueAr ? event.venueAr : event.venue;
  const eventDescription = i18n.language === 'ar' && event.description ? event.description : event.description;

  const currentImageToDisplay = sortedImages.length > 0 ? sortedImages[currentImageIndex] : null;
  const imageUrl = getFullImageUrl(currentImageToDisplay?.imageUrl);
  const imageAltText = currentImageToDisplay?.altText || (sortedImages.length > 0 ? t('eventDetail.imageCarousel.altText', { current: currentImageIndex + 1, total: sortedImages.length, title: eventTitle }) : eventTitle);

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="mb-6 md:mb-8 text-center md:text-left rtl:md:text-right">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-sky-800 dark:text-sky-200 mb-2">{eventTitle}</h1>
        {event.category && (
             <span className="inline-block bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 text-sm font-semibold px-3 py-1 rounded-full">
                {eventCategoryName}
             </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-6 relative">
            {sortedImages.length === 0 && (
              <img 
                src={PLACEHOLDER_IMAGE}
                alt={eventTitle} 
                className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
              />
            )}
            {sortedImages.length > 0 && currentImageToDisplay && (
              <>
              <img 
                src={imageUrl}
                  alt={imageAltText}
                  className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover transition-opacity duration-300 ease-in-out"
                key={currentImageToDisplay.id}
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
              />
            {sortedImages.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                      className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-2 rounded-full focus:outline-none transition-colors z-10 rtl:left-auto rtl:right-3"
                      aria-label={t('eventDetail.imageCarousel.previous')}
                >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button 
                  onClick={handleNextImage}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-2 rounded-full focus:outline-none transition-colors z-10 rtl:right-auto rtl:left-3"
                      aria-label={t('eventDetail.imageCarousel.next')}
                >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {sortedImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                                className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-sky-500' : 'bg-gray-300 hover:bg-gray-400'} transition-colors`}
                                aria-label={t('eventDetail.imageCarousel.goToSlide', { slideNumber: index + 1})}
                            />
                  ))}
                </div>
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {t('eventDetail.imageCarousel.imageCount', { current: currentImageIndex + 1, total: sortedImages.length })}
                    </div>
                  </>
                )}
              </>
            )}
             {sortedImages.length > 0 && !currentImageToDisplay && (
                <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">{t('eventDetail.imageCarousel.loadingImage')}</p>
                </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('eventDetail.aboutTitle')}</h2>
            <div className="prose prose-sky dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {eventDescription || t('eventDetail.noDescription')}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">{t('eventDetail.detailsTitle')}</h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <EventDateTimeDisplay startDateStr={event.startDate} endDateStr={event.endDate} />
              <li><LocationIcon /> <strong>{t('eventDetail.details.venue')}:</strong> {eventVenue}</li>
              <li>
                <svg className="w-5 h-5 mr-2 inline text-sky-600 dark:text-sky-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <strong>{t('eventDetail.details.price')}:</strong> {event.price > 0 ? `${event.price.toFixed(2)} ${t('currency.egp')}` : t('free')}
              </li>
              {event.category && (
                <li><TagIcon /> <strong>{t('eventDetail.details.category')}:</strong> {eventCategoryName}</li>
              )}
              {event.creator && (
                <li><UserIcon /> <strong>{t('eventDetail.details.organizer')}:</strong> {event.creator.username}</li>
              )}
            </ul>
            </div>

          {bookingMessage && 
            <div className="mt-6 p-4 rounded-md bg-green-50 border border-green-300 text-green-700 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
                {bookingMessage}
              </div>
          }
          {bookingError && 
            <div className="mt-6 p-4 rounded-md bg-red-50 border border-red-300 text-red-700 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
                {bookingError}
              </div>
          }

          {!isBooking && !bookingMessage && (
              <button
                onClick={handleBookEvent}
                disabled={isAlreadyBooked || isBooking}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white transition-colors shadow-md hover:shadow-lg 
                            ${!isAuthenticated ? 'bg-gray-400 hover:bg-gray-500' : 
                             isAlreadyBooked ? 'bg-green-600 cursor-not-allowed' : 
                             'bg-sky-600 hover:bg-sky-700 focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-800'}`}
            >
                {isBooking 
                    ? t('eventDetail.buttons.bookingProcessing') 
                    : !isAuthenticated 
                        ? t('eventDetail.buttons.loginToBook') 
                        : isAlreadyBooked 
                            ? t('eventDetail.buttons.alreadyBooked') 
                            : t('eventDetail.buttons.bookNow')}
              </button>
          )}
          {isBooking && (
             <button 
                disabled
                className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white transition-colors shadow-md bg-sky-400 cursor-wait'}`}
            >
                 {t('eventDetail.buttons.bookingProcessing')}...
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;