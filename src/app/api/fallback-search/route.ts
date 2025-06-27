
// src/app/api/fallback-search/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * THIS IS A MOCK API ENDPOINT.
 * In a real-world scenario, you would replace this mock data with a call
 * to an external web search API like SerpAPI, Google Search API, or Bing Search API.
 * This has been modified to return an empty array to allow for proper testing
 * of the primary data sources and the "no results" UI.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  // --- START OF MOCK IMPLEMENTATION ---
  // This now returns an empty array to prevent incorrect results from showing up
  // and interfering with the primary source adapters.
  const mockResults: any[] = [];
  
  // To test the fallback UI, you could temporarily enable a mock result
  // for a specific query, like this:
  // if (query.toLowerCase().includes('alice')) {
  //   mockResults.push({
  //     title: `Alice's Adventures in Wonderland (HTML)`,
  //     link: `https://www.gutenberg.org/files/11/11-h/11-h.htm`,
  //     snippet: `The complete book from Project Gutenberg in HTML format. This will open in the PageOS reader.`,
  //   });
  // }


  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json({ results: mockResults });
  // --- END OF MOCK IMPLEMENTATION ---
}
