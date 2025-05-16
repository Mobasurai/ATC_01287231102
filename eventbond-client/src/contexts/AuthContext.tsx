import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse } from '../types/index';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const attemptAutoLogin = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auto-login failed", error);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    attemptAutoLogin();
  }, []);

  const login = (authData: AuthResponse) => {
    setUser(authData.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {   
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};