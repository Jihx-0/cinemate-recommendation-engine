import { NextRequest, NextResponse } from 'next/server';

// Simple metrics collection for frontend
let metrics = {
  pageViews: 0,
  apiCalls: 0,
  errors: 0,
  lastUpdated: new Date().toISOString()
};

export async function GET() {
  try {
    // Return current metrics
    return NextResponse.json({
      ...metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, value = 1 } = body;

    // Update metrics based on type
    switch (type) {
      case 'page_view':
        metrics.pageViews += value;
        break;
      case 'api_call':
        metrics.apiCalls += value;
        break;
      case 'error':
        metrics.errors += value;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid metric type' },
          { status: 400 }
        );
    }

    metrics.lastUpdated = new Date().toISOString();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update metrics' },
      { status: 500 }
    );
  }
}
