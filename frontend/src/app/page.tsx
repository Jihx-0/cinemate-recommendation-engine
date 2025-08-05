'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, Users, Zap, X, Calendar, Film, Star } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { MovieCard } from '@/components/movie-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { moviesAPI, Movie } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

export default function HomePage() {
  const { user } = useAuth();
  const [showMovieDetailsModal, setShowMovieDetailsModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Fetch popular movies
  const { data: popularMovies = [], isLoading } = useQuery({
    queryKey: ['popular-movies'],
    queryFn: moviesAPI.getPopularMovies,
  });

  // Create shuffled hero movies that only change when popularMovies changes
  const heroMovies = useMemo(() => {
    if (!popularMovies || popularMovies.length === 0) return [];
    return [...popularMovies]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }, [popularMovies]);

  const openMovieModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowMovieDetailsModal(true);
  };

  const features = [
    {
      icon: Brain,
      title: 'Smart Recommendations',
      description: 'Uses ML to figure out what movies you might like based on what you\'ve rated.',
    },
    {
      icon: Users,
      title: 'Find Similar Users',
      description: 'Discovers people with similar taste and recommends what they enjoyed.',
    },
    {
      icon: Sparkles,
      title: 'Learns Your Taste',
      description: 'Gets better at recommendations the more movies you rate.',
    },
    {
      icon: Zap,
      title: 'Instant Updates',
      description: 'See new recommendations right away as you rate more movies.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Rate Movies',
      description: 'Rate movies you\'ve watched to help us understand your taste preferences.',
    },
    {
      number: '2',
      title: 'Get Recommendations',
      description: 'Our AI analyzes your ratings and suggests movies you\'ll likely enjoy.',
    },
    {
      number: '3',
      title: 'Discover & Enjoy',
      description: 'Explore new genres and discover hidden gems tailored to your taste.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-primary/60 py-20">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Discover Your Next{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Favorite Movie
                </span>
              </h1>
              <p className="mt-6 text-xl text-primary-foreground/80">
                Powered by AI, Cinemate analyzes your taste and recommends movies 
                you'll enjoy. In a world of endless options, Cinemate helps you find the right movie for you.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/rate">
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                    Start Rating Movies
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/recommendations">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 border-primary">
                    View Recommendations
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-3 gap-4">
                {heroMovies.map((movie: Movie, index: number) => (
                  <motion.div
                    key={movie.movie_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="transform transition-transform hover:scale-105 flex"
                  >
                    <MovieCard 
                      movie={movie} 
                      className="flex-1" 
                      customMatchPercentage={Math.floor(Math.random() * 40) + 60} // Random percentage between 60-99%
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Cinemate?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience the future of movie discovery with our cutting-edge AI technology.
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 bg-white/50 backdrop-blur-sm shadow-lg">
                  <CardHeader className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get started in just three simple steps
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  {step.number}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-4 text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Movies Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Popular Movies
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Trending movies you might enjoy
              </p>
            </div>
            <Link href="/rate">
              <Button>
                Rate More Movies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {popularMovies.slice(0, 8).map((movie: Movie, index: number) => (
                <motion.div
                  key={movie.movie_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  viewport={{ once: true }}
                >
                  <MovieCard 
                    movie={movie} 
                    customMatchPercentage={movie.vote_average ? Math.round(movie.vote_average * 10) : 0} // Convert TMDB rating (0-10) to percentage (0-100)
                    showMatchOverlay={false} // Hide match overlay
                    showMatchScore={false} // Hide match score
                    showTMDBRating={true} // Show TMDB rating
                    onClick={() => openMovieModal(movie)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Discover New Movies?
          </h2>
          <p className="mt-4 text-xl text-primary-foreground">
            Join users who have found their new favorite movies with Cinemate.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Movie Details Modal */}
      {showMovieDetailsModal && selectedMovie && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg max-w-2xl w-full"
          >
            <div className="relative">
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
              
              {/* Close Button */}
              <button
                onClick={() => setShowMovieDetailsModal(false)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
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
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <span>Popular Movie</span>
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
              <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
}
