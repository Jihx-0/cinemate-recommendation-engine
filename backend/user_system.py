import sqlite3
import hashlib
import pandas as pd
from typing import Optional, List, Dict, Tuple
from datetime import datetime, timedelta
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import secrets
import string

class UserSystem:
    def __init__(self, db_path: str = "noodlepicks.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create user_ratings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                movie_id INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, movie_id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create user_sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_token TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create password_reset_tokens table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_user(self, username: str, email: str, password: str) -> Optional[int]:
        """Create a new user account"""
        try:
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO users (username, email, password_hash)
                VALUES (?, ?, ?)
            ''', (username, email, password_hash))
            
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return user_id
        except sqlite3.IntegrityError:
            # Username or email already exists
            return None
    
    def authenticate_user(self, username: str, password: str) -> Optional[int]:
        """Authenticate a user and return their user ID"""
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id FROM users 
            WHERE username = ? AND password_hash = ?
        ''', (username, password_hash))
        
        result = cursor.fetchone()
        conn.close()
        
        return result[0] if result else None
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Get user information by ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, created_at FROM users 
            WHERE id = ?
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'user_id': result[0],
                'username': result[1],
                'email': result[2],
                'created_at': result[3]
            }
        return None

    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """Get user information by username"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, created_at FROM users 
            WHERE username = ?
        ''', (username,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'id': result[0],
                'username': result[1],
                'email': result[2],
                'created_at': result[3]
            }
        return None

    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user information by email"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, created_at FROM users 
            WHERE email = ?
        ''', (email,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'id': result[0],
                'username': result[1],
                'email': result[2],
                'created_at': result[3]
            }
        return None

    def update_password(self, user_id: int, new_password: str) -> bool:
        """Update user password"""
        try:
            password_hash = hashlib.sha256(new_password.encode()).hexdigest()
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE users SET password_hash = ? WHERE id = ?
            ''', (password_hash, user_id))
            
            conn.commit()
            conn.close()
            
            return True
        except Exception as e:
            print(f"Error updating password: {e}")
            return False
    
    def save_user_ratings(self, user_id: int, ratings: Dict[int, int]):
        """Save user ratings to the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for movie_id, rating in ratings.items():
            cursor.execute('''
                INSERT OR REPLACE INTO user_ratings (user_id, movie_id, rating)
                VALUES (?, ?, ?)
            ''', (user_id, movie_id, rating))
        
        conn.commit()
        conn.close()
    
    def add_rating(self, user_id: int, movie_id: int, rating: int):
        """Add a single rating for a user and movie"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_ratings (user_id, movie_id, rating)
            VALUES (?, ?, ?)
        ''', (user_id, movie_id, rating))
        
        conn.commit()
        conn.close()
    
    def remove_rating(self, user_id: int, movie_id: int):
        """Remove a rating for a user and movie"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            DELETE FROM user_ratings 
            WHERE user_id = ? AND movie_id = ?
        ''', (user_id, movie_id))
        
        conn.commit()
        conn.close()
    
    def get_user_ratings(self, user_id: int) -> Dict[int, int]:
        """Get all ratings for a specific user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT movie_id, rating FROM user_ratings 
            WHERE user_id = ?
        ''', (user_id,))
        
        ratings = {row[0]: row[1] for row in cursor.fetchall()}
        conn.close()
        
        return ratings
    
    def get_all_ratings(self) -> pd.DataFrame:
        """Get all user ratings for collaborative filtering"""
        conn = sqlite3.connect(self.db_path)
        
        query = '''
            SELECT user_id, movie_id, rating 
            FROM user_ratings
        '''
        
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        return df
    
    def get_user_stats(self, user_id: int) -> Dict:
        """Get user statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get total movies rated
        cursor.execute('''
            SELECT COUNT(*) FROM user_ratings WHERE user_id = ?
        ''', (user_id,))
        movies_rated = cursor.fetchone()[0]
        
        # Get average rating
        cursor.execute('''
            SELECT AVG(rating) FROM user_ratings WHERE user_id = ?
        ''', (user_id,))
        avg_rating = cursor.fetchone()[0] or 0
        
        # Get favorite movies (5 stars only)
        cursor.execute('''
            SELECT COUNT(*) FROM user_ratings 
            WHERE user_id = ? AND rating = 5
        ''', (user_id,))
        favorite_movies = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'movies_rated': movies_rated,
            'average_rating': round(avg_rating, 1),
            'favorite_movies': favorite_movies
        }
    
    def create_ratings_matrix(self) -> pd.DataFrame:
        """Create a user-item ratings matrix for collaborative filtering"""
        return self.get_all_ratings()
    
    def get_collaborative_recommendations(self, user_id: int, n_recommendations: int = 10, available_movie_ids: List[int] = None) -> List[Dict]:
        """Get collaborative filtering recommendations using matrix factorization"""
        from sklearn.metrics.pairwise import cosine_similarity
        from sklearn.decomposition import NMF
        import numpy as np
        
        # Get all user ratings for collaborative filtering
        all_ratings = self.get_all_ratings()
        
        if len(all_ratings) < 3:
            return self._get_simple_recommendations(user_id, n_recommendations, available_movie_ids, 'collaborative')
        
        # Create user-item matrix
        user_item_matrix = all_ratings.pivot_table(
            index='user_id', 
            columns='movie_id', 
            values='rating', 
            fill_value=0
        )
        
        # Check if current user exists in matrix
        if user_id not in user_item_matrix.index:
            return self._get_simple_recommendations(user_id, n_recommendations, available_movie_ids, 'collaborative')
        
        # Calculate user similarity using cosine similarity
        user_similarity = cosine_similarity(user_item_matrix)
        user_similarity_df = pd.DataFrame(
            user_similarity, 
            index=user_item_matrix.index, 
            columns=user_item_matrix.index
        )
        
        # Get similar users (top 5 most similar)
        similar_users = user_similarity_df[user_id].sort_values(ascending=False)[1:6]
        
        # Get movies rated by similar users but not by current user
        current_user_ratings = self.get_user_ratings(user_id)
        rated_movie_ids = set(current_user_ratings.keys())
        
        recommendations = []
        for similar_user_id, similarity_score in similar_users.items():
            if similarity_score < 0.01:  # Low similarity threshold
                continue
                
            similar_user_ratings = self.get_user_ratings(similar_user_id)
            
            for movie_id, rating in similar_user_ratings.items():
                if movie_id not in rated_movie_ids and rating >= 2:  # Low rating threshold
                    # Calculate collaborative score
                    collab_score = similarity_score * rating / 5.0  # Normalize to 0-1
                    rec_score = 2.0 + (collab_score * 2.0)  # Scale to 2-4
                    
                    recommendations.append({
                        'movie_id': int(movie_id),
                        'score': round(rec_score, 2),
                        'type': 'collaborative'
                    })
        
        # Sort by score and return top recommendations
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:n_recommendations]
    
    def _get_simple_recommendations(self, user_id: int, n_recommendations: int = 10, available_movie_ids: List[int] = None, recommendation_type: str = 'collaborative') -> List[Dict]:
        """Fallback simple recommendations when not enough data for collaborative filtering"""
        user_ratings = self.get_user_ratings(user_id)
        
        if not user_ratings:
            return []
        
        # Get user's average rating and preferences
        avg_rating = sum(user_ratings.values()) / len(user_ratings)
        liked_movies = [movie_id for movie_id, rating in user_ratings.items() if rating >= 4]
        
        # Use available movie IDs if provided
        if available_movie_ids is not None:
            all_movie_ids = set(available_movie_ids)
        else:
            all_movie_ids = set(range(1, 10000))
        
        rated_movie_ids = set(user_ratings.keys())
        unrated_movies = all_movie_ids - rated_movie_ids
        
        if not unrated_movies:
            return []
        
        # Simple recommendation: recommend movies based on user's average rating
        recommendations = []
        unrated_list = list(unrated_movies)
        
        # Sort by how close the movie ID is to liked movies (simple similarity)
        if liked_movies:
            # Recommend movies with similar IDs to liked movies
            for liked_movie in liked_movies:
                similar_movies = [mid for mid in unrated_list if abs(mid - liked_movie) <= 50]
                for i, movie_id in enumerate(similar_movies[:3]):  # Top 3 similar to each liked movie
                    if movie_id in unrated_list:
                        # Calculate score based on similarity and user's rating of the liked movie
                        similarity_score = 1.0 - (abs(movie_id - liked_movie) / 1000)  # Closer = higher score
                        user_rating_score = user_ratings[liked_movie] / 5.0  # Normalize to 0-1
                        final_score = (similarity_score * 0.7 + user_rating_score * 0.3) * 4  # Scale to 0-4, then add base
                        final_score = min(4.0, max(2.0, final_score))  # Clamp between 2.0-4.0
                        
                        recommendations.append({
                            'movie_id': int(movie_id),
                            'score': round(final_score, 2),
                            'type': recommendation_type
                        })
                        unrated_list.remove(movie_id)
        
        # Fill remaining slots with random unrated movies
        import random
        if len(recommendations) < n_recommendations and unrated_list:
            remaining_needed = n_recommendations - len(recommendations)
            if len(unrated_list) > remaining_needed:
                random_movies = random.sample(unrated_list, remaining_needed)
            else:
                random_movies = unrated_list
            
            for i, movie_id in enumerate(random_movies):
                # Lower score for random recommendations
                random_score = 2.0 + (random.random() * 1.5)  # 2.0-3.5 range
                recommendations.append({
                    'movie_id': int(movie_id),
                    'score': round(random_score, 2),
                    'type': recommendation_type
                })
        
        # Sort by score (highest first)
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:n_recommendations]
    
    def get_content_based_recommendations(self, user_id: int, n_recommendations: int = 10, available_movie_ids: List[int] = None, movies_df=None) -> List[Dict]:
        """Get content-based recommendations using TF-IDF and cosine similarity"""
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        import pandas as pd
        
        user_ratings = self.get_user_ratings(user_id)
        
        if not user_ratings:
            return []
        
        # Get user's liked movies (3-5 stars) - reduced threshold
        liked_movies = [movie_id for movie_id, rating in user_ratings.items() if rating >= 3]
        
        if not liked_movies:
            return []
        
        # Use real movie data if available, otherwise fallback
        if movies_df is not None and not movies_df.empty:
            # Filter to available movie IDs
            if available_movie_ids:
                movies_df_filtered = movies_df[movies_df['movie_id'].isin(available_movie_ids)]
            else:
                movies_df_filtered = movies_df
            
            # Check if any of the user's liked movies are in the current db
            # Use the full movies_df to check, not the filtered version
            liked_movies_in_db = [mid for mid in liked_movies if mid in movies_df['movie_id'].values]
            
            if not liked_movies_in_db:
                # Use fallback approach - recommend based on user's average rating
                return self._get_simple_recommendations(user_id, n_recommendations, available_movie_ids, 'content-based')
            
            # Create content strings from real movie data
            # Use the full movies_df to create content data, not the filtered version
            movie_content_data = []
            for _, movie in movies_df.iterrows():
                content_parts = []
                if pd.notna(movie.get('title')):
                    content_parts.append(str(movie['title']))
                if pd.notna(movie.get('overview')):
                    content_parts.append(str(movie['overview']))
                if pd.notna(movie.get('genre')):
                    content_parts.append(str(movie['genre']))
                
                content = ' '.join(content_parts) if content_parts else f"movie {movie['movie_id']}"
                
                movie_content_data.append({
                    'movie_id': movie['movie_id'],
                    'content': content
                })
        else:
            # Fallback to simple content data
            movie_content_data = []
            for movie_id in available_movie_ids or range(1, 1000):
                movie_content_data.append({
                    'movie_id': movie_id,
                    'content': f"movie {movie_id} action drama thriller"
                })
        
        if not movie_content_data:
            return []
        
        # Create TF-IDF vectors from movie content
        tfidf = TfidfVectorizer(stop_words='english', max_features=1000, min_df=1)
        content_matrix = tfidf.fit_transform([movie['content'] for movie in movie_content_data])
        
        # Calculate user profile (average of liked movies that are in the database)
        user_profile = None
        movies_used_for_profile = 0
        
        for liked_movie_id in liked_movies_in_db:
            movie_idx = next((i for i, m in enumerate(movie_content_data) if m['movie_id'] == liked_movie_id), None)
            if movie_idx is not None:
                if user_profile is None:
                    user_profile = content_matrix[movie_idx]
                else:
                    user_profile += content_matrix[movie_idx]
                movies_used_for_profile += 1
        
        if user_profile is None:
            return []
        
        # Normalize user profile
        user_profile = user_profile / movies_used_for_profile
        
        # Calculate similarity with all movies
        similarities = cosine_similarity(user_profile, content_matrix).flatten()
        
        # Get top similar movies (excluding already rated)
        rated_movie_ids = set(user_ratings.keys())
        movie_scores = []
        
        for i, movie in enumerate(movie_content_data):
            if movie['movie_id'] not in rated_movie_ids:
                movie_scores.append({
                    'movie_id': movie['movie_id'],
                    'score': similarities[i],
                    'type': 'content-based'
                })
        
        # Sort by similarity score
        movie_scores.sort(key=lambda x: x['score'], reverse=True)
        
        # Convert similarity scores to recommendation scores (0-4 scale)
        recommendations = []
        for i, movie_score in enumerate(movie_scores[:n_recommendations]):
            # Convert similarity (0-1) to recommendation score (2-4)
            rec_score = 2.0 + (movie_score['score'] * 2.0)
            recommendations.append({
                'movie_id': movie_score['movie_id'],
                'score': round(rec_score, 2),
                'type': 'content-based'
            })
        
        return recommendations
    
    def collaborative_filtering_recommendations(self, user_id: int, movies_df: pd.DataFrame, n_recommendations: int = 10) -> List[Dict]:
        """Get collaborative filtering recommendations"""
        # Get all user ratings
        ratings_df = self.get_all_ratings()
        
        if len(ratings_df) < 10:  # Need minimum data for collaborative filtering
            return []
        
        # Create user-item matrix
        user_item_matrix = ratings_df.pivot_table(
            index='user_id', 
            columns='movie_id', 
            values='rating', 
            fill_value=0
        )
        
        # Calculate user similarity
        user_similarity = cosine_similarity(user_item_matrix)
        user_similarity_df = pd.DataFrame(
            user_similarity, 
            index=user_item_matrix.index, 
            columns=user_item_matrix.index
        )
        
        # Get similar users
        if user_id not in user_similarity_df.index:
            return []
        
        similar_users = user_similarity_df[user_id].sort_values(ascending=False)[1:6]  # Top 5 similar users
        
        # Get movies rated by similar users but not by current user
        user_ratings = self.get_user_ratings(user_id)
        rated_movie_ids = set(user_ratings.keys())
        
        recommendations = []
        for similar_user_id, similarity_score in similar_users.items():
            if similarity_score < 0.1:  # Minimum similarity threshold
                continue
                
            similar_user_ratings = self.get_user_ratings(similar_user_id)
            
            for movie_id, rating in similar_user_ratings.items():
                if movie_id not in rated_movie_ids and rating >= 4:  # Only highly rated movies
                    # Check if movie exists in our db
                    movie_data = movies_df[movies_df['movie_id'] == movie_id]
                    if not movie_data.empty:
                        movie_dict = movie_data.iloc[0].to_dict()
                        movie_dict['collaborative_score'] = similarity_score * rating
                        movie_dict['recommendation_type'] = 'collaborative'
                        recommendations.append(movie_dict)
        
        # Sort by collaborative score and return top recommendations
        recommendations.sort(key=lambda x: x['collaborative_score'], reverse=True)
        return recommendations[:n_recommendations]
    
    def hybrid_recommendations(self, user_id: int, movies_df: pd.DataFrame, content_based_recs: List[Dict], n_recommendations: int = 10) -> List[Dict]:
        """Combine content-based and collaborative filtering for single-user scenarios"""
        # Get collaborative recommendations using the simple method
        collab_recs = self.get_collaborative_recommendations(user_id, n_recommendations)
        
        if not collab_recs:
            return content_based_recs
        
        # Combine recommendations
        all_recs = {}
        
        # Add content-based recommendations
        for i, rec in enumerate(content_based_recs):
            movie_id = rec['movie_id']
            all_recs[movie_id] = {
                'movie': rec,
                'content_score': len(content_based_recs) - i,  # Higher score for higher ranked
                'collab_score': 0
            }
        
        # Add collaborative recommendations
        for i, rec in enumerate(collab_recs):
            movie_id = rec['movie_id']
            if movie_id in all_recs:
                all_recs[movie_id]['collab_score'] = rec['score']
            else:
                all_recs[movie_id] = {
                    'movie': rec,
                    'content_score': 0,
                    'collab_score': rec['score']
                }
        
        # Calculate hybrid scores (60% content-based, 40% collaborative)
        hybrid_recs = []
        for movie_id, scores in all_recs.items():
            hybrid_score = 0.6 * scores['content_score'] + 0.4 * scores['collab_score']
            movie_data = scores['movie'].copy()
            movie_data['score'] = hybrid_score
            movie_data['type'] = 'hybrid'
            hybrid_recs.append((movie_id, hybrid_score, movie_data))
        
        # Sort by hybrid score
        hybrid_recs.sort(key=lambda x: x[1], reverse=True)
        
        return [rec[2] for rec in hybrid_recs[:n_recommendations]]

    def generate_reset_token(self, username: str, email: str) -> Optional[str]:
        """Generate a password reset token for a user"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Verify username and email match
            cursor.execute('''
                SELECT id FROM users 
                WHERE username = ? AND email = ?
            ''', (username, email))
            
            result = cursor.fetchone()
            if not result:
                conn.close()
                return None
            
            user_id = result[0]
            
            # Generate a secure random token
            token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
            
            # Set expiration time (1 hour from now)
            expires_at = datetime.now() + timedelta(hours=1)
            
            # Store the token
            cursor.execute('''
                INSERT INTO password_reset_tokens (user_id, token, expires_at)
                VALUES (?, ?, ?)
            ''', (user_id, token, expires_at))
            
            conn.commit()
            conn.close()
            
            return token
            
        except Exception as e:
            print(f"Error generating reset token: {e}")
            return None

    def validate_reset_token(self, token: str) -> Optional[int]:
        """Validate a password reset token and return user_id if valid"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT user_id FROM password_reset_tokens 
                WHERE token = ? AND expires_at > ? AND used = FALSE
            ''', (token, datetime.now()))
            
            result = cursor.fetchone()
            conn.close()
            
            return result[0] if result else None
            
        except Exception as e:
            print(f"Error validating reset token: {e}")
            return None

    def use_reset_token(self, token: str) -> bool:
        """Mark a reset token as used"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE password_reset_tokens 
                SET used = TRUE 
                WHERE token = ?
            ''', (token,))
            
            conn.commit()
            conn.close()
            
            return True
            
        except Exception as e:
            print(f"Error using reset token: {e}")
            return False

    def reset_password_with_token(self, token: str, new_password: str) -> bool:
        """Reset password using a valid token"""
        try:
            user_id = self.validate_reset_token(token)
            if not user_id:
                return False
            
            # Update the password
            success = self.update_password(user_id, new_password)
            if success:
                # Mark token as used
                self.use_reset_token(token)
            
            return success
            
        except Exception as e:
            print(f"Error resetting password with token: {e}")
            return False

# Create global instance
user_system = UserSystem() 