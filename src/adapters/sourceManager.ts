
import * as gutendex from './gutendex';
import type { MappedGutenbergBook } from './gutendex';

export type SearchResult = MappedGutenbergBook;

/**
 * This file acts as a central hub for fetching book content from Gutendex.
 */

/**
 * Fetches content from a primary source (currently only Gutendex).
 * @param book The book object from a search result.
 * @returns A promise that resolves to the string content of the book.
 */
export async function fetchBookContent(book: SearchResult): Promise<string | Blob> {
  // Only Gutendex is a primary source, so we call its adapter directly.
  return await gutendex.fetchGutenbergBookContent(book.formats);
}
