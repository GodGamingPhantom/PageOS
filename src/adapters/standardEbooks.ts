
type StandardEbook = {
  url: string;
  title: string;
  contributors: { name: string }[];
  downloads: { type: string, url: string }[];
};

type StandardEbooksAPIResponse = {
  results: StandardEbook[];
};

export type MappedStandardEbook = {
  id: string;
  title: string;
  authors: string;
  epub: string | undefined;
  source: 'standardEbooks';
};

export async function fetchStandardEbooks(query: string): Promise<MappedStandardEbook[]> {
  if (!query) return [];
  const res = await fetch(`https://standardebooks.org/api/v1/ebooks/?title__icontains=${encodeURIComponent(query)}`);
  if (!res.ok) {
    console.error('Failed to fetch from Standard Ebooks:', res.statusText);
    return [];
  }
  
  const data: StandardEbooksAPIResponse = await res.json();
  
  return data.results.map(book => ({
    id: book.url,
    title: book.title,
    authors: book.contributors.map(c => c.name).join(', '),
    epub: book.downloads.find(d => d.type === 'application/epub+zip')?.url,
    source: 'standardEbooks'
  }));
}

export async function fetchStandardEbookContent(epubUrl: string): Promise<Blob> {
  const res = await fetch(epubUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch book content from ${epubUrl}`);
  }
  return await res.blob();
}
