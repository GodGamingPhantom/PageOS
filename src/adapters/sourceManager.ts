
import * as gutendex from './gutendex';
import type { MappedGutenbergBook } from './gutendex';
import * as standardEbooks from './standardEbooks';
import type { MappedStandardEbook } from './standardEbooks';
import * as openLibrary from './openLibrary';
import type { MappedOpenLibraryBook } from './openLibrary';
import * as wikisource from './wikisource';
import type { MappedWikisourceBook } from './wikisource';
import * as manybooks from './manybooks';
import type { MappedManybooksBook } from './manybooks';

export type SearchResult = MappedGutenbergBook | MappedStandardEbook | MappedOpenLibraryBook | MappedWikisourceBook | MappedManybooksBook;

export async function searchBooksAcrossSources(query: string): Promise<SearchResult[]> {
  if (!query) return [];
  
  const promises = [
    gutendex.fetchGutenbergBooks(query).catch(e => { console.error("Gutendex search failed:", e); return []; }),
    standardEbooks.fetchStandardEbooks(query).catch(e => { console.error("Standard Ebooks search failed:", e); return []; }),
    openLibrary.fetchOpenLibrary(query).catch(e => { console.error("Open Library search failed:", e); return []; }),
    wikisource.fetchWikisource(query).catch(e => { console.error("Wikisource search failed:", e); return []; }),
    manybooks.fetchManyBooks(query).catch(e => { console.error("ManyBooks search failed:", e); return []; }),
  ];

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
      return await manybooks.fetchManybooksContent(book.id);
    default: 
      const _exhaustiveCheck: never = book;
      throw new Error('Unknown source');
  }
}
