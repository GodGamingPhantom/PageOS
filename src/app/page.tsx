
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CommandSearch } from "@/components/command-search";
import type { SearchResult } from "@/adapters/sourceManager";
import { SearchResultCard } from "@/components/search-result-card";
import { LoaderCircle, SignalZero, Globe, FileText, FileJson2, FileQuestion } from "lucide-react";
import { fetchGutenbergBooks } from "@/adapters/gutendex";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

type WebResult = {
  title: string;
  link: string;
};

const getFiletypeFromUrl = (url: string): 'pdf' | 'txt' | 'html' | 'other' => {
  if (!url) return 'other';
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.endsWith('.pdf')) return 'pdf';
  if (lowerUrl.endsWith('.txt')) return 'txt';
  if (lowerUrl.endsWith('.html') || lowerUrl.endsWith('.htm')) return 'html';
  return 'other';
};

const FiletypeIcon = ({ type }: { type: 'pdf' | 'txt' | 'html' | 'other' }) => {
    switch (type) {
        case 'html': return <Globe className="h-4 w-4 text-accent" />;
        case 'pdf': return <FileJson2 className="h-4 w-4 text-accent" />;
        case 'txt': return <FileText className="h-4 w-4 text-accent" />;
        default: return <FileQuestion className="h-4 w-4 text-accent" />;
    }
}

export default function HomePage() {
  const [primaryResults, setPrimaryResults] = useState<SearchResult[]>([]);
  const [webResults, setWebResults] = useState<WebResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [featuredBooks, setFeaturedBooks] = useState<SearchResult[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedBooks() {
      setIsFeaturedLoading(true);
      try {
        const gutenbergBooks = await fetchGutenbergBooks();
        setFeaturedBooks(shuffleArray(gutenbergBooks.slice(0, 20)));
      } catch (error) {
        console.error("Failed to load featured books:", error);
        setFeaturedBooks([]);
      } finally {
        setIsFeaturedLoading(false);
      }
    }
    loadFeaturedBooks();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query) {
      setPrimaryResults([]);
      setWebResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const webSearchPromise = fetch(`/api/brave-search?q=${encodeURIComponent(query)}`).then(res => res.json());
      const gutenbergPromise = fetchGutenbergBooks(query);

      const [webData, gutenbergData] = await Promise.allSettled([webSearchPromise, gutenbergPromise]);
      
      if (webData.status === 'fulfilled' && !webData.value.error) {
        setWebResults(webData.value || []);
      } else {
        console.error("Web search failed:", webData.status === 'rejected' ? webData.reason : webData.value.error);
        setWebResults([]);
      }
      
      if (gutenbergData.status === 'fulfilled') {
        setPrimaryResults(gutenbergData.value || []);
      } else {
        console.error("Gutenberg search failed:", gutenbergData.reason);
        setPrimaryResults([]);
      }

    } catch (error) {
      console.error("An error occurred during search:", error);
      setPrimaryResults([]);
      setWebResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderPrimaryResults = () => {
    if (primaryResults.length === 0) {
       return (
        <Card className="border-border/50 bg-card text-center col-span-full">
            <CardHeader>
              <div className="mx-auto bg-input rounded-full p-3 w-fit">
                <SignalZero className="h-8 w-8 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="font-headline text-lg text-accent/80">
                NO_PRIMARY_RESULTS
              </CardTitle>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                No data streams in the primary network match the provided signature.
              </p>
            </CardContent>
          </Card>
      );
    }
    return (
      <>
        {primaryResults.map((book, index) => (
          <SearchResultCard
            key={`${book.source}-${book.id}-${index}`}
            book={book}
          />
        ))}
      </>
    );
  };
  
  const renderWebResults = () => {
     if (webResults.length === 0) return null;

      return (
        <section className="col-span-full">
            <h2 className="font-headline text-lg text-accent/80 mb-4 border-b border-dashed border-border pb-2">
                // WEB_FALLBACK_RESULTS
            </h2>
            <Card className="border-border/50 bg-card">
                <CardHeader>
                    <CardTitle className="font-headline text-accent/80">External Links Found</CardTitle>
                    <CardDescription>
                        The following are unverified links from Brave Search.
                        TXT and HTML will open in the reader. PDFs will open in a new tab.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {webResults.map((result, index) => {
                            const filetype = getFiletypeFromUrl(result.link);
                            const isReadableInApp = filetype === 'txt' || filetype === 'html';
                            
                            const linkHref = isReadableInApp 
                                ? `/read?source=web&url=${encodeURIComponent(result.link)}&title=${encodeURIComponent(result.title)}`
                                : result.link;
                            
                            const linkProps = isReadableInApp 
                                ? {}
                                : { target: "_blank", rel: "noopener noreferrer" };

                            const Wrapper = isReadableInApp ? Link : 'a';

                            return (
                                <li key={index} className="rounded-md border border-border/30 p-4 transition-colors hover:bg-input/50">
                                    <Wrapper href={linkHref} {...linkProps} className="group">
                                        <div className="flex items-start gap-4">
                                            <FiletypeIcon type={filetype} />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-foreground group-hover:text-accent group-hover:underline">
                                                        {result.title}
                                                    </p>
                                                    <Badge variant="outline" className="border-accent/50 text-accent/80 text-xs">
                                                        {filetype.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground/70 mt-2 truncate group-hover:text-accent/80">
                                                    {result.link}
                                                </p>
                                            </div>
                                        </div>
                                    </Wrapper>
                                </li>
                            );
                        })}
                    </ul>
                </CardContent>
            </Card>
        </section>
      );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8 col-span-full">
          <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
          <p className="ml-4 text-muted-foreground">
            Querying transmission nodes...
          </p>
        </div>
      );
    }
    
    if (hasSearched) {
       return (
        <>
          <section className="col-span-full">
            <h2 className="font-headline text-lg text-accent/80 mb-4 border-b border-dashed border-border pb-2">
              // PRIMARY_ARCHIVE_RESULTS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {renderPrimaryResults()}
            </div>
          </section>
          {renderWebResults()}
        </>
      );
    }

    // Default view: Featured books
    return (
      <section className="col-span-full">
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

      <CommandSearch onSearch={handleSearch} />

      <div className="grid grid-cols-1 gap-8">
        {renderContent()}
      </div>
    </div>
  );
}
