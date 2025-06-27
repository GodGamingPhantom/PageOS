// src/app/api/fallback-search/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * THIS IS A MOCK API ENDPOINT.
 * In a real-world scenario, you would replace the mock data with a call
 * to an external web search API like SerpAPI, Google Search API, or Bing Search API.
 * This involves:
 * 1. Getting an API key from the search provider.
 * 2. Storing it securely as an environment variable (e.g., in a .env.local file).
 * 3. Using `fetch` to call the provider's API endpoint with the query and API key.
 * 4. Parsing the response and returning it as JSON.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  // --- START OF MOCK IMPLEMENTATION ---
  // In a real implementation, you would remove this and call a real search API.

  const mockResults = [
    {
      title: `"${query}" Full Text - Project Gutenberg`,
      link: `https://www.gutenberg.org/files/11/11-h/11-h.htm`, // Example HTML link
      snippet: `The full text of ${query}, provided by Project Gutenberg. Available in HTML, EPUB, and other formats.`,
    },
    {
      title: `[PDF] ${query} - Example University`,
      link: `https://example.edu/hosting/${query.replace(/\s+/g, '_')}.pdf`, // Example PDF link
      snippet: `An academic PDF version of ${query}. For research and educational purposes.`,
    },
    {
      title: `${query} (.txt) - The Internet Archive`,
      link: `https://archive.org/stream/some_book/data.txt`, // Example TXT link
      snippet: `Plain text version of ${query} hosted on The Internet Archive.`,
    },
    {
      title: `Buy ${query} - Amazon`,
      link: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`, // Example of a non-book link to be filtered out
      snippet: `This link should be filtered out by the adapter as it is not a direct content link.`,
    },
  ];

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return NextResponse.json({ results: mockResults });
  // --- END OF MOCK IMPLEMENTATION ---
}
