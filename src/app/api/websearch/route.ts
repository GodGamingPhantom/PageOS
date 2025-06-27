// src/app/api/websearch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  // Craft a query more likely to yield direct file links
  const query = encodeURIComponent(`${q} ebook free filetype:pdf OR filetype:txt`);
  const searchUrl = `https://www.bing.com/search?q=${query}`;
  
  try {
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 PageOS/1.0.0',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) {
        throw new Error(`Bing search failed with status: ${res.status}`);
    }

    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const results = Array.from(doc.querySelectorAll('li.b_algo')).slice(0, 6).map(el => {
      const linkEl = el.querySelector('h2 a');
      const link = linkEl?.getAttribute('href');
      const title = linkEl?.textContent;

      if (link && title && (link.endsWith('.pdf') || link.endsWith('.txt') || link.endsWith('.html'))) {
        return { title, link };
      }
      return null;
    }).filter((r): r is { title: string; link: string } => r !== null);
    
    return NextResponse.json(results);

  } catch(error) {
    console.error("Error during Bing search scraping:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: 'Failed to scrape Bing results', details: errorMessage }, { status: 500 });
  }
}
