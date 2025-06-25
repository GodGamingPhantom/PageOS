import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('search');
  const path = searchParams.get('path');

  if (!searchQuery && !path) {
    return NextResponse.json({ error: 'Either search or path parameter is required' }, { status: 400 });
  }

  let targetUrl: string;

  if (searchQuery) {
    targetUrl = `https://manybooks.net/search-book?search=${encodeURIComponent(searchQuery)}`;
  } else {
    // Ensure path is a valid relative path
    const cleanPath = path!.startsWith('/') ? path : `/${path}`;
    targetUrl = `https://manybooks.net${cleanPath}`;
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'PageOS/1.0.0 (Firebase Studio Integration)',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to fetch from ManyBooks: ${res.status} ${res.statusText}`, errorText);
      throw new Error(`Failed to fetch from ManyBooks: ${res.statusText}`);
    }

    const html = await res.text();
    // Return HTML content with appropriate content type
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('ManyBooks API proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch data from ManyBooks', details: errorMessage }, { status: 500 });
  }
}
