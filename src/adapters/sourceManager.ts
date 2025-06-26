
import * as gutendex from './gutendex';
import type { MappedGutenbergBook } from './gutendex';
import * as standardEbooks from './standardEbooks';
import type { MappedStandardEbook } from './standardEbooks';
import * as openLibrary from './openLibrary';
import type { MappedOpenLibraryBook } from './openLibrary';
import * as wikisource from './wikisource';
import type { MappedWikisourceBook } from './wikisource';
// Import the type only, not the implementation
import type { MappedManybooksBook } from './manybooks';

// The SearchResult union type can safely include the client-only type
export type SearchResult = MappedGutenbergBook | MappedStandardEbook | MappedOpenLibraryBook | MappedWikisourceBook | MappedManybooksBook;

// This object contains only server-safe fetchers
const sourceFetchers = {
  gutendex: gutendex.fetchGutenbergBooks,
  standardEbooks: standardEbooks.fetchStandardEbooks,
  openLibrary: openLibrary.fetchOpenLibrary,
  wikisource: wikisource.fetchWikisource,
};

// Manually define the SourceKey to include the dynamically loaded one
export type SourceKey = keyof typeof sourceFetchers | 'manybooks';

export async function searchBooksAcrossSources(query: string, enabledSources?: SourceKey[]): Promise<SearchResult[]> {
  if (!query) return [];

  const allSourceKeys: SourceKey[] = [...Object.keys(sourceFetchers), 'manybooks'] as SourceKey[];
  const sourcesToSearch: SourceKey[] = enabledSources ?? allSourceKeys;

  const promises = sourcesToSearch.map(sourceKey => {
    // Handle the client-side 'manybooks' source dynamically
    if (sourceKey === 'manybooks') {
      // This will only run on the client, where DOMParser is available
      return import('./manybooks').then(mb => mb.fetchManyBooks(query)).catch(e => {
        console.error(`${sourceKey} search failed:`, e);
        return [];
      });
    }

    // Handle server-safe sources
    const fetcher = sourceFetchers[sourceKey as keyof typeof sourceFetchers];
    if (!fetcher) {
        console.warn(`No fetcher found for source: ${sourceKey}`);
        return Promise.resolve([]);
    }
    return fetcher(query).catch(e => {
      console.error(`${sourceKey} search failed:`, e);
      return [];
    });
  });

  const results = await Promise.all(promises);
  return results.flat();
}


export async function fetchBookContent(book: SearchResult): Promise<string | Blob> {
  switch (book.source) {
    case 'gutendex': 
      return await gutendex.fetchGutenbergBookContent(book.formats);
    case 'standardEbooks': 
      if (!book.epub) throw new Error('No epub URL for Standard Ebook');
      return await standardEbooks.fetchStandardEbookContent(book.epub);
    case 'openLibrary': 
      return await openLibrary.fetchOpenLibraryContent(book.edition);
    case 'wikisource': 
      return await wikisource.fetchWikisourceContent(book.pageid);
    case 'manybooks':
      // Dynamically import the client-side content fetcher
      const { fetchManybooksContent } = await import('./manybooks');
      return await fetchManybooksContent(book.id);
    default: 
      const _exhaustiveCheck: never = book;
      throw new Error('Unknown source');
  }
}
