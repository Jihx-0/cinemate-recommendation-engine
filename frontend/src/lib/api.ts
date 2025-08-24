import axios from 'axios';

// Use relative paths so API calls go to the same domain and get proxied by Next.js
const API_BASE_URL = '';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For session cookies
});

// Types
export interface Movie {
  movie_id: number;
  title: string;
  overview?: string;
  genre?: string;
  poster_url?: string;
  backdrop_url?: string;
  vote_average?: number;
  release_date?: string;
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Rating {
  movie_id: number;
  rating: number;
  movie_title: string;
}

export interface Recommendation {
  movie_id: number;
  title: string;
  overview?: string;
  genre?: string;
  poster_url?: string;
  backdrop_url?: string;
  vote_average?: number;
  release_date?: string;
  score: number;
  type: 'content-based' | 'collaborative' | 'hybrid';
}

export interface UserStats {
  total_ratings: number;
  average_rating: number;
  favorite_genre: string;
  total_movies_rated: number;
}

// API functions
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/api/login', { username, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/api/register', { username, email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/user');
    return response.data;
  },
};

export const moviesAPI = {
  async getPopularMovies(): Promise<Movie[]> {
    try {
      const response = await api.get('/api/popular-movies');
      return response.data;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return [];
    }
  },

  async searchMovies(query: string, page: number = 1): Promise<{movies: Movie[], page: number, total_pages: number, total_results: number, query: string}> {
    try {
      const response = await api.get(`/api/search-movies?q=${encodeURIComponent(query)}&page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      return { movies: [], page, total_pages: 0, total_results: 0, query };
    }
  },

  getRateMovies: async (page: number = 1) => {
    const response = await api.get(`/api/rate-movies?page=${page}`);
    return response.data;
  },

  submitRatings: async (ratings: Record<string, number>, movieDetails?: Record<string, any>) => {
    const payload: any = { ratings };
    if (movieDetails) {
      payload.movie_details = movieDetails;
    }
    const response = await api.post('/api/submit-ratings', payload);
    return response.data;
  },

  removeRating: async (movieId: number) => {
    const response = await api.post('/api/remove-rating', { movie_id: movieId });
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/api/recommendations');
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/api/profile');
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/api/user-stats');
    return response.data;
  },

  getRatingHistory: async () => {
    const response = await api.get('/api/rating-history');
    return response.data;
  },
}; 