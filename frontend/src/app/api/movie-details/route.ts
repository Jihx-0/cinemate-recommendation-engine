import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: 'Movie IDs are required' }, { status: 400 });
    }

    const response = await fetch(`http://backend:5000/api/movie-details?ids=${ids}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Clean any potential NaN values that might slip through
    const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
      if (typeof value === 'number' && isNaN(value)) {
        return null;
      }
      return value;
    }));
    
    return NextResponse.json(cleanData);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    );
  }
} 