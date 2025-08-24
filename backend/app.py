import os
import pandas as pd
import numpy as np
from datetime import datetime
from flask import Flask, request, redirect, session, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from tmdb_client import TMDBClient
from user_system import UserSystem

# Load .env file
load_dotenv('../.env')

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-here')

# Configure session
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_DOMAIN'] = None  # Allow cross-subdomain cookies

# Enable CORS for React frontend
CORS(app, supports_credentials=True, origins=['http://localhost:3000'])

# Init TMDB client
tmdb_client = TMDBClient()

# Init user system
user_system = UserSystem("cinemate.db")

# Global var to store movies
movies_df = None

@app.route('/health')
def health_check():
    """Health check endpoint for Kubernetes"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'cinemate-backend',
        'version': '1.0.0'
    }), 200

def load_movie_data():
    """Load movie data from TMDb API or fallback to sample data"""
    global movies_df
    import json
    import os
    
    # Check if we have cached movies
    cache_file = "cached_movies.json"
    if os.path.exists(cache_file):
        try:
            with open(cache_file, 'r') as f:
                cached_data = json.load(f)
            movies_df = pd.DataFrame(cached_data)
            return
        except Exception as e:
            pass
    
    # Set a fixed seed for consistent results
    import random
    random.seed(42)  # Fixed seed for consistent movie selection
    
    # Try to get popular movies from TMDb (fetch many more pages for larger dataset)
    movies = []
    # Fetch 50 pages = up to 1000 movies - configuranble
    for page in range(1, 51):
        page_movies = tmdb_client.get_popular_movies(page=page, limit=20)
        if page_movies:
            movies.extend(page_movies)
        else:
            break
    
    if movies:
        movies_df = pd.DataFrame(movies)
        
        # Remove duplicates
        movies_df = movies_df.drop_duplicates(subset=['movie_id'], keep='first')
        movies_df = movies_df.drop_duplicates(subset=['title'], keep='first')
        
        # Sort by movie_id
        movies_df = movies_df.sort_values('movie_id').reset_index(drop=True)
        
        # Take up to 1000 movies
        if len(movies_df) > 1000:
            movies_df = movies_df.head(1000)
        
        # Add poster and backdrop URLs
        if 'poster_path' in movies_df.columns:
            movies_df['poster_url'] = movies_df['poster_path'].apply(tmdb_client.get_poster_url)
        if 'backdrop_path' in movies_df.columns:
            movies_df['backdrop_url'] = movies_df['backdrop_path'].apply(tmdb_client.get_backdrop_url)
        
        # Cache the movies
        try:
            movies_df.to_json(cache_file, orient='records')
        except Exception as e:
            pass
    else:
        # Fallback to sample data 
        np.random.seed(42)
        
        # Generate unique movie IDs and titles
        movie_ids = list(range(1, 1001))
        titles = [f'Sample Movie {i}' for i in range(1, 1001)]
        genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Romance', 'Horror', 'Adventure', 'Fantasy', 'Mystery'] * 100
        
        movies_df = pd.DataFrame({
            'movie_id': movie_ids,
            'title': titles,
            'overview': [f'This is a sample movie overview for movie {i}.' for i in range(1, 1001)],
            'genre': genres[:1000],  # Ensure we have exactly 1000 genres
            'vote_average': np.random.uniform(5.0, 9.0, 1000),
            'release_date': [f'{np.random.randint(2010, 2024)}-{np.random.randint(1, 13):02d}-{np.random.randint(1, 29):02d}' for _ in range(1000)]
        })
        
        # Ensure no duplicates
        movies_df = movies_df.drop_duplicates(subset=['movie_id'], keep='first')
        movies_df = movies_df.drop_duplicates(subset=['title'], keep='first')
        
        # Cache the fallback movies too
        try:
            movies_df.to_json(cache_file, orient='records')
        except Exception as e:
            pass

# Load movie data on startup
load_movie_data()

def get_recommendations_for_user(user_id, n_recommendations=10):
    """Get personalized recommendations using machine learning"""
    try:
        # Get user's ratings
        user_ratings = user_system.get_user_ratings(user_id)
        
        if not user_ratings:
            return []
        
        # Get available movie IDs from the db
        available_movie_ids = movies_df['movie_id'].tolist() if movies_df is not None else []
        
        # Filter out already rated
        rated_movie_ids = set(user_ratings.keys())
        available_movie_ids = [mid for mid in available_movie_ids if mid not in rated_movie_ids]
        
        # If no movies available after filtering, return empty list
        if not available_movie_ids:
            return []
        
        # Get content-based recommendations
        content_recommendations = user_system.get_content_based_recommendations(user_id, n_recommendations, available_movie_ids, movies_df)
        
        # Try collaborative filtering too
        try:
            collaborative_recommendations = user_system.get_collaborative_recommendations(user_id, n_recommendations, available_movie_ids)
        except Exception as e:
            collaborative_recommendations = []
        
        # Combine recommendations (60% content-based, 40% collaborative)
        recommendations = []
        
        # Add content-based recommendations
        content_count = min(len(content_recommendations), int(n_recommendations * 0.6))
        recommendations.extend(content_recommendations[:content_count])
        
        # Add collaborative recommendations
        collab_count = min(len(collaborative_recommendations), n_recommendations - len(recommendations))
        recommendations.extend(collaborative_recommendations[:collab_count])
        
        # If we still don't have enough, add more from whichever has more
        if len(recommendations) < n_recommendations:
            remaining = n_recommendations - len(recommendations)
            if len(content_recommendations) > content_count:
                recommendations.extend(content_recommendations[content_count:content_count + remaining])
            elif len(collaborative_recommendations) > collab_count:
                recommendations.extend(collaborative_recommendations[collab_count:collab_count + remaining])
        
        # Enrich recommendations with full movie data
        enriched_recommendations = []
        for rec in recommendations[:n_recommendations]:
            movie_id = rec['movie_id']
            
            # Double-check that this movie hasn't been rated
            if movie_id in rated_movie_ids:
                continue
            
            # Find the movie in our movies_df
            movie_data = movies_df[movies_df['movie_id'] == movie_id]
            
            if not movie_data.empty:
                movie_info = movie_data.iloc[0].to_dict()
                
                # Create enriched recommendation
                enriched_rec = {
                    'movie_id': movie_id,
                    'title': movie_info.get('title', f'Movie {movie_id}'),
                    'overview': movie_info.get('overview', ''),
                    'genre': movie_info.get('genre', ''),
                    'poster_url': movie_info.get('poster_url', ''),
                    'backdrop_url': movie_info.get('backdrop_url', ''),
                    'vote_average': movie_info.get('vote_average', 0),
                    'release_date': movie_info.get('release_date', ''),
                    'score': rec.get('score', 0),
                    'type': rec.get('type', 'content-based')
                }
                enriched_recommendations.append(enriched_rec)
        
        return enriched_recommendations
    
    except Exception as e:
        return []

def save_movie_to_local_db(movie_id: int, movie_data: dict):
    """Save movie details to local database if it doesn't exist"""
    global movies_df
    
    if movies_df is None:
        return
    
    # Check if movie already exists in our database
    if movie_id in movies_df['movie_id'].values:
        return
    
    # Create new movie entry
    new_movie = {
        'movie_id': movie_id,
        'title': movie_data.get('title', ''),
        'overview': movie_data.get('overview', ''),
        'genre': movie_data.get('genre', ''),
        'poster_path': movie_data.get('poster_path'),
        'backdrop_path': movie_data.get('backdrop_path'),
        'vote_average': movie_data.get('vote_average', 0),
        'release_date': movie_data.get('release_date', ''),
        'poster_url': movie_data.get('poster_url'),
        'backdrop_url': movie_data.get('backdrop_url')
    }
    
    # Add to movies_df
    new_movie_df = pd.DataFrame([new_movie])
    movies_df = pd.concat([movies_df, new_movie_df], ignore_index=True)
    
    # Save to cache file
    try:
        # Save to current directory
        movies_df.to_json("cached_movies.json", orient='records')
    except Exception as e:
        pass

# API Routes for React Frontend
@app.route('/api/popular-movies')
def api_popular_movies():
    """API endpoint to get popular movies for homepage"""
    try:
        # Get a random sample of 12 movies for variety
        # Use session-based randomization
        import random
        import time
        
        # Create a seed based on current time and session (if available)
        seed_base = int(time.time()) // 300
        if 'user_id' in session:
            seed_base += session['user_id']
        
        if len(movies_df) > 12:
            popular_movies = movies_df.sample(n=12, random_state=seed_base).to_dict('records')
        else:
            popular_movies = movies_df.to_dict('records')
        
        response = jsonify(popular_movies)
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search-movies')
def api_search_movies():
    """API endpoint to search movies by title"""
    try:
        query = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        
        if not query:
            return jsonify({'movies': [], 'page': page, 'total_pages': 0, 'total_results': 0})
        
        # Search using TMDb API
        search_data = tmdb_client.search_movies(query, page)
        search_results = search_data.get('movies', [])
        total_pages = search_data.get('total_pages', 0)
        total_results = search_data.get('total_results', 0)
        
        # Add poster URLs to movies
        for movie in search_results:
            if movie.get('poster_path'):
                movie['poster_url'] = tmdb_client.get_poster_url(movie['poster_path'])
            else:
                movie['poster_url'] = None
            
            if movie.get('backdrop_path'):
                movie['backdrop_url'] = tmdb_client.get_backdrop_url(movie['backdrop_path'])
            else:
                movie['backdrop_url'] = None
        
        return jsonify({
            'movies': search_results,
            'page': page,
            'total_pages': total_pages,
            'total_results': total_results,
            'query': query
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rate-movies')
def api_rate_movies():
    """API endpoint to get movies for rating with pagination"""
    try:
        # Get page parameter from query string
        page = request.args.get('page', 1, type=int)
        movies_per_page = 20
        total_pages = 20
        total_movies_needed = movies_per_page * total_pages
        
        # Ensure page is within valid range
        if page < 1:
            page = 1
        elif page > total_pages:
            page = total_pages
        
        total_available_movies = len(movies_df)
        
        # If we don't have enough movies, adjust the number of pages
        if total_available_movies < total_movies_needed:
            total_pages = total_available_movies // movies_per_page
            total_movies_needed = total_pages * movies_per_page
            if page > total_pages:
                page = total_pages
        
        # Sort by movie_id to ensure consistent order, then shuffle for variety
        sorted_movies = movies_df.sort_values('movie_id').reset_index(drop=True)
        
        if total_available_movies >= total_movies_needed:
            sampled_movies = sorted_movies.head(total_movies_needed)
        else:
            sampled_movies = sorted_movies
        
        # Shuffle the movies for variety while keeping the same set
        # Use a different random seed for each page to ensure variety
        import random
        page_seed = random.randint(1, 1000) + (page * 100)  # Different seed per page
        sampled_movies = sampled_movies.sample(frac=1, random_state=page_seed).reset_index(drop=True)
        
        start_idx = (page - 1) * movies_per_page
        end_idx = start_idx + movies_per_page
        
        # Get movies page
        if start_idx < len(sampled_movies):
            page_movies = sampled_movies.iloc[start_idx:end_idx].to_dict('records')
        else:
            page_movies = []
        
        return jsonify({
            'movies': page_movies,
            'page': page,
            'total_pages': total_pages,
            'movies_per_page': movies_per_page,
            'total_movies': len(sampled_movies)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/submit-ratings', methods=['POST'])
def api_submit_ratings():
    """API endpoint to submit user ratings"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'User not authenticated'}), 401
        
        data = request.get_json()
        ratings = data.get('ratings', {})
        movie_details = data.get('movie_details', {})  # New field for movie details
        
        user_id = session['user_id']
        
        for key, value in ratings.items():
            if key.startswith('rating_'):
                movie_id = int(key.replace('rating_', ''))
                rating_value = int(value)
                
                if movie_details and str(movie_id) in movie_details:
                    save_movie_to_local_db(movie_id, movie_details[str(movie_id)])
                
                try:
                    user_system.add_rating(user_id, movie_id, rating_value)
                except Exception as e:
                    return jsonify({'error': f'Failed to save rating: {str(e)}'}), 500
        
        return jsonify({'message': 'Ratings submitted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/remove-rating', methods=['POST'])
def api_remove_rating():
    """API endpoint to remove a user rating"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'User not authenticated'}), 401
        
        data = request.get_json()
        movie_id = data.get('movie_id')
        
        if movie_id is None:
            return jsonify({'error': 'Movie ID is required'}), 400
        
        # Ensure movie_id is an integer
        try:
            movie_id = int(movie_id)
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid movie ID format'}), 400
        
        user_id = session['user_id']
        user_system.remove_rating(user_id, movie_id)
        
        return jsonify({'message': 'Rating removed successfully', 'movie_id': movie_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations')
def api_recommendations():
    """API endpoint to get user recommendations"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'User not authenticated'}), 401
        
        user_id = session['user_id']
        
        # Get recommendations
        recommendations = get_recommendations_for_user(user_id, 12)
        
        # Get user's ratings for display
        user_ratings = user_system.get_user_ratings(user_id)
        
        return jsonify({
            'recommendations': recommendations,
            'user_ratings': user_ratings
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile')
def api_profile():
    """API endpoint to get user profile"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'User not authenticated'}), 401
        
        user_id = session['user_id']
        user = user_system.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user-stats')
def api_user_stats():
    """API endpoint to get user statistics"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'User not authenticated'}), 401
        
        user_id = session['user_id']
        stats = user_system.get_user_stats(user_id)
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rating-history')
def api_rating_history():
    """API endpoint to get user rating history"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'User not authenticated'}), 401
        
        user_id = session['user_id']
        ratings = user_system.get_user_ratings(user_id)
        
        # Get movie details for the rated movies
        rating_history = []
        if ratings and movies_df is not None:
            for movie_id, rating in ratings.items():
                movie_data = movies_df[movies_df['movie_id'] == movie_id]
                if not movie_data.empty:
                    movie_info = movie_data.iloc[0].to_dict()
                    rating_history.append({
                        'movie_id': movie_id,
                        'rating': rating,
                        'title': movie_info.get('title', f'Movie {movie_id}'),
                        'overview': movie_info.get('overview', ''),
                        'genre': movie_info.get('genre', ''),
                        'poster_url': movie_info.get('poster_url'),
                        'backdrop_url': movie_info.get('backdrop_url'),
                        'vote_average': movie_info.get('vote_average', 0),
                        'release_date': movie_info.get('release_date', '')
                    })
                else:
                    # If movie not in local database, return basic info
                    rating_history.append({
                        'movie_id': movie_id,
                        'rating': rating,
                        'title': f'Movie {movie_id}',
                        'overview': '',
                        'genre': '',
                        'poster_url': None,
                        'backdrop_url': None,
                        'vote_average': 0,
                        'release_date': ''
                    })
        
        return jsonify(rating_history)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/movie-details')
def api_movie_details():
    """API endpoint to get movie details by IDs"""
    try:
        movie_ids = request.args.get('ids', '').split(',')
        if not movie_ids or movie_ids[0] == '':
            return jsonify([])
        
        movie_ids = [int(mid) for mid in movie_ids if mid.isdigit()]
        if not movie_ids:
            return jsonify([])
        
        # Filter movies_df to get only the requested movie IDs
        if movies_df is not None:
            movie_details = movies_df[movies_df['movie_id'].isin(movie_ids)].to_dict('records')
            return jsonify(movie_details)
        else:
            return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Authentication routes

@app.route('/login', methods=['POST'])
def api_login():
    """API endpoint for user login"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Check if user exists first
        user = user_system.get_user_by_username(username)
        if not user:
            return jsonify({'error': 'User not found. Please check your username or create a new account.'}), 404
        
        user_id = user_system.authenticate_user(username, password)
        
        if user_id:
            session['user_id'] = user_id
            user = user_system.get_user_by_id(user_id)
            return jsonify({'message': 'Login successful', 'user': user})
        else:
            return jsonify({'error': 'Invalid password. Please check your credentials and try again.'}), 401
    
    except Exception as e:
        return jsonify({'error': 'Server error. Please try again later.'}), 500

@app.route('/register', methods=['POST'])
def api_register():
    """API endpoint for user registration"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({'error': 'Username, email, and password are required'}), 400
        
        # Password validation
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        if not any(c.isupper() for c in password):
            return jsonify({'error': 'Password must contain at least one uppercase letter'}), 400
        
        if not any(c.islower() for c in password):
            return jsonify({'error': 'Password must contain at least one lowercase letter'}), 400
        
        if not any(c.isdigit() for c in password):
            return jsonify({'error': 'Password must contain at least one number'}), 400
        
        # Username validation
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters long'}), 400
        
        # Email validation
        if '@' not in email or '.' not in email:
            return jsonify({'error': 'Please enter a valid email address'}), 400
        
        # Check if user already exists
        if user_system.get_user_by_username(username):
            return jsonify({'error': 'Username already exists. Please choose a different username.'}), 409
        
        # Check if email already exists
        if user_system.get_user_by_email(email):
            return jsonify({'error': 'Email already registered. Please use a different email or try logging in.'}), 409
        
        # Create new user
        user_id = user_system.create_user(username, email, password)
        
        if user_id:
            session['user_id'] = user_id
            user = user_system.get_user_by_id(user_id)
            return jsonify({'message': 'Registration successful', 'user': user})
        else:
            return jsonify({'error': 'Registration failed. Please try again.'}), 500
    
    except Exception as e:
        return jsonify({'error': 'Server error. Please try again later.'}), 500

@app.route('/logout', methods=['POST'])
def api_logout():
    """API endpoint for user logout"""
    try:
        session.clear()
        return jsonify({'message': 'Logout successful'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/user')
def api_get_current_user():
    """API endpoint to get current user"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        user_id = session['user_id']
        user = user_system.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset-password', methods=['POST'])
def api_reset_password():
    """Reset user password"""
    if 'user_id' not in session:
        return jsonify({'error': 'User not authenticated'}), 401
    
    try:
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        user_id = session['user_id']
        
        # Verify current password
        user = user_system.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if current password is correct
        if not user_system.authenticate_user(user['username'], current_password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Update password
        success = user_system.update_password(user_id, new_password)
        if not success:
            return jsonify({'error': 'Failed to update password'}), 500
        
        return jsonify({'message': 'Password updated successfully'})
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/forgot-password', methods=['POST'])
def api_forgot_password():
    """Generate password reset token"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        
        if not username or not email:
            return jsonify({'error': 'Username and email are required'}), 400
        
        # Generate reset token
        token = user_system.generate_reset_token(username, email)
        
        if token:
            # In prod, this token would be sent via email
            return jsonify({
                'message': 'Password reset instructions sent!',
                'token': token,  # Remove this in prod
                'note': 'In production, this token would be sent via email'
            })
        else:
            return jsonify({'error': 'Invalid username or email'}), 400
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/reset-password-with-token', methods=['POST'])
def api_reset_password_with_token():
    """Reset password using a token"""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('newPassword')
        
        if not token or not new_password:
            return jsonify({'error': 'Token and new password are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Reset password with token
        success = user_system.reset_password_with_token(token, new_password)
        
        if success:
            return jsonify({'message': 'Password reset successfully'})
        else:
            return jsonify({'error': 'Invalid or expired token'}), 400
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

# Legacy routes for backward compatibility
@app.route('/')
def home():
    """Legacy home route - redirects to React frontend"""
    return redirect('http://localhost:3000')

@app.route('/rate')
def rate_movies():
    """Legacy rate movies route - redirects to React frontend"""
    return redirect('http://localhost:3000/rate')

@app.route('/recommendations')
def recommendations():
    """Legacy recommendations route - redirects to React frontend"""
    return redirect('http://localhost:3000/recommendations')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 