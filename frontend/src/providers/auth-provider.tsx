'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Fetch current user on mount
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: authAPI.getCurrentUser,
    retry: false,
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else {
      setUser(null);
    }
  }, [userData]);

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      if (response.user) {
        // Clear any existing user data before setting new user
        queryClient.removeQueries({ queryKey: ['user-ratings'] });
        queryClient.removeQueries({ queryKey: ['rating-history'] });
        queryClient.removeQueries({ queryKey: ['user-stats'] });
        queryClient.removeQueries({ queryKey: ['recommendations'] });
        queryClient.removeQueries({ queryKey: ['movie-details'] });
        
        setUser(response.user);
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    } catch (error) {
      // Re-throw the error so it can be handled by the login page
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await authAPI.register(username, email, password);
    if (response.user) {
      // Clear any existing user data before setting new user
      queryClient.removeQueries({ queryKey: ['user-ratings'] });
      queryClient.removeQueries({ queryKey: ['rating-history'] });
      queryClient.removeQueries({ queryKey: ['user-stats'] });
      queryClient.removeQueries({ queryKey: ['recommendations'] });
      queryClient.removeQueries({ queryKey: ['movie-details'] });
      
      setUser(response.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    // Clear all user-specific queries from cache
    queryClient.removeQueries({ queryKey: ['user'] });
    queryClient.removeQueries({ queryKey: ['user-ratings'] });
    queryClient.removeQueries({ queryKey: ['rating-history'] });
    queryClient.removeQueries({ queryKey: ['user-stats'] });
    queryClient.removeQueries({ queryKey: ['recommendations'] });
    queryClient.removeQueries({ queryKey: ['movie-details'] });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 