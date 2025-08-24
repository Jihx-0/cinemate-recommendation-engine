import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const cookieHeader = request.headers.get('cookie');
    
    const response = await fetch('http://backend:5000/api/remove-rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Remove rating error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 