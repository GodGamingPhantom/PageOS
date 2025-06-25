
"use client";

import { useState } from "react";
import { CommandSearch } from "@/components/command-search";
import type { SearchResult } from "@/adapters/sourceManager";
import { SearchResultCard } from "@/components/search-result-card";
import { LoaderCircle } from "lucide-react";

export default function HomePage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-headline text-accent">SYSTEM_FEED</h1>
        <p className="text-muted-foreground">
          Latest transmissions and popular memory logs
        </p>
      </div>

      <CommandSearch onResults={setSearchResults} onLoading={setIsLoading} />

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
          <p className="ml-4 text-muted-foreground">Querying transmission nodes...</p>
        </div>
      ) : searchResults.length > 0 ? (
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
      ) : (
         <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground/80">
            <p className="font-headline text-lg text-accent/80">Awaiting Transmission</p>
            <p>Use the command line above to query the public domain archives.</p>
         </div>
      )}
    </div>
  );
}
