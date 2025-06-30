import * as gutendex from './gutendex';
import type { MappedGutenbergBook } from './gutendex';

export type Source = "gutendex" | "web";

export type SearchResult = {
  id: string;
  title: string;
  authors: string;
  source: Source;
  formats?: Record<string, string>; // gutendex only
  url?: string;                     // web only
};

/**
 * Fetches content from the book's source.
 */
export async function fetchBookContent(book: SearchResult): Promise<string | Blob> {
  switch (book.source) {
    case "gutendex":
      if (!book.formats) {
        throw new Error("Missing formats for gutendex book");
      }
      return await gutendex.fetchGutenbergBookContent(book.formats);
    case "web":
      if (!book.url) throw new Error("Missing URL for web book");
      const res = await fetch(book.url);
      if (!res.ok) throw new Error("Failed to fetch web content");
      return await res.blob();
    default:
      throw new Error(`Unknown book source: ${book.source}`);
  }
}
