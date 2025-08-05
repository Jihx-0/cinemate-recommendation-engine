# TMDb API Setup Guide

## 🎬 Getting Your TMDb API Key

### Step 1: Create a TMDb Account
1. Go to [The Movie Database (TMDb)](https://www.themoviedb.org/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Request an API Key
1. Log in to your TMDb account
2. Go to your [Account Settings](https://www.themoviedb.org/settings/api)
3. Click on "API" in the left sidebar
4. Fill out the API request form:
   - **Application Name**: MoviePicks (or your preferred name)
   - **Application URL**: `http://localhost:5000` (for development)
   - **Application Summary**: "AI-powered movie recommendation engine"
   - **Application Purpose**: "Personal project for learning ML and web development"
5. Accept the terms and submit

### Step 3: Get Your API Key
1. After approval (usually instant), you'll receive an email with your API key
2. Copy the API key (it looks like: `1234567890abcdef1234567890abcdef`)

## 🔧 Setting Up the API Key

### Option 1: Environment Variable (Recommended)
```bash
# On macOS/Linux
export TMDB_API_KEY="your_api_key_here"

# On Windows
set TMDB_API_KEY=your_api_key_here
```

### Option 2: .env File
1. Create a `.env` file in your project root:
```env
TMDB_API_KEY=your_api_key_here
FLASK_SECRET_KEY=your_secret_key_here
FLASK_ENV=development
```

2. Install python-dotenv (already in requirements.txt):
```bash
pip install python-dotenv
```

3. Update `app.py` to load the .env file:
```python
from dotenv import load_dotenv
load_dotenv()
```

### Option 3: Direct in Code (Not Recommended for Production)
```python
# In tmdb_client.py
tmdb_client = TMDBClient(api_key="your_api_key_here")
```

## 🚀 Testing the Integration

1. Start the application:
```bash
python app.py
```

2. Visit `http://localhost:5000/rate`
3. You should see real movie posters and data from TMDb!

## 📊 What You Get with TMDb

- **Real Movie Data**: Thousands of current and classic movies
- **Movie Posters**: High-quality poster images
- **Detailed Information**: Ratings, release dates, genres, cast
- **Search Functionality**: Search for any movie
- **Popular Movies**: Current trending movies
- **Backdrop Images**: Beautiful background images

## 🔒 API Limits

- **Free Tier**: 1,000 requests per day
- **Rate Limiting**: 40 requests per 10 seconds
- **Perfect for**: Development, personal projects, small applications

## 🛠️ Troubleshooting

### "No TMDb API key found" Warning
- Make sure you've set the environment variable correctly
- Check that the API key is valid
- The app will fall back to sample data if no key is provided

### "Error fetching popular movies"
- Check your internet connection
- Verify your API key is correct
- Check if you've exceeded the daily limit

### Images not loading
- TMDb image URLs are public and should work
- Check if the poster_path is None (some movies don't have posters)

## 🎯 Next Steps

Once TMDb is working, you can enhance the app with:
- Movie search functionality
- Detailed movie pages
- Cast and crew information
- Trailers and videos
- Similar movies from TMDb
- User reviews and ratings

## 📞 Support

- **TMDb API Documentation**: https://developers.themoviedb.org/3
- **TMDb Community**: https://www.themoviedb.org/talk
- **API Status**: https://status.themoviedb.org/ 