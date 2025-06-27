
import * as gutendex from './gutendex';
import type { MappedGutenbergBook } from './gutendex';

export type SearchResult = MappedGutenbergBook;

/**
 * Fetches content from a primary source (currently only Gutendex).
 * @param book The book object from a primary source search result.
 * @returns A promise that resolves to the string content of the book.
 */
export async function fetchBookContent(book: SearchResult): Promise<string | Blob> {
  // Only one primary source is left, so a switch statement is not needed.
  return await gutendex.fetchGutenbergBookContent(book.formats);
}
