
type OpenLibraryDoc = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  edition_key?: string[];
};

type OpenLibraryAPIResponse = {
  docs: OpenLibraryDoc[];
};

export type MappedOpenLibraryBook = {
    id: string;
    title: string;
    authors: string;
    cover: string | null;
    edition: string;
    source: 'openLibrary';
};

export async function fetchOpenLibrary(query: string): Promise<MappedOpenLibraryBook[]> {
  if (!query) return [];
  // Note: has_fulltext=true combined with needing an edition_key for a .txt file is very restrictive.
  // We rely on edition_key to ensure we can actually fetch plain text content.
  const apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&has_fulltext=true`;
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(apiUrl)}`);
  if (!res.ok) {
    console.error('Failed to fetch from Open Library:', res.statusText);
    return [];
  }
  const data: OpenLibraryAPIResponse = await res.json();

  // Filter for books that have an edition key, as we need it to get the .txt file.
  return data.docs
    .filter(book => book.edition_key && book.edition_key.length > 0)
    .map(book => ({
      id: book.key,
      title: book.title,
      authors: book.author_name?.join(', ') || 'Unknown',
      cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
      edition: book.edition_key![0], // We can use ! here because we've filtered for it
      source: 'openLibrary'
    }));
}

export async function fetchOpenLibraryContent(editionKey: string): Promise<string | null> {
  // Primary strategy: Fetch the .txt file directly.
  const txtUrl = `https://openlibrary.org/books/${editionKey}.txt`;
  const txtRes = await fetch(`/api/proxy?url=${encodeURIComponent(txtUrl)}`);

  if (txtRes.ok) {
    const textContent = await txtRes.text();
    // Some .txt files on OpenLibrary are just redirect pages or empty. Check for actual content.
    if (textContent && textContent.length > 100 && !textContent.toLowerCase().includes('redirect')) {
      return textContent;
    }
  }

  // Fallback strategy: Scrape the HTML page. This is less reliable.
  // Note: OpenLibrary's HTML structure varies. This may not work for all books.
  const htmlUrl = `https://openlibrary.org/books/${editionKey}/read`;
  const htmlRes = await fetch(`/api/proxy?url=${encodeURIComponent(htmlUrl)}`);
  if (!htmlRes.ok) {
    return null; // Both attempts failed.
  }

  const html = await htmlRes.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // The reader content is often inside an element with this class.
  const contentContainer = doc.querySelector(".book-page-text");
  
  if (contentContainer) {
    return contentContainer.textContent || null;
  }
  
  return null; // Could not find a readable content container.
}
