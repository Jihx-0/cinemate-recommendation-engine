# Cinemate 🎬

A sophisticated movie recommendation system that combines content-based and collaborative filtering to deliver personalized movie suggestions. 

Cinemate is a full-stack web application that helps users discover movies they'll love. Unlike simple recommendation systems, Cinemate uses advanced machine learning techniques to analyze both movie content and user behavior patterns, providing personalized recommendations.

### Version History
- v1.1.0 - Grafana/Prometheus Observability
- v1.0.0 - Initial Release - (main)

### Key Features

- **Personalized Recommendations**: AI-powered suggestions based on your unique taste
- **Content-Based Filtering**: Analyzes movie content using TF-IDF vectorization and cosine similarity
- **Collaborative Filtering**: Finds users with similar tastes and recommends what they enjoyed
- **Hybrid Approach**: Combines both algorithms for superior recommendation quality
- **Real-time Learning**: Gets smarter as you rate more movies
- **Modern UI/UX**: Responsive interface with smooth animations
- **Secure Authentication**: User accounts with password validation and session management
- **Production Monitoring**: Complete observability with Grafana dashboards and Prometheus metrics

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
- **Prometheus Client** - Metrics collection and monitoring

### Monitoring & Observability
- **Prometheus** - Metrics collection and time-series database
- **Grafana** - Visualization and dashboard platform
- **cAdvisor** - Container resource monitoring
- **Redis Exporter** - Cache performance metrics
- **Custom Metrics** - Application-specific performance tracking

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
   echo "FLASK_SECRET_KEY=your_secret_key_here" >> .env
   ```
   
   **Important**: 
   - Replace `your_api_key_here` with your actual TMDb API key from [themoviedb.org](https://www.themoviedb.org/settings/api)
   - Replace `your_secret_key_here` with a random 32-character string (or use: `openssl rand -hex 32`)

3. **Start the application**
   ```bash
   # Make sure Docker Desktop is running, then:
   docker-compose up --build
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Access monitoring dashboards** (optional)
   - **Grafana Dashboard**: [http://localhost:3001](http://localhost:3001) (admin/admin)
   - **Public Dashboard**: [http://localhost:3001/public-dashboards/cinemate-public-token](http://localhost:3001/public-dashboards/cinemate-public-token)
   - **Prometheus Metrics**: [http://localhost:9090](http://localhost:9090)

## 🐳 Docker Setup

Cinemate is designed to run in Docker containers for consistent deployment across environments.

### Docker Services

- **Backend**: Flask ML service with health checks and metrics
- **Frontend**: React app with hot reloading
- **Database**: SQLite database
- **Redis**: Caching and session storage
- **Prometheus**: Metrics collection and storage
- **Grafana**: Monitoring dashboards and visualization
- **cAdvisor**: Container resource monitoring
- **Redis Exporter**: Cache performance metrics

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
- **Grafana Dashboard**: http://localhost:3001 (admin/admin)
- **Prometheus Metrics**: http://localhost:9090
- **Public Dashboard**: http://localhost:3001/public-dashboards/cinemate-public-token

## 📁 Project Structure

```
Cinemate/
├── frontend/                # React/Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # Utilities and API clients
│   │   └── providers/       # React context providers
│   └── package.json
├── backend/                 # Flask backend
│   ├── app.py               # Main Flask application
│   ├── user_system.py       # User management & ML algorithms
│   ├── tmdb_client.py       # TMDb API integration
│   └── requirements.txt
├── grafana/                 # Grafana configuration
│   ├── dashboards/          # Dashboard definitions
│   └── provisioning/        # Data sources and dashboard provisioning
├── prometheus.yml           # Prometheus configuration
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

### Monitoring & Observability
- **Real-time Metrics**: Track API performance, response times, and error rates
- **ML Algorithm Monitoring**: Monitor recommendation generation times and accuracy
- **User Activity Tracking**: Track user registrations, ratings, and engagement
- **Container Resource Monitoring**: CPU, memory, and network usage
- **Cache Performance**: Redis hit rates and performance metrics
- **Custom Dashboards**: Pre-built Grafana dashboards for comprehensive monitoring
- **Public Dashboard Access**: Share monitoring data without authentication

## 📊 Monitoring & Observability

Cinemate includes a comprehensive monitoring stack built with industry-standard tools:

### What's Monitored

- **API Performance**: Request counts, response times, error rates
- **ML Algorithm Performance**: Recommendation generation times for both content-based and collaborative filtering
- **User Activity**: Registrations, ratings, searches, active users
- **System Resources**: CPU, memory, disk usage, network I/O
- **Cache Performance**: Redis hit rates, connection counts, memory usage
- **Database Operations**: Query performance and operation counts

### Monitoring Stack

- **Prometheus**: Collects and stores metrics from all services
- **Grafana**: Provides beautiful dashboards and visualizations
- **cAdvisor**: Monitors container resource usage
- **Redis Exporter**: Tracks cache performance metrics
- **Custom Metrics**: Application-specific performance tracking

### Dashboard Features

- **Real-time Monitoring**: Live updates of all metrics
- **Historical Analysis**: Trend analysis and performance over time
- **Alerting Ready**: Built-in support for Prometheus alerting rules
- **Public Access**: Share monitoring data without authentication
- **Mobile Responsive**: Dashboards work on all devices

### Accessing Monitoring

1. **Grafana Dashboard**: http://localhost:3001 (admin/admin)
2. **Public Dashboard**: http://localhost:3001/public-dashboards/cinemate-public-token
3. **Prometheus UI**: http://localhost:9090
4. **Raw Metrics**: http://localhost:5000/metrics (backend metrics)

### Troubleshooting

**Common Issues:**

1. **Port conflicts**: If you get "port already in use" errors, make sure no other services are running on ports 3000, 3001, 5000, 6379, 8080, 9090, or 9121.

2. **Docker not running**: Make sure Docker Desktop is running before executing `docker-compose up --build`.

3. **Environment variables**: Ensure your `.env` file is in the project root and contains valid values for `TMDB_API_KEY` and `FLASK_SECRET_KEY`.

4. **Slow startup**: First-time startup may take 2-3 minutes as Docker downloads images and builds containers.

**Useful Commands:**
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Restart services
docker-compose restart

# Clean restart (removes volumes)
docker-compose down -v && docker-compose up --build
```

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

You may view and use the code for personal or educational purposes only.  
Commercial use is prohibited without explicit written permission from the author.

## 🙏 Sources

- **TMDb API**: Movie data and metadata
- **Scikit-learn**: Machine learning algorithms
- **React & Next.js**: Frontend framework
- **Flask**: Backend framework
- **Prometheus**: Metrics collection and monitoring
- **Grafana**: Dashboard and visualization platform
- **cAdvisor**: Container monitoring
- **Redis**: Caching and session storage
