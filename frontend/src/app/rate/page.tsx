'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, X, Calendar, Film, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { Navigation } from '@/components/navigation';
import { MovieCard } from '@/components/movie-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { moviesAPI, authAPI, User, Movie } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

export default function RatePage() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showMovieDetailsModal, setShowMovieDetailsModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [loadingMovies, setLoadingMovies] = useState<Set<number>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();

  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Hide after 3 seconds
  };

  // Fetch movies to rate with pagination
  const { data: moviesData, isLoading } = useQuery({
    queryKey: ['rate-movies', currentPage],
    queryFn: () => moviesAPI.getRateMovies(currentPage),
  });

  const movies = moviesData?.movies || [];
  const totalPages = moviesData?.total_pages || 1;
  const currentPageNum = moviesData?.page || 1;

  // Fetch existing user ratings
  const { data: ratingHistory = [], isLoading: isLoadingUserRatings } = useQuery({
    queryKey: ['user-ratings'],
    queryFn: async () => {
      const response = await fetch('/api/rating-history');
      if (!response.ok) throw new Error('Failed to fetch user ratings');
      const data = await response.json();
      return data || [];
    },
    enabled: !!user,
  });

  // Convert rating history array to ratings object for compatibility
  const existingRatings = useMemo(() => {
    const ratings: Record<number, number> = {};
    if (Array.isArray(ratingHistory)) {
      ratingHistory.forEach((item: any) => {
        ratings[item.movie_id] = item.rating;
      });
    }
    return ratings;
  }, [ratingHistory]);

  // Create a movie data map for ratings display
  const movieDataMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(ratingHistory)) {
      ratingHistory.forEach((item: any) => {
        map.set(item.movie_id.toString(), item);
      });
    }
    return map;
  }, [ratingHistory]);

  // Pre-populate ratings with existing user ratings
  useEffect(() => {
    if (existingRatings && Object.keys(existingRatings).length > 0) {
      setRatings(existingRatings);
    }
  }, [existingRatings]);

  // Check if user has any ratings
  const hasRatings = Object.keys(ratings).length > 0;
  const hasExistingRatings = !isLoadingUserRatings && Array.isArray(ratingHistory) && ratingHistory.length > 0;

  // Submit ratings mutation
  const submitRatingsMutation = useMutation({
    mutationFn: moviesAPI.submitRatings,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['rating-history'] });
      router.push('/recommendations');
    },
    onError: (error) => {
      console.error('Error submitting ratings:', error);
    },
  });

  // Auto-save individual rating mutation
  const autoSaveRatingMutation = useMutation({
    mutationFn: async ({ movieId, rating }: { movieId: number; rating: number }) => {
      const ratingsToSubmit: Record<string, number> = {};
      ratingsToSubmit[`rating_${movieId}`] = rating;
      return moviesAPI.submitRatings(ratingsToSubmit);
    },
    onMutate: ({ movieId }) => {
      // Add movie to loading set
      setLoadingMovies(prev => new Set(prev).add(movieId));
    },
    onSuccess: (data, { movieId, rating }) => {
      // Only update local state if it's different from what we just saved
      setRatings(prev => {
        if (prev[movieId] === rating) {
          return prev; // No change needed
        }
        return {
          ...prev,
          [movieId]: rating
        };
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['rating-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-ratings'] });
      showToastNotification('Rating saved!');
    },
    onError: (error) => {
      console.error('Error auto-saving rating:', error);
    },
    onSettled: (_, __, { movieId }) => {
      // Remove movie from loading set
      setLoadingMovies(prev => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
    },
  });

  // Remove rating mutation
  const removeRatingMutation = useMutation({
    mutationFn: async (movieId: number) => {
      const response = await fetch('/api/remove-rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movie_id: movieId }),
      });
      if (!response.ok) throw new Error('Failed to remove rating');
      return response.json();
    },
    onSuccess: (data, movieId) => {
      // Update local state
      setRatings(prev => {
        const newRatings = { ...prev };
        delete newRatings[movieId];
        return newRatings;
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['rating-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-ratings'] });
      showToastNotification('Rating removed!');
    },
    onError: (error) => {
      console.error('Error removing rating:', error);
    },
  });

  const handleRatingChange = (movieId: number, rating: number) => {
    // Update local state immediately for responsive UX
    setRatings(prev => ({
      ...prev,
      [movieId]: rating,
    }));
    
    // Auto-save the rating immediately
    autoSaveRatingMutation.mutate({ movieId, rating });
  };

  const handleSubmit = () => {
    showToastNotification('Redirecting to your recommendations...');
    setTimeout(() => {
      router.push('/recommendations');
    }, 1000); // Small delay to show the toast
  };

  const handleNextMovie = () => {
    if (currentMovieIndex < movies.length - 1) {
      const nextIndex = currentMovieIndex + 1;
      setCurrentMovieIndex(nextIndex);
      setSelectedMovie(movies[nextIndex]);
    }
  };

  const handlePrevMovie = () => {
    if (currentMovieIndex > 0) {
      const prevIndex = currentMovieIndex - 1;
      setCurrentMovieIndex(prevIndex);
      setSelectedMovie(movies[prevIndex]);
    }
  };

  const openMovieModal = (movie: Movie, index: number) => {
    setSelectedMovie(movie);
    setCurrentMovieIndex(index);
    setShowMovieDetailsModal(true);
  };

  // Check if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Want to discover new movies?
                </CardTitle>
                <p className="text-lg text-gray-600 mt-2">
                  Sign up for free today and get personalized movie recommendations based on your taste!
                </p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Rate movies you've watched and our AI will suggest films you'll love. 
                  Join thousands of users who have found their new favorite movies with Cinemate.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => router.push('/register')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Sign Up Free
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => router.push('/login')}
                  >
                    Already have an account? Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Rate Movies
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl">
              {hasExistingRatings 
                ? "Update your ratings or rate new movies to improve your recommendations. Your existing ratings are shown below."
                : "Rate the movies below to help us understand your taste. Our AI will use these ratings to provide personalized recommendations just for you."
              }
            </p>
            {hasExistingRatings && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 You have {ratingHistory.length} existing ratings. You can modify them or add new ratings.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* User Ratings Summary */}
        {isLoadingUserRatings ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : hasExistingRatings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.isArray(ratingHistory) && ratingHistory.map((item: any) => (
                    <div
                      key={item.movie_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm block truncate">
                          {item.title || `Movie ID: ${item.movie_id}`}
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < item.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => removeRatingMutation.mutate(item.movie_id)}
                        disabled={removeRatingMutation.isPending}
                        className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Remove rating"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Movies Grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {movies.map((movie: Movie, index: number) => (
            <motion.div
              key={movie.movie_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <MovieCard
                movie={movie}
                showRating={true}
                rating={ratings[movie.movie_id] || 0}
                onRatingChange={(rating) => handleRatingChange(movie.movie_id, rating)}
                readonly={false}
                showMatchOverlay={false}
                showMatchScore={false}
                isRatingLoading={loadingMovies.has(movie.movie_id)}
                onClick={() => openMovieModal(movie, index)}
              />
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {currentPage > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                >
                  Previous
                </Button>
              )}
              <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                Page {currentPage}
              </span>
              {currentPage < totalPages && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">
                {hasRatings 
                  ? hasExistingRatings 
                    ? 'View Your Recommendations' 
                    : 'Ready to Get Recommendations?'
                  : 'Rate Some Movies First'
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {hasRatings ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {hasExistingRatings 
                      ? `You've got ${ratingHistory.length} ratings. Click below to view your recommendations!`
                      : `You've rated ${Object.keys(ratings).length} movies. Click below to view your personalized recommendations!`
                    }
                  </p>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitRatingsMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {submitRatingsMutation.isPending ? (
                      'Processing...'
                    ) : (
                      <>
                        {hasExistingRatings ? 'View Recommendations' : 'View Recommendations'}
                        <Star className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Rate at least one movie to get personalized recommendations.
                  </p>
                  <div className="flex justify-center">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-5 w-5 text-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Movie Details Modal for Rate Movies */}
      {showMovieDetailsModal && selectedMovie && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg max-w-3xl w-full h-[90vh] flex flex-col"
          >
            <div className="relative flex-shrink-0">
              {/* Backdrop Image */}
              {selectedMovie.backdrop_url && (
                <div className="relative h-48 bg-gradient-to-b from-blue-900 to-blue-600">
                  <img
                    src={selectedMovie.backdrop_url}
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-blue-900/40" />
                </div>
              )}
              
              {/* Light color bar when no backdrop */}
              {!selectedMovie.backdrop_url && (
                <div className="h-48 bg-gradient-to-b from-gray-50 to-gray-100 rounded-t-lg border-b border-gray-200" />
              )}
              
              {/* Close Button */}
              <button
                onClick={() => setShowMovieDetailsModal(false)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Navigation Buttons */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10">
                <button
                  onClick={handlePrevMovie}
                  disabled={currentMovieIndex === 0}
                  className="bg-black/50 hover:bg-black/70 disabled:bg-black/20 disabled:cursor-not-allowed text-white rounded-full p-2 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10">
                <button
                  onClick={handleNextMovie}
                  disabled={currentMovieIndex === movies.length - 1}
                  className="bg-black/50 hover:bg-black/70 disabled:bg-black/20 disabled:cursor-not-allowed text-white rounded-full p-2 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                {selectedMovie.poster_url && (
                  <img
                    src={selectedMovie.poster_url}
                    alt={selectedMovie.title}
                    className="w-24 h-36 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedMovie.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {selectedMovie.release_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{selectedMovie.release_date}</span>
                      </div>
                    )}
                    {selectedMovie.genre && (
                      <div className="flex items-center gap-1">
                        <Film className="h-4 w-4" />
                        <span>{selectedMovie.genre}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Star className="h-3 w-3" />
                      <span>Rate This Movie</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview */}
              {selectedMovie.overview && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedMovie.overview}
                  </p>
                </div>
              )}

              {/* Rating Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Rating</h3>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {ratings[selectedMovie.movie_id] > 0 ? 'Your rating:' : 'Rate this movie:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRatingChange(selectedMovie.movie_id, star);
                          }}
                          className="transition-colors duration-200 hover:scale-110"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors duration-200 ${
                              ratings[selectedMovie.movie_id] >= star
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-transparent text-gray-300 hover:text-yellow-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className={`text-sm font-medium ${
                      ratings[selectedMovie.movie_id] > 0 ? "text-yellow-600" : "text-gray-500"
                    }`}>
                      {ratings[selectedMovie.movie_id] > 0 ? `${ratings[selectedMovie.movie_id]}/5` : 'Not rated'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">TMDb Rating</div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{selectedMovie.vote_average?.toFixed(1) || 'N/A'}</span>
                    <span className="text-xs text-gray-500">/10</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Release Year</div>
                  <div className="font-medium">
                    {selectedMovie.release_date ? selectedMovie.release_date.slice(0, 4) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="font-medium">{toastMessage}</span>
        </motion.div>
      )}
    </div>
  );
} 