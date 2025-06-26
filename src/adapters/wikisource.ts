
type WikisourceSearchItem = {
    pageid: number;
    title: string;
};

type WikisourceSearchResponse = {
    query: {
        search: WikisourceSearchItem[];
    };
};

export type MappedWikisourceBook = {
    id: string;
    pageid: number;
    title: string;
    authors: string;
    source: 'wikisource';
};

export async function fetchWikisource(query: string): Promise<MappedWikisourceBook[]> {
  if (!query) return [];
  const apiUrl = `https://en.wikisource.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(apiUrl)}`);
  
  if (!res.ok) {
    console.error('Failed to fetch from Wikisource:', res.statusText);
    return [];
  }
  const data: WikisourceSearchResponse = await res.json();
  if (!data.query || !data.query.search) {
      console.error('Invalid Wikisource API response:', data);
      return [];
  }
  return data.query.search.map(item => ({
    id: String(item.pageid),
    pageid: item.pageid,
    title: item.title,
    authors: 'N/A', // Wikisource API doesn't easily provide author data in search
    source: 'wikisource'
  }));
}

type WikisourceContentResponse = {
    query: {
        pages: {
            [pageid: string]: {
                revisions: { '*': string }[];
            }
        }
    }
};

export async function fetchWikisourceContent(pageid: number): Promise<string> {
  const url = `https://en.wikisource.org/w/api.php?action=query&prop=revisions&rvprop=content&pageids=${pageid}&format=json&origin=*`;
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch content from Wikisource for pageid ${pageid}`);
  }
  const data: WikisourceContentResponse = await res.json();
  const content = data.query.pages[String(pageid)].revisions[0]['*'];
  return content;
}
