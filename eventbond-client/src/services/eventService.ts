import api from './api';
import type { Event, Category, PaginatedEventsResponse } from '../types/index';

export const getEvents = async (page = 1, limit = 10, search?: string, categoryId?: string | number): Promise<PaginatedEventsResponse> => {
  const params: Record<string, any> = { page, limit };
  if (search) {
    params.searchText = search;
  }
  if (categoryId) {
    params.categoryId = categoryId;
  }
  const response = await api.get<PaginatedEventsResponse>('/events/searchEvents', { params });
  return response.data;
};

export const getEventById = async (id: string | number): Promise<Event> => {
  const response = await api.get<Event>(`/events/getEvent/${id}`);
  return response.data;
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'creator' | 'category' | 'images' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
  const response = await api.post<Event>('/events/createEvent', eventData);
  return response.data;
};

export const updateEvent = async (id: string | number, eventData: Partial<Omit<Event, 'id' | 'creator' | 'category' | 'images' | 'createdAt' | 'updatedAt'>>): Promise<Event> => {
  const response = await api.patch<Event>(`/events/updateEvent/${id}`, eventData);
  return response.data;
};

export const deleteEvent = async (id: string | number): Promise<void> => {
  await api.delete(`/events/deleteEvent/${id}`);
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/categories/getCategories');
  return response.data;
};

export const createCategory = async (categoryData: { name: string }): Promise<Category> => {
  const response = await api.post<Category>('/categories/createCategory', categoryData);
  return response.data;
};