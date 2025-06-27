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

async function scrapeTextFromHtml(html: string): Promise<string> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    doc.querySelectorAll('script, style, head, nav, footer, header').forEach(el => el.remove());

    const body = doc.body;
    if (body) {
        const blocks = body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, blockquote, li, pre');
        const textChunks = Array.from(blocks).map(block => block.textContent?.trim() || '');
        const fullText = textChunks.filter(Boolean).join('\n\n');
        
        if (!fullText.trim()) {
            return body.textContent?.trim() || '';
        }
        return fullText;
    }
    return '';
}

/**
 * Fetches content from a direct URL, intended for web fallback results.
 * It can handle plain text and scrape HTML.
 * @param url The direct URL to the content.
 * @returns A promise that resolves to the string content.
 */
export async function fetchContentFromUrl(url: string): Promise<string> {
    const proxiedUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxiedUrl);

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status} for URL: ${url}`);
    }

    const contentType = res.headers.get('Content-Type') || '';

    if (contentType.includes('text/plain') || url.endsWith('.txt')) {
        return await res.text();
    }

    if (contentType.includes('text/html') || url.endsWith('.html') || url.endsWith('.htm')) {
        const html = await res.text();
        const text = await scrapeTextFromHtml(html);
        if (!text.trim()) {
            throw new Error("Could not extract any readable text from the provided HTML page.");
        }
        return text;
    }
    
    throw new Error(`Unsupported content type '${contentType}' or file extension. Cannot display this file in the reader.`);
}
