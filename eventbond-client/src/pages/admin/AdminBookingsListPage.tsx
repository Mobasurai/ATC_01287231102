import React, { useEffect, useState, useCallback } from 'react';
import { getAllBookingsAdmin } from '../../services/adminService';
import { deleteBookingForAdmin } from '../../services/bookingsService';
import type { Booking } from '../../types';
import { useTranslation } from 'react-i18next';

const AdminBookingsListPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllBookingsAdmin();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError(t('adminBookings.errors.fetchBookings'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleDeleteBooking = async (bookingId: number) => {
    if (window.confirm(t('adminBookings.confirmations.deleteBooking'))) {
      try {
        await deleteBookingForAdmin(bookingId);
        setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId));
        alert(t('adminBookings.feedback.deleteSuccess'));
      } catch (err: any) {
        console.error("Failed to delete booking:", err);
        alert(err.response?.data?.message || t('adminBookings.errors.deleteBooking'));
      }
    }
  };

  if (loading) return <p className="text-center py-10">{t('adminBookings.loading')}</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('adminBookings.title')}</h1>
      {bookings.length === 0 && !loading && (
        <p className="text-center text-gray-500">{t('adminBookings.noBookings')}</p>
      )}
      {bookings.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminBookings.table.bookingId')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminBookings.table.eventTitle')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminBookings.table.userId')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminBookings.table.username')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminBookings.table.bookingDate')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminBookings.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.event?.title || t('adminBookings.table.na')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.user?.id || t('adminBookings.table.na')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.user?.username || t('adminBookings.table.na')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString(i18n.language) : t('adminBookings.table.na')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDeleteBooking(booking.id)} className="text-red-600 hover:text-red-900">{t('adminBookings.buttons.delete')}</button>
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

export default AdminBookingsListPage; 