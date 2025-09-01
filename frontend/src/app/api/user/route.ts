import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    
    const response = await fetch('http://backend:5000/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    // Handle 401 (Not authenticated) gracefully
    if (response.status === 401) {
      return NextResponse.json(null);
    }
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const nextResponse = NextResponse.json(data);
    
    // Copy cookies from backend response to frontend response
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('set-cookie', setCookieHeader);
    }
    
    return nextResponse;
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
} 