'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Star, Brain, Users, Zap, X, Calendar, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { MovieCard } from '@/components/movie-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { moviesAPI, Recommendation, Rating } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { useMemo } from 'react';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showMovieDetailsModal, setShowMovieDetailsModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Recommendation | null>(null);
  const [modalRating, setModalRating] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Toast notification function
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Hide after 3 seconds
  };

  // Fetch recommendations
  const { data: recommendationsData, isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: moviesAPI.getRecommendations,
    retry: false,
  });

  // Process recommendations data
  const recommendations = recommendationsData?.recommendations || [];
  const userRatings = recommendationsData?.user_ratings || {};

  // Get user's rated movies for display
  const ratedMovies = Object.keys(userRatings).map(id => parseInt(id));

  // Fetch popular movies for movie data mapping
  const { data: popularMoviesData } = useQuery({
    queryKey: ['popular-movies'],
    queryFn: async () => {
      const response = await fetch('/api/popular-movies');
      if (!response.ok) throw new Error('Failed to fetch popular movies');
      return response.json();
    },
  });

  // Fetch movie details for rated movies
  const { data: ratedMovieDetails } = useQuery({
    queryKey: ['movie-details', Object.keys(userRatings)],
    queryFn: async () => {
      if (Object.keys(userRatings).length === 0) return [];
      const movieIds = Object.keys(userRatings).join(',');
      const response = await fetch(`/api/movie-details?ids=${movieIds}`);
      if (!response.ok) throw new Error('Failed to fetch movie details');
      return response.json();
    },
    enabled: Object.keys(userRatings).length > 0,
  });

  // Create a movie data map
  const movieDataMap = useMemo(() => {
    const map = new Map();
    
    // Add popular movies
    if (popularMoviesData) {
      popularMoviesData.forEach((movie: any) => {
        map.set(movie.movie_id.toString(), movie);
      });
    }
    
    // Add rated movie details (this will override popular movies if there's overlap)
    if (ratedMovieDetails) {
      ratedMovieDetails.forEach((movie: any) => {
        map.set(movie.movie_id.toString(), movie);
      });
    }
    
    return map;
  }, [popularMoviesData, ratedMovieDetails]);

  const popularMovies = popularMoviesData || [];

  // Rating mutation
  const ratingMutation = useMutation({
    mutationFn: async ({ movieId, rating }: { movieId: number; rating: number }) => {
      const ratingsToSubmit: Record<string, number> = {};
      ratingsToSubmit[`rating_${movieId}`] = rating;
      return moviesAPI.submitRatings(ratingsToSubmit);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch recommendations to remove the rated movie
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['rating-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-ratings'] });
      
      // Update local state immediately for better UX
      setModalRating(variables.rating);
      setIsRatingLoading(false);
      showToastNotification('Rating saved!');
    },
    onError: (error) => {
      console.error('Error rating movie:', error);
      setIsRatingLoading(false);
      showToastNotification('Failed to save rating.');
    },
  });

  const handleModalRating = (rating: number) => {
    if (!selectedMovie) return;
    setModalRating(rating);
    setIsRatingLoading(true);
    ratingMutation.mutate({ movieId: selectedMovie.movie_id, rating });
  };

  const handleNextMovie = () => {
    if (currentMovieIndex < recommendations.length - 1) {
      const nextIndex = currentMovieIndex + 1;
      setCurrentMovieIndex(nextIndex);
      setSelectedMovie(recommendations[nextIndex]);
      setModalRating(0);
    }
  };

  const handlePrevMovie = () => {
    if (currentMovieIndex > 0) {
      const prevIndex = currentMovieIndex - 1;
      setCurrentMovieIndex(prevIndex);
      setSelectedMovie(recommendations[prevIndex]);
      setModalRating(0);
    }
  };

  const openMovieModal = (movie: Recommendation, index: number) => {
    setSelectedMovie(movie);
    setCurrentMovieIndex(index);
    setModalRating(0);
    setShowMovieDetailsModal(true);
  };

  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case 'content-based':
        return Brain;
      case 'collaborative':
        return Users;
      case 'hybrid':
        return Zap;
      default:
        return Star;
    }
  };

  const getRecommendationTypeColor = (type: string) => {
    switch (type) {
      case 'content-based':
        return 'bg-blue-100 text-blue-800';
      case 'collaborative':
        return 'bg-purple-100 text-purple-800';
      case 'hybrid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const handleShare = async (movie?: Recommendation) => {
    // If a specific movie is provided, share just that one
    if (movie) {
      const shareText = `Check out this movie recommendation from Cinemate: ${movie.title}`;
      
      const shareData = {
        title: `Movie Recommendation: ${movie.title}`,
        text: shareText,
      };

      // Try native sharing first (works on mobile and some browsers)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch (error) {
          console.log('Share cancelled or failed:', error);
        }
      }

      // Otherwise, copy to clipboard using a more reliable method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        // Try to copy
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          // Show success notification
          const notification = document.createElement('div');
          notification.textContent = `"${movie.title}" copied to clipboard!`;
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          `;
          document.body.appendChild(notification);
          
          // Remove notification after 3 seconds
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 3000);
        } else {
          // Fallback to alert if copy failed
          alert(`Share this movie: ${movie.title}`);
        }
      } catch (error) {
        alert(`Share this movie: ${movie.title}`);
      }
    }
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-600">
                No Recommendations Available
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                You need to rate some movies first to get personalized recommendations.
              </p>
              <Button onClick={() => router.push('/rate')}>
                Rate Movies
              </Button>
            </CardContent>
          </Card>
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
              Your Recommendations
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Personalized movie suggestions based on your taste and preferences.
            </p>
          </motion.div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {recommendations.map((recommendation: Recommendation, index: number) => {
            const TypeIcon = getRecommendationTypeIcon(recommendation.type);
            
            return (
              <motion.div
                key={recommendation.movie_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <MovieCard
                  movie={recommendation}
                  readonly={true}
                  showMatchOverlay={false}
                  customMatchPercentage={Math.round(recommendation.score * 20)}
                  onClick={() => openMovieModal(recommendation, index)}
                />
                <div className="absolute top-2 left-2 z-10">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRecommendationTypeColor(recommendation.type)}`}>
                    <TypeIcon className="h-3 w-3" />
                    <span className="capitalize">{recommendation.type.replace('-', ' ')}</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(recommendation)}
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {recommendations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>
                  {Object.keys(userRatings).length > 0 
                    ? "You've Rated All Available Movies!" 
                    : "No Recommendations Yet"
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {Object.keys(userRatings).length > 0 
                    ? "Great job! You've rated all the movies in our current database. Check back later for new movies, or rate more movies to get even better recommendations."
                    : "Rate some movies first to get personalized recommendations."
                  }
                </p>
                <Button onClick={() => router.push('/rate')}>
                  {Object.keys(userRatings).length > 0 ? 'Rate More Movies' : 'Rate Movies'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Movie Details Modal */}
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
                <div className="relative h-48 bg-gradient-to-b from-gray-900 to-gray-600">
                  <img
                    src={selectedMovie.backdrop_url}
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/40" />
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
                  disabled={currentMovieIndex === recommendations.length - 1}
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
                    {(() => {
                      const TypeIcon = getRecommendationTypeIcon(selectedMovie.type);
                      return (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRecommendationTypeColor(selectedMovie.type)}`}>
                          <TypeIcon className="h-3 w-3" />
                          <span className="capitalize">{selectedMovie.type.replace('-', ' ')}</span>
                        </div>
                      );
                    })()}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <Star className="h-3 w-3" />
                      <span>{Math.round(selectedMovie.score * 20)}% match</span>
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
                  <div className="text-sm text-gray-600 mb-1">Your Rating</div>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const userRating = userRatings[selectedMovie.movie_id];
                      if (userRating) {
                        return (
                          <>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= userRating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-sm font-medium">{userRating}/5</span>
                          </>
                        );
                      } else {
                        return (
                          <span className="text-sm text-gray-500">Not rated</span>
                        );
                      }
                    })()}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Match Score</div>
                  <div className="font-medium text-primary">
                    {Math.round(selectedMovie.score * 20)}%
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Recommendation Type</div>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const TypeIcon = getRecommendationTypeIcon(selectedMovie.type);
                      return (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRecommendationTypeColor(selectedMovie.type)}`}>
                          <TypeIcon className="h-3 w-3" />
                          <span className="capitalize">{selectedMovie.type.replace('-', ' ')}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Star Rating Interface */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-3 text-center">Rate this movie:</div>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleModalRating(star)}
                      disabled={isRatingLoading}
                      className="transition-all duration-200 hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors duration-200 ${
                          modalRating >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-transparent text-gray-300 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                  {isRatingLoading && (
                    <div className="ml-3 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                {modalRating > 0 && !isRatingLoading && (
                  <div className="text-center mt-2 text-sm text-gray-600">
                    Rating: {modalRating}/5
                  </div>
                )}
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