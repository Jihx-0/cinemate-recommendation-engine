'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Film, Star, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { MovieCard } from '@/components/movie-card';
import { Search as SearchComponent } from '@/components/search';
import { moviesAPI, Movie } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Modal state
  const [showMovieDetailsModal, setShowMovieDetailsModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
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

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search-movies', query, page],
    queryFn: () => moviesAPI.searchMovies(query, page),
    enabled: !!query,
  });

  // Fetch user ratings for displaying existing ratings
  const { data: userRatingsData, isLoading: isLoadingUserRatings } = useQuery({
    queryKey: ['user-ratings'],
    queryFn: async () => {
      const response = await fetch('/api/rating-history');
      if (!response.ok) throw new Error('Failed to fetch user ratings');
      const data = await response.json();
      // Convert array format to object format for compatibility
      if (Array.isArray(data)) {
        const ratingsMap: Record<number, number> = {};
        data.forEach((item: any) => {
          ratingsMap[item.movie_id] = item.rating;
        });
        return { ratings: ratingsMap };
      }
      return data;
    },
    enabled: !!user,
  });

  const userRatings = userRatingsData?.ratings || {};

  // Effect to update modal rating when userRatingsData loads
  useEffect(() => {
    if (userRatingsData?.ratings && selectedMovie && !isLoadingUserRatings) {
      const existingRating = userRatingsData.ratings[selectedMovie.movie_id] || 0;
      console.log('useEffect triggered - updating modal rating for movie:', selectedMovie.title, 'ID:', selectedMovie.movie_id, 'Rating:', existingRating);
      setModalRating(existingRating);
    }
  }, [userRatingsData, selectedMovie, isLoadingUserRatings]);

  // Rating mutation
  const ratingMutation = useMutation({
    mutationFn: async ({ movieId, rating }: { movieId: number; rating: number }) => {
      const ratingsToSubmit: Record<string, number> = {};
      ratingsToSubmit[`rating_${movieId}`] = rating;
      
      // Get movie details from the selected movie
      const movieDetails = selectedMovie ? {
        [movieId]: {
          title: selectedMovie.title,
          overview: selectedMovie.overview || '',
          genre: selectedMovie.genre || '',
          poster_path: selectedMovie.poster_url ? selectedMovie.poster_url.replace('https://image.tmdb.org/t/p/w500', '') : null,
          backdrop_path: selectedMovie.backdrop_url ? selectedMovie.backdrop_url.replace('https://image.tmdb.org/t/p/w500', '') : null,
          vote_average: selectedMovie.vote_average || 0,
          release_date: selectedMovie.release_date || '',
          poster_url: selectedMovie.poster_url,
          backdrop_url: selectedMovie.backdrop_url
        }
      } : {};
      
      console.log('Submitting rating:', { movieId, rating, movieDetails });
      
      return moviesAPI.submitRatings(ratingsToSubmit, movieDetails);
    },
    onSuccess: (_, { movieId, rating }) => {
      console.log('Rating submitted successfully:', { movieId, rating });
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['rating-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-ratings'] });
      
      // Update local state immediately for better UX
      setModalRating(rating);
      setIsRatingLoading(false);
      showToastNotification('Rating saved!');
      
      // Don't close the modal - let user see their rating
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
    if (!searchResults?.movies || currentMovieIndex >= searchResults.movies.length - 1) return;
    const nextIndex = currentMovieIndex + 1;
    setCurrentMovieIndex(nextIndex);
    const nextMovie = searchResults.movies[nextIndex];
    setSelectedMovie(nextMovie);
    // The useEffect will handle setting the modal rating when userRatings data is available
    setModalRating(0); // Reset to 0, useEffect will update it
  };

  const handlePrevMovie = () => {
    if (currentMovieIndex > 0) {
      const prevIndex = currentMovieIndex - 1;
      setCurrentMovieIndex(prevIndex);
      const prevMovie = searchResults?.movies[prevIndex];
      setSelectedMovie(prevMovie || null);
      // The useEffect will handle setting the modal rating when userRatings data is available
      setModalRating(0); // Reset to 0, useEffect will update it
    }
  };

  const openMovieModal = (movie: Movie, index: number) => {
    console.log('Opening modal for movie:', movie.title, 'ID:', movie.movie_id);
    console.log('Current userRatings:', userRatings);
    console.log('Rating for this movie:', userRatings[movie.movie_id]);
    console.log('isLoadingUserRatings:', isLoadingUserRatings);
    
    setSelectedMovie(movie);
    setCurrentMovieIndex(index);
    // Set initial modal rating, but useEffect will update it when userRatings data loads
    setModalRating(userRatings[movie.movie_id] || 0);
    setShowMovieDetailsModal(true);
  };

  const handleSearch = (newQuery: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('q', newQuery);
    url.searchParams.delete('page');
    window.location.href = url.toString();
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <SearchComponent className="mx-auto max-w-md mb-8" onSearch={handleSearch} />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Search for Movies
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Find your favorite movies and discover new ones to rate
            </p>
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SearchIcon className="h-5 w-5" />
                  Search Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li>• Search by movie title</li>
                  <li>• Try partial titles (e.g., "Star Wars" for "Star Wars: A New Hope")</li>
                  <li>• Search is case-insensitive</li>
                  <li>• Results come from TMDb database</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navigation />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Search Results
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              {searchResults?.total_results || 0} results for "{query}"
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for movies...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
            <p className="text-gray-600">Something went wrong while searching. Please try again.</p>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && !error && searchResults && (
          <>
            {searchResults.movies.length === 0 ? (
              <div className="text-center py-12">
                <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No movies found</h3>
                <p className="text-gray-600 mb-4">
                  No movies found for "{query}". Try a different search term.
                </p>
                <Button onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.movies.map((movie: Movie, index: number) => (
                  <motion.div
                    key={movie.movie_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <MovieCard 
                      movie={movie} 
                      onClick={() => openMovieModal(movie, index)}
                      showMatchOverlay={false}
                      showMatchScore={false}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {searchResults.total_results > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  {page > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('page', (page - 1).toString());
                        window.location.href = url.toString();
                      }}
                    >
                      Previous
                    </Button>
                  )}
                  <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                    Page {page}
                  </span>
                  {page < searchResults.total_pages && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('page', (page + 1).toString());
                        window.location.href = url.toString();
                      }}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
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
                  disabled={!searchResults?.movies || currentMovieIndex >= searchResults.movies.length - 1}
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
                        <span>{selectedMovie.release_date.slice(0, 4)}</span>
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
                      <SearchIcon className="h-3 w-3" />
                      <span>Search Result</span>
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
              {user && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Rating</h3>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      {(userRatings[selectedMovie.movie_id] > 0 || modalRating > 0) ? 'Your rating:' : 'Rate this movie:'}
                    </span>
                    <div className="flex items-center gap-2">
                      {isLoadingUserRatings ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-gray-500">Loading your ratings...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const currentRating = modalRating > 0 ? modalRating : userRatings[selectedMovie.movie_id] || 0;
                              console.log('Rendering star', star, 'for movie', selectedMovie.title, 'currentRating:', currentRating, 'modalRating:', modalRating, 'userRating:', userRatings[selectedMovie.movie_id]);
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleModalRating(star);
                                  }}
                                  disabled={isRatingLoading}
                                  className="transition-colors duration-200 hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  <Star
                                    className={`h-6 w-6 transition-colors duration-200 ${
                                      currentRating >= star
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-transparent text-gray-300 hover:text-yellow-300'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                          <span className={`text-sm font-medium ${
                            (userRatings[selectedMovie.movie_id] > 0 || modalRating > 0) ? "text-yellow-600" : "text-gray-500"
                          }`}>
                            {(userRatings[selectedMovie.movie_id] > 0 || modalRating > 0) 
                              ? `${modalRating > 0 ? modalRating : userRatings[selectedMovie.movie_id]}/5` 
                              : 'Not rated'
                            }
                          </span>
                          {isRatingLoading && (
                            <div className="ml-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!user && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Rating</h3>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Rate this movie:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        Please <a href="/login" className="font-medium underline hover:text-blue-800">sign in</a> to rate this movie.
                      </span>
                    </div>
                  </div>
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