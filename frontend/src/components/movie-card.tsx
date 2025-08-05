'use client';

import Image from 'next/image';
import { Star, Calendar, Film } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Movie } from '@/lib/api';

interface MovieCardProps {
  movie: Movie;
  className?: string;
  showRating?: boolean;
  rating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  showMatchOverlay?: boolean;
  showMatchScore?: boolean;
  showTMDBRating?: boolean;
  customMatchPercentage?: number;
  onClick?: () => void;
  isRatingLoading?: boolean;
}

export function MovieCard({
  movie,
  className,
  showRating = false,
  rating = 0,
  onRatingChange,
  readonly = false,
  showMatchOverlay = true,
  showMatchScore = true,
  showTMDBRating = false,
  customMatchPercentage,
  onClick,
  isRatingLoading = false,
}: MovieCardProps) {
  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full',
      onClick && 'cursor-pointer hover:scale-105',
      className
    )} onClick={onClick}>
      <div className="relative aspect-[2/3] overflow-hidden flex-shrink-0">
        {movie.poster_url ? (
          <Image
            src={movie.poster_url}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/80">
            <Film className="h-12 w-12 text-white/50" />
          </div>
        )}
        {showMatchOverlay && (customMatchPercentage !== undefined || movie.vote_average) && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
            <span>{Math.round(customMatchPercentage !== undefined ? customMatchPercentage : Math.min(movie.vote_average!, 5.0) * 20)}% match</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1 p-4">
        <div className="flex-1">
          <h3 className="line-clamp-2 text-lg font-semibold leading-tight mb-2">
            {movie.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {movie.release_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{movie.release_date.slice(0, 4)}</span>
              </div>
            )}
            {movie.genre && (
              <div className="flex items-center gap-1">
                <Film className="h-3 w-3" />
                <span className="line-clamp-1">{movie.genre}</span>
              </div>
            )}
            {showTMDBRating && movie.vote_average && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>

          {movie.overview && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {movie.overview}
            </p>
          )}

          {showRating && onRatingChange && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium">
                {rating > 0 ? 'Your rating:' : 'Rate this movie:'}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent modal from opening
                        onRatingChange(star);
                      }}
                      disabled={readonly || isRatingLoading}
                      className={cn(
                        'transition-all duration-200 hover:scale-110',
                        readonly && 'cursor-default',
                        isRatingLoading && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <Star
                        className={cn(
                          'h-5 w-5 transition-colors duration-200',
                          rating >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-transparent text-gray-300 hover:text-yellow-300'
                        )}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm transition-colors duration-200",
                    rating > 0 ? "text-yellow-600 font-medium" : "text-muted-foreground"
                  )}>
                    {rating > 0 ? `${rating}/5` : 'Not rated'}
                  </span>
                  {isRatingLoading && (
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Match Score - Always at bottom */}
        {showMatchScore && !showMatchOverlay && (customMatchPercentage !== undefined || movie.vote_average) && (
          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Match Score</span>
              <span className="text-lg font-bold text-primary">
                {Math.round(customMatchPercentage !== undefined ? customMatchPercentage : Math.min(movie.vote_average || 0, 5.0) * 20)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 