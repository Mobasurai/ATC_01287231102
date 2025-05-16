import api from './api';
import type { User, AuthResponse } from '../types/index';

interface SigninCredentials {
  email: string;
  password: string;
}

interface SignupData extends SigninCredentials {
  username: string;
  role?: string;
}

export const signin = async (credentials: SigninCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  if (response.data && response.data.access_token && response.data.user) {
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const signup = async (data: SignupData): Promise<User> => {
  const response = await api.post<User>('/users/createUser', { ...data, role: data.role || 'user' });
  return response.data;
};
