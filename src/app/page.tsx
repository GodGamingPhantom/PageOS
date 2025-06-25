
"use client";

import { useState, useEffect } from "react";
import { CommandSearch } from "@/components/command-search";
import type { SearchResult } from "@/adapters/sourceManager";
import { SearchResultCard } from "@/components/search-result-card";
import { LoaderCircle } from "lucide-react";
import { fetchGutenbergBooks } from "@/adapters/gutendex";

export default function HomePage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [featuredBooks, setFeaturedBooks] = useState<SearchResult[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedBooks() {
      setIsFeaturedLoading(true);
      try {
        const books = await fetchGutenbergBooks();
        setFeaturedBooks(books);
      } catch (error) {
        console.error("Failed to load featured books:", error);
        setFeaturedBooks([]);
      } finally {
        setIsFeaturedLoading(false);
      }
    }
    loadFeaturedBooks();
  }, []);


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
        <section>
             <h2 className="font-headline text-lg text-accent/80 mb-4">
                // FEATURED_LOGS from Project Gutenberg
            </h2>
            {isFeaturedLoading ? (
               <div className="flex justify-center items-center p-8">
                <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
                <p className="ml-4 text-muted-foreground">Loading recommendations...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {featuredBooks.map((book, index) => (
                      <SearchResultCard key={`${book.source}-${book.id}-${index}`} book={book} />
                  ))}
              </div>
            )}
        </section>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-headline text-accent">SYSTEM_FEED</h1>
        <p className="text-muted-foreground">
          Search for transmissions and memory logs across the network.
        </p>
      </div>

      <CommandSearch onResults={setSearchResults} onLoading={setIsLoading} />

      {renderContent()}

    </div>
  );
}
