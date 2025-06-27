
import * as gutendex from './gutendex';
import type { MappedGutenbergBook } from './gutendex';
import * as openLibrary from './openLibrary';
import type { MappedOpenLibraryBook } from './openLibrary';
import * as standardEbooks from './standardEbooks';

export type MappedStandardEbook = {
  id: string;
  title: string;
  authors: string;
  source: 'standardEbooks';
  slug: string;
};

export type SearchResult = MappedGutenbergBook | MappedOpenLibraryBook | MappedStandardEbook;

const sourceFetchers = {
  gutendex: gutendex.fetchGutenbergBooks,
  openLibrary: openLibrary.fetchOpenLibrary,
  standardEbooks: standardEbooks.searchStandardEbooks,
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
  let content: string | Blob | null = null;

  switch (book.source) {
    case 'gutendex':
      // This adapter handles its own fallbacks and throws errors internally.
      return await gutendex.fetchGutenbergBookContent(book.formats);
    case 'openLibrary':
      content = await openLibrary.fetchOpenLibraryContent(book.edition);
      break;
    case 'standardEbooks':
      content = await standardEbooks.fetchStandardEbooksBookContent(book.slug);
      break;
    default:
      // This is a safety net for exhaustiveness checking.
      const _exhaustiveCheck: never = book;
      throw new Error('Unknown or unsupported book source.');
  }

  if (!content) {
    throw new Error(`Failed to extract readable content from ${book.source}. The source might not provide a compatible text format for this specific book, or the request may have been blocked.`);
  }
  
  return content;
}
