
type OpenLibraryDoc = {
  key: string;
  title: string;
  author_name: string[];
  cover_i: number;
  edition_key: string[];
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
    .filter(book => book.edition_key?.[0])
    .map(book => ({
    id: book.key,
    title: book.title,
    authors: book.author_name?.join(', ') || 'Unknown',
    cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
    edition: book.edition_key[0],
    source: 'openLibrary'
  }));
}

export async function fetchOpenLibraryContent(editionKey: string): Promise<string> {
  const url = `https://openlibrary.org/books/${editionKey}.txt`;
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch book content from Open Library for edition ${editionKey}`);
  }
  return await res.text();
}
