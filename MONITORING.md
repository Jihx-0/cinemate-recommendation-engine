# Cinemate Monitoring Setup

This document provides detailed information about the Grafana and Prometheus monitoring setup for the Cinemate recommendation engine.

> **Note**: For basic setup instructions, see the main [README.md](README.md). This document provides detailed technical information for advanced users and developers.

## Overview

The monitoring stack includes:
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Redis Exporter**: Redis metrics
- **cAdvisor**: Container metrics

## Services and Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js application |
| Backend | 5000 | Flask API with metrics |
| Prometheus | 9090 | Metrics collection |
| Grafana | 3001 | Monitoring dashboard |
| Redis Exporter | 9121 | Redis metrics |
| cAdvisor | 8080 | Container metrics |

## Quick Start

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the applications:**
   - **Cinemate App**: http://localhost:3000
   - **Grafana Dashboard**: http://localhost:3001 (admin/admin)
   - **Prometheus**: http://localhost:9090

3. **View metrics:**
   - Backend metrics: http://localhost:5000/metrics

## Grafana Dashboard

The dashboard includes the following panels:

### Application Metrics
- **Request Rate**: API request frequency by endpoint
- **Request Duration**: 95th and 50th percentile response times
- **Recommendation Generation Duration**: ML algorithm performance
- **Recommendation Generation Rate**: Recommendations per second by algorithm

### Business Metrics
- **User Rating Submission Rate**: How often users rate movies
- **Movie Search Rate**: Search frequency
- **Active Users**: Current active user count
- **Database Operations Rate**: Database activity by operation type

### System Metrics
- **Container CPU Usage**: Resource utilization per container

## Custom Metrics

### Backend Metrics (Flask)

The Flask backend exposes the following Prometheus metrics:

```python
# Request metrics
cinemate_requests_total{method, endpoint, status}
cinemate_request_duration_seconds{method, endpoint}

# ML algorithm metrics
cinemate_recommendation_duration_seconds{algorithm}
cinemate_recommendations_total{algorithm}

# Business metrics
cinemate_user_ratings_total
cinemate_movie_searches_total
cinemate_active_users

# Database metrics
cinemate_database_operations_total{operation}
```

### Frontend Metrics (Next.js)

The frontend metrics are collected through the backend API calls and user interactions, which are tracked in the backend metrics above.

## Monitoring Key Performance Indicators

### ML Algorithm Performance
- **Content-based filtering duration**: Should be < 2 seconds
- **Collaborative filtering duration**: Should be < 1 second
- **Recommendation accuracy**: Track user engagement with recommendations

### System Performance
- **API response times**: 95th percentile < 500ms
- **Error rates**: < 1% of total requests
- **Resource utilization**: CPU < 80%, Memory < 85%

### Business Metrics
- **User engagement**: Track rating submission rates
- **Search effectiveness**: Monitor search-to-rating conversion
- **Recommendation quality**: Track recommendation click-through rates

## Troubleshooting

### Common Issues

1. **Prometheus can't scrape metrics:**
   - Check if backend is running: `curl http://localhost:5000/health`
   - Verify metrics endpoint: `curl http://localhost:5000/metrics`

2. **Grafana dashboard not loading:**
   - Check Prometheus connection in Grafana datasource settings
   - Verify Prometheus is accessible from Grafana container

3. **Missing metrics:**
   - Ensure backend is generating traffic
   - Check Prometheus targets page: http://localhost:9090/targets

### Useful Commands

```bash
# Check all services status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Restart monitoring services
docker-compose restart prometheus grafana

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets
```

## Configuration Files

- `prometheus.yml`: Prometheus configuration
- `grafana/provisioning/`: Grafana datasource and dashboard provisioning
- `grafana/dashboards/cinemate-dashboard.json`: Main dashboard definition


