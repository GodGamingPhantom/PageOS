
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

function makeBraveSearchURL(query: string) {
  // This query is crafted to find free, full-text ebooks in PDF or TXT format.
  const finalQuery = `${query} ebook free filetype:pdf OR filetype:txt`;
  return `https://search.brave.com/search?q=${encodeURIComponent(finalQuery)}&source=web`;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ error: 'Query missing' }, { status: 400 });
  }

  try {
    const braveURL = makeBraveSearchURL(query);
    console.log(`[Brave Search] Fetching URL: ${braveURL}`);

    const res = await fetch(braveURL, {
      headers: {
        // Using a standard browser User-Agent to avoid being blocked.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
       signal: AbortSignal.timeout(10000) // 10-second timeout
    });

    if (!res.ok) {
      console.error(`[Brave Search] Fetch failed with status: ${res.status}`);
      throw new Error(`Brave search failed with status: ${res.status}`);
    }
    
    console.log(`[Brave Search] Fetch successful with status: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // CORRECTED: This selector is designed for Brave's search result structure.
    const allFoundLinks = $('a[href^="http"]').map((i, el) => {
        return {
            title: $(el).text().trim(),
            href: $(el).attr('href'),
        };
    }).get();

    console.log(`[Brave Search] Found ${allFoundLinks.length} total potential links from selector 'a[href^="http"]'.`);

    const results = allFoundLinks.filter(link => 
        link.href && (link.href.toLowerCase().endsWith('.pdf') || link.href.toLowerCase().endsWith('.txt'))
    ).map(link => ({
        title: link.title,
        link: link.href!,
        type: link.href!.toLowerCase().endsWith('.pdf') ? 'pdf' : 'txt',
    }));
    
    console.log(`[Brave Search] Found ${results.length} valid PDF/TXT links after filtering.`);

    // Return the first 5 valid results.
    return NextResponse.json(results.slice(0, 5));

  } catch(error) {
    console.error("[Brave Search] An error occurred in the search route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: 'Failed to scrape Brave results', details: errorMessage }, { status: 500 });
  }
}
