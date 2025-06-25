
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const apiUrl = `https://standardebooks.org/api/v1/ebooks/?title__icontains=${encodeURIComponent(query)}`;
    const res = await fetch(apiUrl, {
        headers: {
            'User-Agent': 'PageOS/1.0.0',
        }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to fetch from Standard Ebooks: ${res.status} ${res.statusText}`, errorText);
      throw new Error(`Failed to fetch from Standard Ebooks: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Standard Ebooks API proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch data from Standard Ebooks API', details: errorMessage }, { status: 500 });
  }
}
