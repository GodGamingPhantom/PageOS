
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
    const res = await fetch(braveURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 PageOS/1.0.0',
        'Accept-Language': 'en-US,en;q=0.9',
      },
       signal: AbortSignal.timeout(10000) // 10-second timeout
    });

    if (!res.ok) {
        throw new Error(`Brave search failed with status: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Use a more specific and robust selector to find the result links
    const results = $('li.b_algo h2 a').map((i, el) => {
        const href = $(el).attr('href');
        const title = $(el).text();
        if (href && (href.includes('.pdf') || href.includes('.txt'))) {
            return {
                title,
                link: href,
                type: href.endsWith('.pdf') ? 'pdf' : 'txt',
            };
        }
        return null;
    }).get();

    return NextResponse.json(results.slice(0, 5)); // Return top 5 results

  } catch(error) {
    console.error("Error during Brave search scraping:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: 'Failed to scrape Brave results', details: errorMessage }, { status: 500 });
  }
}
