
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { fetchBookContent, SearchResult } from '@/adapters/sourceManager';
import { Button } from '@/components/ui/button';
import { Bookmark, ChevronLeft, ChevronRight, LoaderCircle, Menu, Settings, AlertTriangle } from 'lucide-react';

function Reader() {
  const searchParams = useSearchParams();
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = searchParams.get('title') || 'Untitled';
  const source = searchParams.get('source')?.toUpperCase() || 'UNKNOWN';
  const id = searchParams.get('id') || '0';

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      const bookData = Object.fromEntries(searchParams.entries());
      
      const book: Partial<SearchResult> = {
        id: bookData.id,
        source: bookData.source as any,
        title: bookData.title,
        authors: bookData.authors,
      };

      if (book.source === 'gutendex' && bookData.formats) {
        (book as any).formats = JSON.parse(bookData.formats);
      } else if (book.source === 'openLibrary' && bookData.edition) {
        (book as any).edition = bookData.edition;
      } else if (book.source === 'standardEbooks' && bookData.epub) {
        (book as any).epub = bookData.epub;
      } else if (book.source === 'wikisource' && bookData.pageid) {
        (book as any).pageid = parseInt(bookData.pageid);
      }

      if (!book.source) {
        setError("Source parameter is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const bookContent = await fetchBookContent(book as SearchResult);
        if (typeof bookContent === 'string') {
          setContent(bookContent);
        } else {
          setError('EPUB reader not implemented. Cannot display content from this source.');
          setContent(null);
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'Failed to load book content.');
        setContent(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [searchParams]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col flex-1 justify-center items-center gap-4">
          <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
          <p>Rendering Transmission...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col flex-1 justify-center items-center gap-4 text-destructive">
          <AlertTriangle className="h-8 w-8" />
          <p className="font-headline">TRANSMISSION_ERROR</p>
          <p className="text-sm text-muted-foreground max-w-md text-center">{error}</p>
        </div>
      );
    }
    if (content) {
      return <pre className="whitespace-pre-wrap font-reader text-lg leading-relaxed text-foreground/90">{content}</pre>;
    }
    return <div className="flex-1 justify-center items-center"><p>No content to display.</p></div>;
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] animate-fade-in">
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-2 border-b border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-4 w-4" /></Button>
            <span>{`TRANSMISSION > ${source} > ID_${id}`}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon"><Bookmark className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 md:p-16 lg:p-24 flex flex-col">
          <div className="mb-8 font-body text-sm text-accent/80 space-y-1">
            <p>&gt;&gt;&gt; Transmission Link Established: "{title}"</p>
            <p>&gt;&gt;&gt; Rendering content...</p>
          </div>
          {renderContent()}
        </main>

        <footer className="p-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <div className="text-center text-xs text-muted-foreground/50 mt-1">Memory Stream Active...</div>
            <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center gap-4 bg-background text-foreground">
        <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
        <span>Initializing Memory Stream...</span>
      </div>
    }>
      <Reader />
    </Suspense>
  );
}
