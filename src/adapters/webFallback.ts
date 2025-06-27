// src/adapters/webFallback.ts
'use client';

export type WebFallbackResult = {
  title: string;
  url: string;
  filetype: 'txt' | 'pdf' | 'html' | 'other';
  snippet: string;
};

function getFileType(url: string): WebFallbackResult['filetype'] {
  const lowercasedUrl = url.toLowerCase();
  if (lowercasedUrl.endsWith('.txt')) return 'txt';
  if (lowercasedUrl.endsWith('.pdf')) return 'pdf';
  if (lowercasedUrl.endsWith('.html') || lowercasedUrl.endsWith('.htm')) return 'html';
  return 'other';
}

/**
 * Calls our internal API to perform a web search and returns potential book links.
 * @param query The user's search query (e.g., "Pride and Prejudice").
 * @returns A promise that resolves to an array of structured fallback results.
 */
export async function fetchWebFallback(query: string): Promise<WebFallbackResult[]> {
  try {
    const res = await fetch(`/api/fallback-search?query=${encodeURIComponent(query)}`);
    if (!res.ok) {
      console.error('Fallback search API request failed:', res.statusText);
      return [];
    }
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
        return [];
    }

    // Filter and map the results
    return data.results
      .map((item: any) => ({
        title: item.title || 'Untitled',
        url: item.link || '',
        filetype: getFileType(item.link || ''),
        snippet: item.snippet || 'No description available.',
      }))
      .filter((item: WebFallbackResult) => item.filetype !== 'other' && item.url);

  } catch (error) {
    console.error('Error fetching web fallback results:', error);
    return [];
  }
}
