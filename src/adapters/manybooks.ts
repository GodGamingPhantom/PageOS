'use client'; // This file uses browser APIs like DOMParser

export type MappedManybooksBook = {
  id: string; // The book's path, e.g., /books/stoker-bram/dracula
  title: string;
  authors: string;
  cover: string | null;
  source: 'manybooks';
};

async function getDOM(url: string): Promise<Document> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch HTML from ${url}`);
    }
    const html = await res.text();
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
}

export async function fetchManyBooks(query: string): Promise<MappedManybooksBook[]> {
  if (!query) return [];

  try {
    const doc = await getDOM(`/api/manybooks?search=${encodeURIComponent(query)}`);
    const bookElements = Array.from(doc.querySelectorAll('article.book-teaser'));

    return bookElements.map(el => {
      const linkElement = el.querySelector('a');
      const imgElement = el.querySelector('img');
      const titleElement = el.querySelector('h2 a');
      const authorElement = el.querySelector('div.text-sm > span > a');
      
      const path = linkElement?.getAttribute('href') || '';
      const cover = imgElement?.getAttribute('src') || null;

      return {
        id: path,
        title: titleElement?.textContent?.trim() || 'Untitled',
        authors: authorElement?.textContent?.trim() || 'Unknown',
        cover: cover,
        source: 'manybooks'
      };
    }).filter(book => book.id); // Filter out any entries that failed to parse a path
  } catch (error) {
    console.error('Failed to fetch or parse from ManyBooks:', error);
    return [];
  }
}

export async function fetchManybooksContent(bookPath: string): Promise<string> {
    try {
        // First, fetch the main book page to find the "Read online" link
        const bookPageDoc = await getDOM(`/api/manybooks?path=${encodeURIComponent(bookPath)}`);
        const readOnlineLink = bookPageDoc.querySelector('a.btn-primary[href*="/read"]');
        
        const readPath = readOnlineLink?.getAttribute('href');
        if (!readPath) {
            throw new Error('Could not find "Read online" link for this book.');
        }

        // The href might be a full URL, so we extract the path
        const urlObject = new URL(readPath);
        const contentPath = urlObject.pathname;
        
        // Now fetch the reader page content
        const readerPageDoc = await getDOM(`/api/manybooks?path=${encodeURIComponent(contentPath)}`);
        const contentContainer = readerPageDoc.querySelector('div.prose');

        if (!contentContainer) {
            throw new Error('Could not find content container on the reader page.');
        }
        
        return contentContainer.textContent || 'Content could not be extracted.';

    } catch (error) {
        console.error('Failed to fetch ManyBooks content:', error);
        throw new Error(`Failed to load content from ManyBooks. ${error instanceof Error ? error.message : ''}`);
    }
}
