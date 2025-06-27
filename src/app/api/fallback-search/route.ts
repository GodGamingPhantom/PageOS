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
      title: `Alice's Adventures in Wonderland (PDF)`,
      link: `https://www.gutenberg.org/files/11/11-pdf.pdf`,
      snippet: `The complete book from Project Gutenberg in PDF format. This will open in a new tab.`,
    },
    {
      title: `Alice's Adventures in Wonderland (HTML)`,
      link: `https://www.gutenberg.org/files/11/11-h/11-h.htm`,
      snippet: `The complete book from Project Gutenberg in HTML format. This will open in the PageOS reader.`,
    },
    {
      title: `Alice's Adventures in Wonderland (TXT)`,
      link: `https://www.gutenberg.org/files/11/11-0.txt`,
      snippet: `The complete book from Project Gutenberg in plain text format. This will open in the PageOS reader.`,
    },
  ];

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return NextResponse.json({ results: mockResults });
  // --- END OF MOCK IMPLEMENTATION ---
}
