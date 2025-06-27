
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

export async function fetchGutenbergBooks(query?: string, page = 1): Promise<MappedGutenbergBook[]> {
  const params = new URLSearchParams();
  if (query) {
    params.set('search', query);
  } else {
    params.set('sort', 'popular');
  }
  params.set('page', String(page));
  
  const apiUrl = `https://gutendex.com/books?${params.toString()}`;
  
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(apiUrl)}`);
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
  const formatEntries = Object.entries(formats);

  // Find a plain text URL that is NOT a zip file.
  const plainTextEntry = formatEntries.find(([key, url]) => 
    key.startsWith('text/plain') && !url.endsWith('.zip')
  );

  if (plainTextEntry) {
    const plainTextUrl = plainTextEntry[1];
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
