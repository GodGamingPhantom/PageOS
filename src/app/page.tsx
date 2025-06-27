"use client";

import { useState, useEffect } from "react";
import { CommandSearch } from "@/components/command-search";
import type { SearchResult, SearchResponse } from "@/adapters/sourceManager";
import type { WebFallbackResult } from "@/adapters/webFallback";
import { SearchResultCard } from "@/components/search-result-card";
import { LoaderCircle, SignalZero } from "lucide-react";
import { fetchGutenbergBooks } from "@/adapters/gutendex";
import { fetchOpenLibrary } from "@/adapters/openLibrary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FallbackLinks } from "@/components/fallback-links";

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function HomePage() {
  const [primaryResults, setPrimaryResults] = useState<SearchResult[]>([]);
  const [fallbackResults, setFallbackResults] = useState<WebFallbackResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [featuredBooks, setFeaturedBooks] = useState<SearchResult[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedBooks() {
      setIsFeaturedLoading(true);
      try {
        const [gutenbergBooks, openLibraryBooks] = await Promise.all([
          fetchGutenbergBooks(),
          fetchOpenLibrary('classic literature'),
        ]);

        const allBooks = [
          ...gutenbergBooks.slice(0, 10),
          ...openLibraryBooks.slice(0, 10),
        ];

        setFeaturedBooks(shuffleArray(allBooks));
      } catch (error) {
        console.error("Failed to load featured books:", error);
        setFeaturedBooks([]);
      } finally {
        setIsFeaturedLoading(false);
      }
    }
    loadFeaturedBooks();
  }, []);

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setHasSearched(true);
    }
  };

  const handleResults = (results: SearchResponse) => {
    setPrimaryResults(results.primary);
    setFallbackResults(results.fallback);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
          <p className="ml-4 text-muted-foreground">
            Querying transmission nodes...
          </p>
        </div>
      );
    }

    if (primaryResults.length > 0) {
      return (
        <section>
          <h2 className="font-headline text-lg text-accent/80 mb-4 border-b border-dashed border-border pb-2">
            // QUERY_RESULTS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {primaryResults.map((book, index) => (
              <SearchResultCard
                key={`${book.source}-${book.id}-${index}`}
                book={book}
              />
            ))}
          </div>
        </section>
      );
    }

    if (fallbackResults.length > 0) {
      return <FallbackLinks results={fallbackResults} />;
    }

    if (hasSearched) {
      return (
        <section>
          <h2 className="font-headline text-lg text-accent/80 mb-4 border-b border-dashed border-border pb-2">
            // QUERY_RESULTS
          </h2>
          <Card className="border-border/50 bg-card text-center">
            <CardHeader>
              <div className="mx-auto bg-input rounded-full p-3 w-fit">
                <SignalZero className="h-8 w-8 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="font-headline text-lg text-accent/80">
                QUERY_NEGATIVE
              </CardTitle>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                No data streams in the network match the provided signature. The
                archive returned no records.
              </p>
            </CardContent>
          </Card>
        </section>
      );
    }

    return (
      <section>
        <h2 className="font-headline text-lg text-accent/80 mb-4">
          // FEATURED_LOGS from the Network
        </h2>
        {isFeaturedLoading ? (
          <div className="flex justify-center items-center p-8">
            <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
            <p className="ml-4 text-muted-foreground">
              Loading recommendations...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {featuredBooks.map((book, index) => (
              <SearchResultCard
                key={`${book.source}-${book.id}-${index}`}
                book={book}
              />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-headline text-accent">SYSTEM_FEED</h1>
        <p className="text-muted-foreground">
          Search for transmissions and memory logs across the network.
        </p>
      </div>

      <CommandSearch onResults={handleResults} onLoading={handleLoading} />

      {renderContent()}
    </div>
  );
}
