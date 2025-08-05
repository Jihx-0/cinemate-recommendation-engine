# Cinemate 🎬

A sophisticated movie recommendation system that combines content-based and collaborative filtering to deliver personalized movie suggestions. 

Cinemate is a full-stack web application that helps users discover movies they'll love. Unlike simple recommendation systems, Cinemate uses advanced machine learning techniques to analyze both movie content and user behavior patterns, providing highly personalized recommendations.

### Key Features

- **🎯 Personalized Recommendations**: AI-powered suggestions based on your unique taste
- **🧠 Content-Based Filtering**: Analyzes movie content using TF-IDF vectorization and cosine similarity
- **👥 Collaborative Filtering**: Finds users with similar tastes and recommends what they enjoyed
- **🔄 Hybrid Approach**: Combines both algorithms for superior recommendation quality
- **📊 Real-time Learning**: Gets smarter as you rate more movies
- **🎨 Modern UI/UX**: Responsive interface with smooth animations
- **🔐 Secure Authentication**: User accounts with password validation and session management

## 🛠 Tech Stack

### Frontend
- **React 19.1.0** - Modern UI framework
- **Next.js 15.4.5** - Full-stack React framework with App Router
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Query (TanStack Query)** - Server state management
- **Lucide React** - Beautiful icons
- **Headless UI** - Accessible UI components

### Backend
- **Python 3.8+** - Backend runtime
- **Flask 2.3.3** - Lightweight web framework
- **Pandas** - Data manipulation and analysis
- **Scikit-learn** - Machine learning algorithms
- **SQLite** - Lightweight database
- **TMDb API** - Movie data source
- **Flask-CORS** - Cross-origin resource sharing

## 🧠 AI/ML Features

Cinemate uses advanced machine learning algorithms to deliver personalized recommendations:

### Content-Based Filtering
- **TF-IDF Vectorization**: Converts movie titles, overviews, and genres into numerical vectors
- **Cosine Similarity**: Measures similarity between movies based on their content vectors
- **User Profile Creation**: Builds a profile from your liked movies' content vectors

### Collaborative Filtering
- **User Similarity Matrix**: Calculates similarity between users using cosine similarity
- **Rating Patterns**: Analyzes how users rate movies to find taste similarities
- **Neighborhood-Based**: Identifies the most similar users to you

### Hybrid Recommendation System
- **60% Content-Based**: Leverages movie content analysis
- **40% Collaborative**: Utilizes user behavior patterns
- **Dynamic Weighting**: Adjusts based on available data
- **Fallback Mechanisms**: Graceful degradation when data is limited

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- TMDb API key (free at [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cinemate
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file with your API keys:
   echo "TMDB_API_KEY=your_api_key_here" > .env
   echo "FLASK_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')" >> .env
   echo "NEXT_PUBLIC_API_URL=http://localhost:5001" >> .env
   ```
   
   **Important**: Replace `your_api_key_here` with your actual TMDb API key from [themoviedb.org](https://www.themoviedb.org/settings/api)

3. **Install dependencies**
   ```bash
   # Install all dependencies (frontend and backend)
   npm run install:all
   ```

4. **Start the development servers**
   ```bash
   # This starts both frontend and backend concurrently
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Cinemate/
├── frontend/                 # React/Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utilities and API clients
│   │   └── providers/      # React context providers
│   └── package.json
├── backend/                 # Flask backend
│   ├── app.py              # Main Flask application
│   ├── user_system.py      # User management & ML algorithms
│   ├── tmdb_client.py      # TMDb API integration
│   └── requirements.txt
├── .env                    # Environment variables
└── README.md
```

## 🎯 How It Works

### 1. User Registration & Rating
- Create an account and start rating movies
- Rate movies you've watched (1-5 stars)
- The system learns your preferences from your ratings

### 2. Content Analysis
- **TF-IDF Processing**: Movie content (title, overview, genre) is converted to vectors
- **Similarity Calculation**: Cosine similarity finds movies with similar content
- **Profile Building**: Your liked movies create a content preference profile

### 3. Collaborative Analysis
- **User Similarity**: Finds users with similar rating patterns
- **Pattern Recognition**: Identifies what similar users enjoyed
- **Rating Prediction**: Predicts your likely ratings for unseen movies

### 4. Hybrid Recommendations
- **Algorithm Combination**: Merges content-based and collaborative results
- **Smart Weighting**: Balances both approaches based on data availability
- **Personalized Results**: Delivers unique recommendations for each user

## 🔧 Configuration

### Environment Variables
- `TMDB_API_KEY`: Your TMDb API key for movie data
- `FLASK_SECRET_KEY`: Secret key for Flask sessions
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:5001)

### ML Algorithm Parameters
- **TF-IDF**: 1000 max features, English stop words
- **Cosine Similarity**: Standard cosine distance metric
- **User Similarity**: Top 5 most similar users
- **Rating Thresholds**: Minimum 3 stars for content-based, 2 stars for collaborative

## ⚠️ Limitations

- **Data Source Size Impact**: The current implementation uses ~1,000 movies from TMDb's popular movies API. Larger datasets (10,000+ movies) would significantly improve recommendation accuracy by providing more diverse content vectors for TF-IDF analysis.

- **TF-IDF Match Accuracy**: The `tfidf_scores` variable represents the similarity scores between user preferences and movie content. Higher scores (closer to 1.0) indicate better matches, but accuracy depends heavily on the dataset size and quality of movie metadata (overview, genre, title).

- **Cold Start Problem**: New users with few ratings may receive less accurate recommendations until they rate more movies, as the system needs sufficient data to build reliable user profiles.

- **Genre Coverage**: Recommendations are limited to movies available in the TMDb dataset, which may not include all genres or niche films.

- **Real-time Updates**: Movie data is cached locally and requires manual refresh to include new releases from TMDb.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Sources

- [TMDb](https://www.themoviedb.org/)
- [Scikit-learn](https://scikit-learn.org/)
- [Next.js](https://nextjs.org/)
- [Flask](https://flask.palletsprojects.com/)

---

Built by BinaryNoodle