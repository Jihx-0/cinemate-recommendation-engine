# Cinemate 🎬

A sophisticated movie recommendation system that combines content-based and collaborative filtering to deliver personalized movie suggestions. 

Cinemate is a full-stack web application that helps users discover movies they'll love. Unlike simple recommendation systems, Cinemate uses advanced machine learning techniques to analyze both movie content and user behavior patterns, providing personalized recommendations.

### Version History
- **v1.1.0 - Grafana/Prometheus Observability
- **v1.0.0 - Initial Release - (main)

### Key Features

- **Personalized Recommendations**: AI-powered suggestions based on your unique taste
- **Content-Based Filtering**: Analyzes movie content using TF-IDF vectorization and cosine similarity
- **Collaborative Filtering**: Finds users with similar tastes and recommends what they enjoyed
- **Hybrid Approach**: Combines both algorithms for superior recommendation quality
- **Real-time Learning**: Gets smarter as you rate more movies
- **Modern UI/UX**: Responsive interface with smooth animations
- **Secure Authentication**: User accounts with password validation and session management

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
- **Docker Desktop** - Required for running the application
- **TMDb API key** - Free at [themoviedb.org](https://www.themoviedb.org/settings/api)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cinemate-recommendation-engine
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file with your API keys:
   echo "TMDB_API_KEY=your_api_key_here" > .env
   echo "FLASK_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')" >> .env
   ```
   
   **Important**: Replace `your_api_key_here` with your actual TMDb API key from [themoviedb.org](https://www.themoviedb.org/settings/api)

3. **Start the application**
   ```bash
   # Make sure Docker Desktop is running, then:
   docker-compose up --build
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Setup

Cinemate is designed to run in Docker containers for consistent deployment across environments.

### Docker Services

- **Backend**: Flask ML service with health checks
- **Frontend**: React app with hot reloading
- **Database**: SQLite database
- **Redis**: For future caching enhancements

### Development with Docker

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up --build
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📁 Project Structure

```
Cinemate/
├── frontend/                 # React/Next.js frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities and API clients
│   │   └── providers/        # React context providers
│   └── package.json
├── backend/                 # Flask backend
│   ├── app.py               # Main Flask application
│   ├── user_system.py       # User management & ML algorithms
│   ├── tmdb_client.py       # TMDb API integration
│   └── requirements.txt
├── .env                     # Environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Root package.json with scripts
├── Dockerfile.backend       # Backend container config
├── Dockerfile.frontend      # Frontend container config
├── docker-compose.yml       # Docker compose file
└── README.md                # Information
```

## 🎯 Features

### User Authentication
- **Registration**: Create account with email validation
- **Login/Logout**: Secure session management
- **Password Security**: Strong password requirements and validation
- **Profile Management**: View and manage your account

### Movie Rating System
- **Rate Movies**: Rate movies on a 1-5 star scale
- **Rating History**: View all your past ratings
- **Remove Ratings**: Delete ratings you no longer want
- **Auto-save**: Ratings are saved automatically

### Recommendation Engine
- **Personalized Suggestions**: Get recommendations based on your taste
- **Hybrid Algorithm**: Combines content-based and collaborative filtering
- **Real-time Updates**: Recommendations update as you rate more movies
- **Multiple Sources**: Uses both movie content and user behavior

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Theme Picker**: Toggle between themes
- **Smooth Animations**: Framer Motion powered transitions
- **Modern UI**: Clean, professional interface

## ⚠️ Limitations

- **Data Source Size Impact**: The current implementation uses ~1,000 movies from TMDb's popular movies API. Larger datasets (10,000+ movies) would significantly improve recommendation accuracy by providing more diverse content vectors for TF-IDF analysis.

- **TF-IDF Match Accuracy**: The `tfidf_scores` variable represents the similarity scores between user preferences and movie content. Higher scores (closer to 1.0) indicate better matches, but accuracy depends heavily on the dataset size and quality of movie metadata (overview, genre, title).

- **Cold Start Problem**: New users with few ratings may receive less accurate recommendations until they rate more movies, as the system needs sufficient data to build reliable user profiles.

- **Genre Coverage**: Limited by TMDb dataset availability and movie metadata quality.

- **Real-time Updates**: Movie data is cached and requires manual refresh to get new releases.

- **Password Reset Functionality** - Email password reset was intentionally left out in lieu of a local way to reset for demonstration purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Sources

- **TMDb API**: Movie data and metadata
- **Scikit-learn**: Machine learning algorithms
- **React & Next.js**: Frontend framework
- **Flask**: Backend framework
