
import * as gutendex from './gutendex';
import type { MappedGutenbergBook } from './gutendex';
import * as openLibrary from './openLibrary';
import type { MappedOpenLibraryBook } from './openLibrary';

export type SearchResult = MappedGutenbergBook | MappedOpenLibraryBook;

const sourceFetchers = {
  gutendex: gutendex.fetchGutenbergBooks,
  openLibrary: openLibrary.fetchOpenLibrary,
};

export type SourceKey = keyof typeof sourceFetchers;

export async function searchBooksAcrossSources(query: string, enabledSources?: SourceKey[]): Promise<SearchResult[]> {
  if (!query) return [];

  const sourcesToSearch: SourceKey[] = enabledSources ?? Object.keys(sourceFetchers) as SourceKey[];

  const promises = sourcesToSearch.map(sourceKey => {
    const fetcher = sourceFetchers[sourceKey];
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
    case 'openLibrary': 
      return await openLibrary.fetchOpenLibraryContent(book.edition);
    default: 
      const _exhaustiveCheck: never = book;
      throw new Error('Unknown source');
  }
}
