import api from './api';
import type { Booking } from '../types/index';


export const getBooking = async () => {
  const response = await api.get('/bookings/getBookings');
  return response.data;
};

export const getBookingById = async (id: string | number): Promise<Booking> => {
  const response = await api.get<Booking>(`/bookings/getBooking/${id}`);
  return response.data;
};

export const getUserBookings = async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings/getUserBookings');
    return response.data;
};

export const createBooking = async (eventId: number): Promise<Booking> => {
  const response = await api.post<Booking>('/bookings/createBooking', { eventId: eventId });
  return response.data;
};

export const deleteUserBooking = async (id: string | number): Promise<void> => {
  await api.delete(`/bookings/removeOwnBooking/${id}`);
};

export const deleteBookingForAdmin = async (id: string | number): Promise<void> => {
  await api.delete(`/bookings/removeBooking/${id}`);
};

export const deleteBooking = async (id: string | number): Promise<void> => {
  await api.delete(`/bookings/removeBooking/${id}`);
};