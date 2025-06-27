// src/adapters/webFallback.ts
'use client';

export type WebFallbackResult = {
  title: string;
  url: string;
  filetype: 'txt' | 'pdf' | 'html' | 'other';
  snippet: string;
};

function getFileType(url: string): WebFallbackResult['filetype'] {
  if (!url) return 'other';
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
    const res = await fetch(`/api/bing-search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      console.error('Fallback search API request failed:', res.statusText);
      return [];
    }
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
        return [];
    }

    // Filter and map the results from the Bing search
    return data.results
      .map((item: any) => ({
        title: item.title || 'Untitled',
        url: item.url || '',
        filetype: getFileType(item.url || ''),
        snippet: item.snippet || `An external link to ${item.url}`,
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
    
    // Remove non-content tags
    doc.querySelectorAll('script, style, head, nav, footer, header, aside, form, iframe, noscript').forEach(el => el.remove());

    const body = doc.body;
    if (body) {
        // A simple heuristic: find a main content container or use the body
        const mainContent = body.querySelector('article, main, .main, #main, .content, #content') || body;
        
        const blocks = mainContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6, blockquote, li, pre');
        
        let textChunks: string[];

        // If we found specific blocks, use them. Otherwise, fall back to splitting text by newlines.
        if (blocks.length > 0) {
            textChunks = Array.from(blocks).map(block => block.textContent?.trim() || '');
        } else {
            textChunks = (mainContent.textContent || '').split(/\n\s*\n/);
        }

        const fullText = textChunks.filter(Boolean).join('\n\n');
        
        // Final fallback if scraping produced very little text
        if (!fullText.trim() || fullText.length < 100) {
            return body.textContent?.trim() || '';
        }
        return fullText;
    }
    return '';
}


/**
 * Fetches content from a direct URL, intended for web fallback results.
 * It can handle plain text and scrape HTML.
 * PDFs are not supported directly in the reader and should be handled by the UI.
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
    const filetype = getFileType(url);

    if (filetype === 'txt' || contentType.includes('text/plain')) {
        return await res.text();
    }

    if (filetype === 'html' || contentType.includes('text/html')) {
        const html = await res.text();
        const text = await scrapeTextFromHtml(html);
        if (!text.trim()) {
            throw new Error("Could not extract any readable text from the provided HTML page.");
        }
        return text;
    }
    
    throw new Error(`Unsupported content type ('${contentType}' or file extension '${filetype}'). Cannot display this file in the reader.`);
}
