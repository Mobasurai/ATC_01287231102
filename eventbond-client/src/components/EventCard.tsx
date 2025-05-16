import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Event } from '../types/index';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { t, i18n } = useTranslation();

  const PLACEHOLDER_IMAGE = `https://placehold.co/300x200?text=${t('eventCard.noImagePlaceholder')}`;

  const getImageUrl = () => {
    const primaryImageObj = event.images?.find(img => img.isPrimary);
    let imageUrl = primaryImageObj?.imageUrl || event.images?.[0]?.imageUrl;

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

  const formatDateRange = (startDateString: string, endDateString: string) => {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };

    const formattedStartDate = startDate.toLocaleDateString(i18n.language, options);

    if (startDate.toDateString() === endDate.toDateString()) {
      return formattedStartDate;
    } else {
      const formattedEndDate = endDate.toLocaleDateString(i18n.language, options);
      return `${formattedStartDate} - ${formattedEndDate}`;
    }
  };

  const eventTitle = i18n.language === 'ar' ? event.titleAr || event.title : event.title;
  const eventVenue = i18n.language === 'ar' ? event.venueAr || event.venue : event.venue;
  const eventDescription = event.description;

  return (
    <Link 
      to={`/events/${event.id}`} 
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 group"
    >
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        <img 
          src={getImageUrl()}
          alt={eventTitle} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
        />
        <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-sky-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
          {event.price > 0 ? `${event.price.toFixed(2)} ${t('currency.egp')}` : t('free')}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2 text-sky-700 dark:text-sky-400 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors duration-300 truncate" title={eventTitle}>{eventTitle}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 rtl:mr-0 rtl:ml-1 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">{t('eventCard.labels.dates')}:</span> {formatDateRange(event.startDate, event.endDate)}
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 truncate" title={eventVenue}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 rtl:mr-0 rtl:ml-1 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium">{t('eventCard.labels.venue')}:</span> {eventVenue}
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 h-10 overflow-hidden">
          {eventDescription ? eventDescription.substring(0, 70) + (eventDescription.length > 70 ? '...' : '') : t('eventCard.noDescription')}
        </div>
        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700 text-right rtl:text-left">
            <span className="inline-block bg-sky-500 group-hover:bg-sky-600 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm group-hover:shadow-md transition-all duration-300">
                {t('eventCard.viewDetailsButton')}
            </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;