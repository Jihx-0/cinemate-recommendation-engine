# Lumora - Modern AI-Powered Movie Recommendation Engine

A cutting-edge movie recommendation platform built with **React + Next.js + TypeScript** frontend and **Python Flask** backend, featuring advanced AI/ML algorithms for personalized movie suggestions.

![Lumora](https://img.shields.io/badge/Lumora-AI%20Powered%20Movie%20Recommendations-purple)
![React](https://img.shields.io/badge/React-18.0+-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.0+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![Flask](https://img.shields.io/badge/Flask-2.3+-lightgrey)

## 🚀 Modern Tech Stack

### Frontend (React + Next.js)
- **React 18** with modern hooks and functional components
- **Next.js 15** with App Router for optimal performance
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** for modern, responsive design
- **Framer Motion** for smooth animations
- **React Query (TanStack Query)** for efficient data fetching and caching
- **Lucide React** for beautiful icons
- **Headless UI** for accessible components

### Backend (Python Flask)
- **Flask** with RESTful API design
- **Pandas** for data manipulation
- **Scikit-learn** for machine learning algorithms
- **SQLite** for data persistence
- **TMDb API** integration for real movie data
- **CORS** support for cross-origin requests

### AI/ML Features
- **Content-based filtering** using TF-IDF vectorization
- **Collaborative filtering** with user similarity
- **Hybrid recommendations** combining multiple approaches
- **Real-time personalization** based on user ratings

## ✨ Features

### 🎯 Modern User Experience
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion powered transitions
- **Real-time Updates** - Instant feedback and loading states
- **Progressive Web App** - Fast, reliable, and engaging

### 🧠 AI-Powered Recommendations
- **Personalized Suggestions** - Based on your unique taste
- **Multiple Algorithms** - Content-based, collaborative, and hybrid filtering
- **Smart Learning** - Gets better with every rating
- **Real Movie Data** - Powered by TMDb API

### 👤 User Management
- **Secure Authentication** - User registration and login
- **Profile Management** - Track your movie history and preferences
- **Rating System** - Rate movies with interactive star ratings
- **Recommendation History** - See what you've been recommended

### 🎬 Movie Discovery
- **Popular Movies** - Trending films on the homepage
- **Detailed Information** - Posters, ratings, genres, and descriptions
- **Search & Filter** - Find movies by various criteria
- **Share Recommendations** - Share your favorite discoveries

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js 18+** and **npm**
- **Python 3.8+** and **pip**
- **TMDb API Key** (free at [themoviedb.org](https://www.themoviedb.org/settings/api))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Lumora
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in the root directory
   echo "TMDB_API_KEY=your_tmdb_api_key_here" > .env
   echo "FLASK_SECRET_KEY=your_secret_key_here" >> .env
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

### Manual Setup

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## 📁 Project Structure

```
Lumora/
├── frontend/                 # React + Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable React components
│   │   │   ├── ui/         # Base UI components
│   │   │   └── ...         # Feature components
│   │   ├── lib/            # Utilities and API client
│   │   └── providers/      # React context providers
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Python Flask backend
│   ├── app.py              # Main Flask application
│   ├── tmdb_client.py      # TMDb API integration
│   ├── user_system.py      # User management and ML
│   └── requirements.txt
├── package.json            # Root package.json for scripts
└── README.md
```

## 🎨 Modern UI Components

### Design System
- **Consistent Color Palette** - Purple and blue gradient theme
- **Typography** - Inter font for modern readability
- **Spacing** - Consistent spacing using Tailwind's design tokens
- **Components** - Reusable, accessible UI components

### Key Components
- **MovieCard** - Responsive movie display with ratings
- **Navigation** - Modern navbar with user menu
- **StarRating** - Interactive rating component
- **Button** - Multiple variants and sizes
- **Card** - Flexible content containers

## 🔧 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `GET /user` - Get current user

### Movies
- `GET /api/popular-movies` - Get popular movies for homepage
- `GET /api/rate-movies` - Get movies for rating
- `POST /api/submit-ratings` - Submit user ratings

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations
- `GET /api/profile` - Get user profile
- `GET /api/user-stats` - Get user statistics
- `GET /api/rating-history` - Get user rating history

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the .next folder
```

### Backend (Render/Railway)
```bash
cd backend
# Deploy with requirements.txt and app.py
```

### Environment Variables
Set these in your deployment platform:
- `TMDB_API_KEY` - Your TMDb API key
- `FLASK_SECRET_KEY` - Secure secret key for sessions
- `NEXT_PUBLIC_API_URL` - Your backend API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TMDb** for providing the movie database API
- **Next.js** team for the amazing React framework
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **React Query** for efficient data management

---

**Lumora** - Discover your next favorite movie with AI-powered recommendations! 🎬✨ 