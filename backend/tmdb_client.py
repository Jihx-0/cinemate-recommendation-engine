import requests
import os
from typing import List, Dict, Optional
import time

class TMDBClient:
    """Client for interacting with The Movie Database (TMDb) API"""
    
    def __init__(self, api_key: Optional[str] = None):
        # For testing - replace with your actual TMDb API key
        self.api_key = api_key or os.getenv('TMDB_API_KEY') or "YOUR_TMDB_API_KEY_HERE"
        self.base_url = "https://api.themoviedb.org/3"
        self.image_base_url = "https://image.tmdb.org/t/p/w500"
        
        if not self.api_key or self.api_key == "YOUR_TMDB_API_KEY_HERE":
            print("Warning: No TMDb API key found. Set TMDB_API_KEY environment variable or pass api_key parameter.")
            print("Get your free API key at: https://www.themoviedb.org/settings/api")
            self.api_key = None
    
    def get_popular_movies(self, page: int = 1, limit: int = 50) -> List[Dict]:
        """Get popular movies from TMDb"""
        if not self.api_key:
            return self._get_sample_movies()
        
        url = f"{self.base_url}/movie/popular"
        params = {
            'api_key': self.api_key,
            'page': page,
            'language': 'en-US'
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            movies = []
            for movie in data['results'][:limit]:
                movies.append({
                    'movie_id': movie['id'],
                    'title': movie['title'],
                    'overview': movie['overview'],
                    'genre': self._get_genre_names(movie.get('genre_ids', [])),
                    'poster_path': movie.get('poster_path'),
                    'backdrop_path': movie.get('backdrop_path'),
                    'vote_average': movie.get('vote_average', 0),
                    'release_date': movie.get('release_date', ''),
                    'popularity': movie.get('popularity', 0)
                })
            
            return movies
            
        except requests.RequestException as e:
            print(f"Error fetching popular movies: {e}")
            return self._get_sample_movies()
    
    def get_movie_details(self, movie_id: int) -> Optional[Dict]:
        """Get detailed information about a specific movie"""
        if not self.api_key:
            return None
        
        url = f"{self.base_url}/movie/{movie_id}"
        params = {
            'api_key': self.api_key,
            'language': 'en-US',
            'append_to_response': 'credits,videos,images'
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            print(f"Error fetching movie details: {e}")
            return None
    
    def search_movies(self, query: str, page: int = 1) -> List[Dict]:
        """Search for movies by title"""
        if not self.api_key:
            return []
        
        url = f"{self.base_url}/search/movie"
        params = {
            'api_key': self.api_key,
            'query': query,
            'page': page,
            'language': 'en-US'
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            movies = []
            for movie in data['results']:
                movies.append({
                    'movie_id': movie['id'],
                    'title': movie['title'],
                    'overview': movie['overview'],
                    'genre': self._get_genre_names(movie.get('genre_ids', [])),
                    'poster_path': movie.get('poster_path'),
                    'vote_average': movie.get('vote_average', 0),
                    'release_date': movie.get('release_date', '')
                })
            
            return movies
            
        except requests.RequestException as e:
            print(f"Error searching movies: {e}")
            return []
    
    def get_genres(self) -> Dict[int, str]:
        """Get movie genres mapping"""
        if not self.api_key:
            return self._get_sample_genres()
        
        url = f"{self.base_url}/genre/movie/list"
        params = {
            'api_key': self.api_key,
            'language': 'en-US'
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            return {genre['id']: genre['name'] for genre in data['genres']}
            
        except requests.RequestException as e:
            print(f"Error fetching genres: {e}")
            return self._get_sample_genres()
    
    def _get_genre_names(self, genre_ids: List[int]) -> str:
        """Convert genre IDs to genre names"""
        genres = self.get_genres()
        genre_names = [genres.get(genre_id, '') for genre_id in genre_ids]
        return ', '.join(filter(None, genre_names))
    
    def get_poster_url(self, poster_path: Optional[str]) -> Optional[str]:
        """Get full poster URL"""
        if poster_path:
            return f"{self.image_base_url}{poster_path}"
        return None
    
    def get_backdrop_url(self, backdrop_path: Optional[str]) -> Optional[str]:
        """Get full backdrop URL"""
        if backdrop_path:
            return f"{self.image_base_url}{backdrop_path}"
        return None
    
    def _get_sample_genres(self) -> Dict[int, str]:
        """Fallback sample genres"""
        return {
            28: 'Action',
            12: 'Adventure',
            16: 'Animation',
            35: 'Comedy',
            80: 'Crime',
            99: 'Documentary',
            18: 'Drama',
            10751: 'Family',
            14: 'Fantasy',
            36: 'History',
            27: 'Horror',
            10402: 'Music',
            9648: 'Mystery',
            10749: 'Romance',
            878: 'Science Fiction',
            10770: 'TV Movie',
            53: 'Thriller',
            10752: 'War',
            37: 'Western'
        }
    
    def _get_sample_movies(self) -> List[Dict]:
        """Fallback sample movies when API is not available"""
        return [
            {
                'movie_id': 1,
                'title': 'The Shawshank Redemption',
                'overview': 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                'genre': 'Drama',
                'poster_path': None,
                'vote_average': 9.3,
                'release_date': '1994-09-22'
            },
            {
                'movie_id': 2,
                'title': 'The Godfather',
                'overview': 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.',
                'genre': 'Crime, Drama',
                'poster_path': None,
                'vote_average': 9.2,
                'release_date': '1972-03-14'
            },
            {
                'movie_id': 3,
                'title': 'The Dark Knight',
                'overview': 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.',
                'genre': 'Action, Crime, Drama',
                'poster_path': None,
                'vote_average': 9.0,
                'release_date': '2008-07-16'
            }
        ]

# Global TMDB client instance
tmdb_client = TMDBClient() 