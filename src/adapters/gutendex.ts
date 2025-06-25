
type GutenbergBook = {
  id: number;
  title: string;
  authors: { name: string }[];
  formats: Record<string, string>;
};

type GutenbergAPIResponse = {
  results: GutenbergBook[];
};

export type MappedGutenbergBook = {
  id: string;
  title: string;
  authors: string;
  formats: Record<string, string>;
  source: 'gutendex';
};

export async function fetchGutenbergBooks(query: string, page = 1): Promise<MappedGutenbergBook[]> {
  if (!query) return [];
  const res = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(query)}&page=${page}`);
  if (!res.ok) {
    console.error('Failed to fetch from Gutendex:', res.statusText);
    return [];
  }
  const data: GutenbergAPIResponse = await res.json();
  return data.results.map(book => ({
    id: String(book.id),
    title: book.title,
    authors: book.authors.map(a => a.name).join(', '),
    formats: book.formats,
    source: 'gutendex'
  }));
}

export async function fetchGutenbergBookContent(formats: Record<string, string>): Promise<string | Blob> {
  const plainTextUrl = formats['text/plain; charset=utf-8'] || formats['text/plain'];

  if (plainTextUrl) {
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(plainTextUrl)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch book content from ${plainTextUrl}`);
    }
    return await res.text();
  }

  const epubUrl = formats['application/epub+zip'];
  if (epubUrl) {
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(epubUrl)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch book content from ${epubUrl}`);
    }
    return await res.blob();
  }

  throw new Error('No compatible book format found for this Gutendex book (epub or txt).');
}
