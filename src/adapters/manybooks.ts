'use client'; // This file uses browser APIs like DOMParser

export type MappedManybooksBook = {
  id: string; // The book's path, e.g., /books/stoker-bram/dracula
  title: string;
  authors: string;
  cover: string | null;
  source: 'manybooks';
};

async function getDOM(url: string): Promise<Document> {
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
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
    const searchUrl = `https://manybooks.net/search-book?search=${encodeURIComponent(query)}`;
    const doc = await getDOM(searchUrl);
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
        cover: cover ? new URL(cover, 'https://manybooks.net').toString() : null,
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
        // First, fetch the main book page to find the download link
        const bookPageUrl = `https://manybooks.net${bookPath.startsWith('/') ? bookPath : `/${bookPath}`}`;
        const bookPageDoc = await getDOM(bookPageUrl);
        
        // Find the "Plain Text" download link.
        const downloadLinks = Array.from(bookPageDoc.querySelectorAll('a.dropdown-item'));
        const plainTextLink = downloadLinks.find(a => a.textContent?.trim() === 'Plain Text');

        const downloadPath = plainTextLink?.getAttribute('href');
        
        if (!downloadPath) {
            const epubLink = downloadLinks.find(a => a.textContent?.trim() === 'EPUB');
            if (epubLink) {
                 throw new Error('This book is available as an EPUB, but the reader for this format is not yet implemented.');
            }
            throw new Error('Could not find a readable download format (Plain Text) for this book on ManyBooks.');
        }

        // downloadPath can be relative, so construct an absolute URL
        const downloadUrl = new URL(downloadPath, bookPageUrl).toString();

        // Now fetch the text content from the download path
        const contentRes = await fetch(`/api/proxy?url=${encodeURIComponent(downloadUrl)}`);
        if (!contentRes.ok) {
            throw new Error(`Failed to fetch book content from download path: ${downloadPath}`);
        }
        const bookContent = await contentRes.text();
        
        return bookContent;

    } catch (error) {
        console.error('Failed to fetch ManyBooks content:', error);
        throw new Error(`Failed to load content from ManyBooks. ${error instanceof Error ? error.message : ''}`);
    }
}
