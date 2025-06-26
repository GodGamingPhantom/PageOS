import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_DOMAINS = [
  'www.gutenberg.org',
  'standardebooks.org',
  'openlibrary.org',
  'en.wikisource.org',
  'gutendex.com',
  'manybooks.net',
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrlString = searchParams.get('url');

  if (!targetUrlString) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const targetUrl = new URL(targetUrlString);

    if (!ALLOWED_DOMAINS.includes(targetUrl.hostname)) {
      console.error(`Domain not allowed: ${targetUrl.hostname}`);
      return NextResponse.json({ error: 'Domain is not allowed' }, { status: 403 });
    }
    
    const headers = new Headers();
    headers.set('User-Agent', 'PageOS/1.0.0 (Firebase Studio Integration)');
    
    const res = await fetch(targetUrl.toString(), { headers });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to fetch from proxied URL: ${res.status} ${res.statusText}`, errorText);
      return NextResponse.json({ error: `Failed to fetch from proxied URL: ${res.statusText}` }, { status: res.status });
    }

    const contentType = res.headers.get('Content-Type') || 'application/octet-stream';
    const body = await res.blob();
    
    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to proxy request', details: errorMessage }, { status: 500 });
  }
}
