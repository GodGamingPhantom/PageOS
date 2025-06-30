import * as gutendex from './gutendex';
import type { MappedGutenbergBook } from './gutendex';

export type Source = 'gutendex' | 'web';

/**
 * Type representing a web-based book (external link to content)
 */
export type WebBook = {
  id: string;
  title: string;
  authors: string;
  source: 'web';
  url: string;
};

/**
 * Gutendex type already includes: id, title, authors, formats, and source: 'gutendex'
 */
export type SearchResult = MappedGutenbergBook | WebBook;

/**
 * Fetches content from the book's source.
 */
export async function fetchBookContent(book: SearchResult): Promise<string | Blob> {
  switch (book.source) {
    case 'gutendex':
      if (!book.formats) {
        throw new Error('Missing formats for gutendex book');
      }
      return await gutendex.fetchGutenbergBookContent(book.formats);

    case 'web':
      if (!book.url) {
        throw new Error('Missing URL for web book');
      }
      const res = await fetch(book.url);
      if (!res.ok) {
        throw new Error(`Failed to fetch content from: ${book.url}`);
      }
      return await res.blob();

    default:
      throw new Error(`Unsupported book source: ${(book as any).source}`);
  }
}
