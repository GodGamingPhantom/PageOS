
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
  
  const apiUrl = `https://standardebooks.org/api/v1/ebooks/?query=${encodeURIComponent(query)}`;
  // Use the generic local API proxy to bypass CORS issues
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(apiUrl)}`);

  if (!res.ok) {
    console.error('Failed to fetch from Standard Ebooks API via proxy:', res.status, res.statusText);
    return [];
  }
  
  const data: StandardEbooksAPIResponse = await res.json();

  if (!data.results) {
    console.error('Invalid response from Standard Ebooks proxy:', data);
    return [];
  }
  
  return data.results.map(book => ({
    id: book.url,
    title: book.title,
    authors: book.contributors.map(c => c.name).join(', '),
    epub: book.downloads.find(d => d.type === 'application/epub+zip')?.url,
    source: 'standardEbooks'
  }));
}

export async function fetchStandardEbookContent(epubUrl: string): Promise<Blob> {
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(epubUrl)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch book content from ${epubUrl}`);
  }
  return await res.blob();
}
