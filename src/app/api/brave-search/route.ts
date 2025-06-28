
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const braveQuery = `${query} ebook filetype:pdf OR filetype:txt`;
  const searchURL = `https://search.brave.com/search?q=${encodeURIComponent(braveQuery)}`;

  try {
    const res = await fetch(searchURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`Brave search failed with status: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const rawLinks = $('a[href]').map((i, el) => ({
      title: $(el).text().trim(),
      href: $(el).attr('href')?.trim(),
    })).get();

    const filtered = rawLinks
      .filter(l => l.href && /\.(pdf|txt)$/i.test(l.href))
      .map(l => ({
        title: l.title || 'Untitled',
        link: l.href!,
        type: l.href!.toLowerCase().endsWith('.pdf') ? 'pdf' : 'txt',
      }));

    const unique = Array.from(new Map(filtered.map(r => [r.link, r])).values());

    return NextResponse.json(unique.slice(0, 6));
  } catch (err) {
    console.error('Web Search Fallback error:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Web search failed', details: errorMessage }, { status: 500 });
  }
}
