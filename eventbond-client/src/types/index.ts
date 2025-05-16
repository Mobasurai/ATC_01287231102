export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  createdBy?: User;
}

export interface EventImage {
  id: number;
  eventId: number;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  id: number;
  creatorId: number;
  creator?: User;
  categoryId: number;
  category?: Category;
  title: string;
  titleAr?: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  venueAr?: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
  images?: EventImage[];
}

export interface Booking {
  id: number;
  user: User;
  event: Event;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface PaginatedEventsResponse {
  data: Event[];
  total: number;
  page: number;
  limit: number;
}

export type CreateEventPayload = Omit<Event, 'id' | 'creator' | 'category' | 'images' | 'createdAt' | 'updatedAt'>;