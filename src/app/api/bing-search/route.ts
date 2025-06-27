// src/app/api/bing-search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  // Construct a more targeted search query
  const searchString = `${query} full book filetype:pdf OR filetype:txt OR filetype:html`;
  const searchURL = `https://www.bing.com/search?q=${encodeURIComponent(searchString)}`;

  try {
    const response = await fetch(searchURL, {
      headers: {
        // A realistic User-Agent is important to avoid being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Bing search failed with status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const links: { title: string; url: string, snippet: string }[] = [];

    // This selector targets the main search result items in Bing's HTML structure.
    // This may need updates if Bing changes its layout.
    $('li.b_algo').each((_, el) => {
      const linkElement = $(el).find('h2 a');
      const url = linkElement.attr('href');
      const title = linkElement.text();
      const snippet = $(el).find('.b_caption p').text();

      // Ensure we have a URL and title, and that the URL is absolute
      if (url && title && (url.startsWith('http://') || url.startsWith('https://'))) {
        // We look for filetypes in the URL to prioritize direct downloads
        const lowerUrl = url.toLowerCase();
        if (/\.(pdf|txt|html|htm)$/.test(lowerUrl) || !lowerUrl.includes('.')) {
          links.push({ title, url, snippet });
        }
      }
    });

    // Limit to top 10 results to keep it relevant
    const topResults = links.slice(0, 10);

    return NextResponse.json({ results: topResults });

  } catch (error) {
    console.error("Error during Bing search scraping:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: 'Failed to scrape Bing results', details: errorMessage }, { status: 500 });
  }
}
