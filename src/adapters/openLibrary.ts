
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
  const apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&has_fulltext=true`;
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(apiUrl)}`);
  if (!res.ok) {
    console.error('Failed to fetch from Open Library:', res.statusText);
    return [];
  }
  const data: OpenLibraryAPIResponse = await res.json();

  return data.docs
    .filter(book => book.edition_key && book.edition_key.length > 0)
    .map(book => ({
      id: book.key,
      title: book.title,
      authors: book.author_name?.join(', ') || 'Unknown',
      cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
      edition: book.edition_key![0],
      source: 'openLibrary'
    }));
}

export async function fetchOpenLibraryContent(editionKey: string): Promise<string | null> {
  // Strategy 1: Attempt to fetch the direct .txt file.
  const txtUrl = `https://openlibrary.org/books/${editionKey}.txt`;
  const txtRes = await fetch(`/api/proxy?url=${encodeURIComponent(txtUrl)}`);

  if (txtRes.ok) {
    const textContent = await txtRes.text();
    // A valid .txt file should have substantial content and not be an HTML redirect page.
    if (textContent && textContent.length > 200 && !textContent.toLowerCase().includes('<html')) {
      return textContent;
    }
  }

  // Fallback Strategy: If .txt fails, scrape the HTML read page.
  const htmlUrl = `https://openlibrary.org/books/${editionKey}/read`;
  const htmlRes = await fetch(`/api/proxy?url=${encodeURIComponent(htmlUrl)}`);
  if (!htmlRes.ok) {
    return null; // Both attempts failed.
  }

  const html = await htmlRes.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // This class is commonly used for the main text container on Open Library's reader.
  const contentContainer = doc.querySelector(".book-page-text");
  
  if (contentContainer) {
    return contentContainer.textContent || null;
  }
  
  return null; // Could not find a readable content container.
}
