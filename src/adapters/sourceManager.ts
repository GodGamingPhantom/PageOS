
import * as gutendex from './gutendex';
import type { MappedGutenbergBook } from './gutendex';

// Represents a book from a generic web URL
export type WebBook = {
  source: 'web';
  id: string; // The URL acts as the ID
  title: string;
  authors: string;
  url: string;
  formats: Record<string, never>; // To keep the shape consistent
};

export type SearchResult = MappedGutenbergBook | WebBook;

/**
 * This file acts as a central hub for fetching book content from Gutendex.
 */

/**
 * Fetches content from a primary source (Gutendex).
 * @param book The book object from a search result.
 * @returns A promise that resolves to the string content of the book.
 */
export async function fetchBookContent(book: MappedGutenbergBook): Promise<string | Blob> {
  // This function now explicitly handles only Gutendex books.
  // Web books are fetched directly in `useBookLoader`.
  return await gutendex.fetchGutenbergBookContent(book.formats);
}
