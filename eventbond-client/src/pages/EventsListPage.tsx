import React, { useEffect, useState, useCallback } from 'react';
import { getEvents, getCategories } from '../services/eventService';
import type { Event as EventType, Category } from '../types/index';
import EventCard from '../components/EventCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 9;

const EventsListPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchEvents = useCallback(async (currentPage: number, search: string, categoryId: string) => {
    setLoading(true);
    setError(null);
    try {
      const apiResponse = await getEvents(currentPage, ITEMS_PER_PAGE, search, categoryId || undefined);

      setEvents(prevEvents => {
        const newItems = apiResponse.data || [];
        const updatedEvents = currentPage === 1 ? newItems : [...prevEvents, ...newItems];
        
        setHasMore(updatedEvents.length < apiResponse.total);
        return updatedEvents;
      });
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError(t('eventsListPage.errors.fetchEvents'));
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchEvents(1, debouncedSearchTerm, selectedCategoryId);
  }, [debouncedSearchTerm, selectedCategoryId, fetchEvents]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchEvents(nextPage, debouncedSearchTerm, selectedCategoryId);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(event.target.value);
  };

  if (error && events.length === 0 && page === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">{t('eventsListPage.search.label')}</label>
              <input
                type="text"
                id="search"
                placeholder={t('eventsListPage.search.placeholder')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">{t('eventsListPage.categoryFilter.label')}</label>
              <select
                id="category"
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                disabled={loadingCategories}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-gray-50"
              >
                <option value="">{t('eventsListPage.categoryFilter.allCategories')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id.toString()}>
                    {i18n.language === 'ar' ? category.name || category.name : category.name} {/* Assuming category might have nameAr */}
                  </option>
                ))}
              </select>
            </div>
        </div>
        </div>
        <div className="text-center">
        <h1 className="text-4xl font-bold text-sky-700 mb-8">{t('eventsListPage.title')}</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">{t('eventsListPage.errors.oops')}</strong>
          <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-sky-700">{t('eventsListPage.title')}</h1>
        {user?.role === 'admin' && (
            <Link to="/admin/events/new" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                {t('eventsListPage.createNewEventButton')}
            </Link>
        )}
      </div>

      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">{t('eventsListPage.search.label')}</label>
            <input
              type="text"
              id="search"
              placeholder={t('eventsListPage.search.placeholder')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">{t('eventsListPage.categoryFilter.label')}</label>
            <select
              id="category"
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              disabled={loadingCategories}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-gray-50"
            >
              <option value="">{t('eventsListPage.categoryFilter.allCategories')}</option>
              {categories.map(category => (
                <option key={category.id} value={category.id.toString()}>
                  {i18n.language === 'ar' ? category.name || category.name : category.name} {/* Assuming category might have nameAr */}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conditional Content Area: Error, Loading Spinner, No Events, or Events List */}
      {error && page === 1 && !loading && (
        <div className="text-center py-10">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">{t('eventsListPage.errors.oops')}</strong>
                <span className="block sm:inline">{error}</span>
            </div>
        </div>
      )}

      {(loading && page === 1) && (
        <div className="flex justify-center items-center py-20" style={{ minHeight: '300px' }}>
          <Spinner size="large" />
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('eventsListPage.noEvents.title')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('eventsListPage.noEvents.message')}</p>
          {user?.role === 'admin' && (
             <div className="mt-6">
                <Link to="/admin/events/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                    {t('eventsListPage.noEvents.createFirstEventButton')}
                </Link>
             </div>
          )}
        </div>
      )}

      {events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {loading && page > 1 && (
         <div className="flex justify-center py-6">
            <Spinner />
        </div>
      )}

      {hasMore && !loading && events.length > 0 && (
        <div className="text-center mt-10">
          <button
            onClick={handleLoadMore}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            {t('eventsListPage.loadMoreButton')}
          </button>
        </div>
      )}

      {!hasMore && events.length > 0 && (
        <p className="text-center text-gray-500 mt-10">{t('eventsListPage.endOfList')}</p>
      )}
    </div>
  );
};

export default EventsListPage;