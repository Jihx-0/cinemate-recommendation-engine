# Cinemate

I created Cinemate because I was tired of spending hours scrolling through streaming services, trying to find something to watch. I wanted a recommendation system that actually understood my taste in movies, so I created this full-stack web app that combines machine learning with a clean, modern interface.

<img width="1010" height="495" alt="image" src="https://github.com/user-attachments/assets/d08c051d-5c81-43e0-9a58-ecbfcb899ac1" />
<img width="1009" height="660" alt="image" src="https://github.com/user-attachments/assets/31e41702-269a-4c3f-a5c2-76eb676c63c4" />
<img width="1287" height="610" alt="image" src="https://github.com/user-attachments/assets/2b48f464-4a92-4852-8f78-79e0d1470b03" />
<img width="1437" height="325" alt="image" src="https://github.com/user-attachments/assets/ea9b91c1-0d60-455d-9036-33b8053c2d43" />

## The Problem

Movie recommendations are usually pretty terrible, and don't account for your personal taste. Most streaming services just show you what's popular or what they want to promote. I wanted something that actually learned from my preferences and could find hidden gems I'd actually enjoy.

## How It Works

**Content-Based Filtering**: The system analyzes movie content (genres, descriptions, titles) using TF-IDF vectorization to find movies similar to ones you've liked.

**Collaborative Filtering**: It looks at other users with similar taste and recommends movies they enjoyed that you haven't seen yet.

**Hybrid Approach**: I combined both methods - 60% content-based, 40% collaborative - which gives much better results than either alone.

## Key Features

- **Smart Recommendations**: Gets better as you rate more movies
- **Clean UI**: Responsive design that works on all devices
- **User Accounts**: Secure login with session management
- **Real-time Learning**: Recommendations update instantly
- **Production Monitoring**: Complete observability with Grafana dashboards and Prometheus metrics
- **Docker Setup**: Easy deployment with docker-compose

## Getting Started

1. Clone the repo
2. Get a free TMDb API key from themoviedb.org
3. Create a .env file in the project root directory:
   ```bash
   # Create .env file with your API keys:
   echo "TMDB_API_KEY=your_api_key_here" > .env
   echo "FLASK_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')" >> .env
   ```
4. Add your API key to the .env file if you created the file manually
5. Run `docker-compose up --build`
6. Open http://localhost:3000

**Access Points**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Grafana Dashboard: http://localhost:3001 (admin/admin)
- Prometheus Metrics: http://localhost:9090

## Tech Stack

**Frontend**: 
- React 19.1.0 with Next.js 15.4.5 (App Router)
- TypeScript 5 for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- React Query (TanStack Query) for server state management
- Headless UI for accessible components

**Backend**: 
- Python 3.8+ with Flask 2.3.3
- Pandas for data manipulation
- Scikit-learn for ML algorithms (TF-IDF, cosine similarity)
- SQLite for data storage
- TMDb API for movie data
- Flask-CORS for cross-origin requests

**Infrastructure & Monitoring**:
- Docker & Docker Compose for containerization
- Prometheus for metrics collection
- Grafana for dashboards and visualization
- Redis for caching and session storage
- cAdvisor for container monitoring

## API Examples

Here are some curl examples to interact with the API:

**Register a new user:**
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

**Rate a movie:**
```bash
curl -X POST http://localhost:5000/rate \
  -H "Content-Type: application/json" \
  -H "Authorization: Api-Key YOUR_API_KEY" \
  -d '{"movie_id": 550, "rating": 4}'
```

**Get recommendations:**
```bash
curl -X GET http://localhost:5000/recommendations \
  -H "Authorization: Api-Key YOUR_API_KEY"
```

**Search movies:**
```bash
curl -X GET "http://localhost:5000/search?query=inception" \
  -H "Authorization: Api-Key YOUR_API_KEY"
```

**Get user's rating history:**
```bash
curl -X GET http://localhost:5000/ratings \
  -H "Authorization: Api-Key YOUR_API_KEY"
```

## Prometheus Metrics

The application exposes several metrics for monitoring:

**View all metrics:**
```bash
curl http://localhost:5000/metrics
```

**Key metrics to monitor:**
- `http_requests_total` - Total number of HTTP requests
- `http_request_duration_seconds` - Request duration histogram
- `recommendation_generation_duration_seconds` - ML algorithm performance
- `user_ratings_total` - Total number of movie ratings
- `active_users_gauge` - Currently active users
- `cache_hits_total` - Redis cache hit rate

**Query specific metrics:**
```bash
# Get request rate
curl "http://localhost:9090/api/v1/query?query=rate(http_requests_total[5m])"

# Get recommendation generation time
curl "http://localhost:9090/api/v1/query?query=histogram_quantile(0.95, http_request_duration_seconds_bucket)"

# Get cache hit ratio
curl "http://localhost:9090/api/v1/query?query=rate(cache_hits_total[5m]) / rate(cache_requests_total[5m])"
```

## What I Learned

Building this taught me a lot about machine learning in practice. The biggest challenge was handling the "cold start" problem - new users with no ratings get poor recommendations until they rate enough movies. I solved this by implementing fallback mechanisms and using movie popularity as a starting point.

I also learned that monitoring is crucial for ML applications. I added Prometheus and Grafana to track recommendation accuracy, API performance, and user engagement metrics.

## Current Limitations

- Uses about 1,000 movies from TMDb's popular movies API (more would improve accuracy)
- New users need to rate several movies before recommendations get good
- Movie data is cached, so new releases don't appear immediately

## Version History
- v1.1.0 - Added monitoring with Grafana/Prometheus
- v1.0.0 - Initial release with core recommendation engine
