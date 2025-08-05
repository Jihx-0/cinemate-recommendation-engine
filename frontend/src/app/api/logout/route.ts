import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Forward cookies from the request to the backend
    const cookieHeader = request.headers.get('cookie');
    
    const response = await fetch('http://localhost:5001/logout', {
      method: 'POST',
      headers: {
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      credentials: 'include',
    });

    const data = await response.json();
    
    const nextResponse = NextResponse.json(data, { status: response.status });
    
    // Copy cookies from backend response to frontend response
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('set-cookie', setCookieHeader);
    }
    
    return nextResponse;
  } catch (error) {
    console.error('Logout proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 