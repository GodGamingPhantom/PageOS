
"use client";

import { useState } from "react";
import { CommandSearch } from "@/components/command-search";
import type { SearchResult } from "@/adapters/sourceManager";
import { SearchResultCard } from "@/components/search-result-card";
import { LoaderCircle } from "lucide-react";
import { getBooks } from "@/lib/mock-data";
import type { Book } from "@/lib/types";
import { BookCard } from "@/components/book-card";

// Helper to group books by genre
const groupBooksByGenre = (books: Book[]): Record<string, Book[]> => {
  return books.reduce((acc, book) => {
    const genre = book.genre || 'Uncategorized';
    if (!acc[genre]) {
      acc[genre] = [];
    }
    acc[genre].push(book);
    return acc;
  }, {} as Record<string, Book[]>);
};


export default function HomePage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const mockBooks = getBooks();
  const booksByGenre = groupBooksByGenre(mockBooks);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
          <p className="ml-4 text-muted-foreground">Querying transmission nodes...</p>
        </div>
      );
    }

    if (searchResults.length > 0) {
      return (
        <section>
          <h2 className="font-headline text-lg text-accent/80 mb-4 border-b border-dashed border-border pb-2">
            // QUERY_RESULTS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {searchResults.map((book, index) => (
              <SearchResultCard key={`${book.source}-${book.id}-${index}`} book={book} />
            ))}
          </div>
        </section>
      );
    }
    
    return (
        <div className="space-y-8">
          {Object.entries(booksByGenre).map(([genre, books]) => (
            <section key={genre}>
              <h2 className="font-headline text-lg text-accent/80 mb-4 border-b border-dashed border-border pb-2">
                // CATEGORY: {genre.toUpperCase()}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          ))}
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-headline text-accent">SYSTEM_FEED</h1>
        <p className="text-muted-foreground">
          Latest transmissions and popular memory logs
        </p>
      </div>

      <CommandSearch onResults={setSearchResults} onLoading={setIsLoading} />

      {renderContent()}

    </div>
  );
}
