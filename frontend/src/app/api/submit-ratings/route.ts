import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const cookieHeader = request.headers.get('cookie');
    
    const response = await fetch('http://backend:5000/api/submit-ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error submitting ratings:', error);
    return NextResponse.json(
      { error: 'Failed to submit ratings' },
      { status: 500 }
    );
  }
} 