'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Star, Film, TrendingUp, Save, Trash2, Lock, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { userAPI, moviesAPI } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

export default function ProfilePage() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ratingsPerPage = 10;
  const queryClient = useQueryClient();

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: userAPI.getUserStats,
    enabled: !!user,
  });

  // Fetch rating history
  const { data: ratingHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['rating-history'],
    queryFn: userAPI.getRatingHistory,
    enabled: !!user,
  });

  // Pre-populate ratings with existing user ratings
  useEffect(() => {
    if (ratingHistory && Array.isArray(ratingHistory) && ratingHistory.length > 0) {
      const ratingsMap: Record<number, number> = {};
      ratingHistory.forEach((item: any) => {
        ratingsMap[item.movie_id] = item.rating;
      });
      setRatings(ratingsMap);
    }
  }, [ratingHistory]);

  // Check for changes
  useEffect(() => {
    if (ratingHistory && Array.isArray(ratingHistory)) {
      const hasAnyChanges = ratingHistory.some((item: any) => {
        const currentRating = ratings[item.movie_id];
        const originalRating = item.rating;
        return currentRating !== originalRating;
      });
      setHasChanges(hasAnyChanges);
    }
  }, [ratings, ratingHistory]);

  // Submit ratings mutation
  const submitRatingsMutation = useMutation({
    mutationFn: moviesAPI.submitRatings,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['rating-history'] });
      setHasChanges(false);
    },
    onError: (error) => {
      console.error('Error updating ratings:', error);
    },
  });

  // Remove rating mutation
  const removeRatingMutation = useMutation({
    mutationFn: moviesAPI.removeRating,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['rating-history'] });
      // Remove from local state
      if (data.movie_id) {
        setRatings(prev => {
          const newRatings = { ...prev };
          delete newRatings[data.movie_id];
          return newRatings;
        });
      }
    },
    onError: (error) => {
      console.error('Error removing rating:', error);
    },
  });

  // Password reset mutation
  const passwordResetMutation = useMutation({
    mutationFn: async (passwordData: any) => {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Password reset failed');
      }
      return response.json();
    },
    onSuccess: () => {
      setPasswordSuccess('Password updated successfully!');
      setPasswordError('');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordReset(false);
      setTimeout(() => setPasswordSuccess(''), 3000);
    },
    onError: (error: any) => {
      setPasswordError(error.message || 'Password reset failed');
      setPasswordSuccess('');
    },
  });

  const handleRatingChange = (movieId: number, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [movieId]: rating,
    }));
  };

  const handleRemoveRating = (movieId: number) => {
    removeRatingMutation.mutate(movieId);
  };

  const handleSubmit = () => {
    const ratingsToSubmit: Record<string, number> = {};
    Object.entries(ratings).forEach(([movieId, rating]) => {
      ratingsToSubmit[`rating_${movieId}`] = rating;
    });
    submitRatingsMutation.mutate(ratingsToSubmit);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    passwordResetMutation.mutate(passwordData);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Please log in to view your profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navigation />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account and view your movie preferences</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* User Info */}
            <div className="lg:col-span-1">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Username</label>
                    <p className="text-lg font-semibold">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                    <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordReset(!showPasswordReset)}
                    className="w-full"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  
                  {showPasswordReset && (
                    <form onSubmit={handlePasswordReset} className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                      {passwordError && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                          {passwordError}
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                          {passwordSuccess}
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={passwordResetMutation.isPending}
                          size="sm"
                          className="flex-1"
                        >
                          {passwordResetMutation.isPending ? 'Updating...' : 'Update Password'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPasswordReset(false)}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Your Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 animate-pulse bg-gray-200 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Film className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-primary">
                          {userStats?.movies_rated || 0}
                        </p>
                        <p className="text-sm text-gray-600">Movies Rated</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">
                          {userStats?.average_rating || 0}
                        </p>
                        <p className="text-sm text-gray-600">Average Rating</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">
                          {userStats?.favorite_movies || 0}
                        </p>
                        <p className="text-sm text-gray-600">Favorites (5★)</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rating History */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-2" />
                      Recent Ratings
                    </div>
                    {hasChanges && (
                      <Button
                        onClick={handleSubmit}
                        disabled={submitRatingsMutation.isPending}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {submitRatingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {hasChanges 
                      ? "Click on stars to change your ratings, then save your changes"
                      : "Your latest movie ratings and preferences"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 animate-pulse bg-gray-200 rounded-lg" />
                      ))}
                    </div>
                  ) : ratingHistory && Array.isArray(ratingHistory) && ratingHistory.length > 0 ? (
                    <div className="space-y-4">
                      {/* Pagination Info */}
                      <div className="text-sm text-gray-600 text-center">
                        Showing {((currentPage - 1) * ratingsPerPage) + 1} to {Math.min(currentPage * ratingsPerPage, ratingHistory.length)} of {ratingHistory.length} ratings
                      </div>
                      
                      {/* Ratings List */}
                      {ratingHistory
                        .slice((currentPage - 1) * ratingsPerPage, currentPage * ratingsPerPage)
                        .map((item: any) => {
                          const currentRating = ratings[item.movie_id] || item.rating;
                          const hasChanged = currentRating !== item.rating;
                          
                          return (
                            <div key={item.movie_id} className={`flex items-center justify-between p-3 rounded-lg ${
                              hasChanged ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                            }`}>
                              <div>
                                <p className="font-medium">{item.title || `Movie ${item.movie_id}`}</p>
                                <p className="text-sm text-gray-600">Rated on {new Date().toLocaleDateString()}</p>
                                {hasChanged && (
                                  <p className="text-xs text-yellow-600 mt-1">
                                    Changed from {item.rating}★ to {currentRating}★
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => handleRatingChange(item.movie_id, star)}
                                      className="transition-colors duration-200 hover:scale-110"
                                    >
                                      <Star
                                        className={`h-4 w-4 transition-colors duration-200 ${
                                          currentRating >= star
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                                <span className={`text-sm font-medium ${
                                  hasChanged ? 'text-yellow-600' : ''
                                }`}>
                                  {currentRating}/5
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveRating(item.movie_id)}
                                  disabled={removeRatingMutation.isPending}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Remove rating"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      
                      {/* Pagination Controls */}
                      {ratingHistory.length > ratingsPerPage && (
                        <div className="flex justify-center mt-6">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                              Page {currentPage} of {Math.ceil(ratingHistory.length / ratingsPerPage)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.min(Math.ceil(ratingHistory.length / ratingsPerPage), currentPage + 1))}
                              disabled={currentPage >= Math.ceil(ratingHistory.length / ratingsPerPage)}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No ratings yet</p>
                      <p className="text-sm text-gray-500 mb-4">Start rating movies to see your history here</p>
                      <Link href="/rate">
                        <Button>Rate Movies</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 