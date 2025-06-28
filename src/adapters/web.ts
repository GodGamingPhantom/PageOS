
'use client';

/**
 * Fetches a .txt file through the proxy route and returns its content.
 * @param url Direct link to the TXT file.
 * @returns Extracted plain text content, or null on failure.
 */
export async function fetchWebBookContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) {
        throw new Error(`Proxy fetch failed with status: ${res.status}`);
    }
    
    const contentType = res.headers.get('Content-Type') || '';
    // Be lenient with content type, as servers can misconfigure it.
    // If it's a .txt URL, we assume it's text.
    if (!url.toLowerCase().endsWith('.txt') && !contentType.includes('text') && !contentType.includes('plain')) {
      console.warn(`Content type for ${url} is '${contentType}', attempting to read as text anyway.`);
    }

    return await res.text();
  } catch (err) {
    console.error('Web TXT Fetch Error:', err);
    if (err instanceof Error) {
        throw new Error(`Failed to load TXT content. Reason: ${err.message}`);
    }
    throw new Error('An unknown error occurred while fetching TXT content.');
  }
}
