import api from './api';
import type { User, Booking } from '../types';
import type { UpdateUserDto as ClientUpdateUserDto } from '../types/dto';

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users/getUsers');
  return response.data;
};

/**
 * @param userId The ID of the user to update.
 * @param userData Partial user data, including optional role.
 */
export const updateUserByAdmin = async (userId: number, userData: Partial<ClientUpdateUserDto>): Promise<User> => {
  const response = await api.patch<User>(`/users/admin/update/${userId}`, userData);
  return response.data;
};

/**
 * Deletes a user by admin.
 * @param userId The ID of the user to delete.
 */
export const deleteUserByAdmin = async (userId: number): Promise<void> => {
  await api.delete(`/users/admin/delete/${userId}`);
};

/**
 * Fetches all bookings.
 */
export const getAllBookingsAdmin = async (): Promise<Booking[]> => {
  const response = await api.get<Booking[]>('/bookings/getBookings');
  return response.data;
};