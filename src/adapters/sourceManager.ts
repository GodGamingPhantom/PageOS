
import * as gutendex from './gutendex';
import type { MappedGutenbergBook } from './gutendex';
import { fetchWebFallback, WebFallbackResult } from './webFallback';


// With Open Library and Standard Ebooks removed, SearchResult is simpler.
export type SearchResult = MappedGutenbergBook;

export type SearchResponse = {
  primary: SearchResult[];
  fallback: WebFallbackResult[];
};

// Only Gutendex is left as a primary source.
const sourceFetchers = {
  gutendex: gutendex.fetchGutenbergBooks,
};

export type SourceKey = keyof typeof sourceFetchers;

export async function searchBooksAcrossSources(query: string, enabledSources: SourceKey[] = ['gutendex']): Promise<SearchResponse> {
  const response: SearchResponse = { primary: [], fallback: [] };
  if (!query) return response;

  // If gutendex is enabled, search it.
  if (enabledSources.includes('gutendex')) {
      try {
        response.primary = await sourceFetchers.gutendex(query);
      } catch (e) {
        console.error(`gutendex search failed:`, e);
        response.primary = [];
      }
  }

  // If primary sources yield no results, trigger the web fallback.
  if (response.primary.length === 0) {
    console.log('Primary sources returned no results. Triggering web fallback...');
    response.fallback = await fetchWebFallback(query);
  }

  return response;
}

export async function fetchBookContent(book: SearchResult): Promise<string | Blob> {
  // The switch is no longer needed as there's only one primary source type.
  return await gutendex.fetchGutenbergBookContent(book.formats);
}
