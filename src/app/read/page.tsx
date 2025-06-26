'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, useRef } from 'react';
import { fetchBookContent, SearchResult } from '@/adapters/sourceManager';
import { Button } from '@/components/ui/button';
import { Bookmark, LoaderCircle, Settings, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useReaderSettings } from '@/context/reader-settings-provider';
import { useAuth } from '@/context/auth-provider';
import { addBookToLibrary, removeBookFromLibrary, getLibraryBook, updateBookProgress, generateBookId, LibraryBook } from '@/services/userData';
import { useToast } from "@/hooks/use-toast";

function parseBookFromParams(params: URLSearchParams): SearchResult | null {
    const bookData = Object.fromEntries(params.entries());
    if (!bookData.source || !bookData.id || !bookData.title) return null;

    const book: Partial<SearchResult> = {
        id: bookData.id,
        source: bookData.source as any,
        title: bookData.title,
        authors: bookData.authors,
    };

    if (book.source === 'gutendex' && bookData.formats) (book as any).formats = JSON.parse(bookData.formats);
    else if (book.source === 'openLibrary' && bookData.edition) (book as any).edition = bookData.edition;
    else if (book.source === 'standardEbooks' && bookData.epub) (book as any).epub = bookData.epub;
    else if (book.source === 'wikisource' && bookData.pageid) (book as any).pageid = parseInt(bookData.pageid);
    else if (book.source === 'manybooks' && bookData.cover) (book as any).cover = bookData.cover;

    return book as SearchResult;
}

function Reader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const mainRef = useRef<HTMLElement>(null);
  const [book, setBook] = useState<SearchResult | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { autoScroll } = useReaderSettings();
  const { user } = useAuth();
  const { toast } = useToast();

  const [libraryBook, setLibraryBook] = useState<LibraryBook | null>(null);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(true);
  const [currentProgress, setCurrentProgress] = useState(0);

  const isBookmarked = !!libraryBook;

  useEffect(() => {
    const parsedBook = parseBookFromParams(searchParams);
    if (!parsedBook) {
      setError("Book data is incomplete or invalid.");
      setIsLoading(false);
      return;
    }
    setBook(parsedBook);

    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const bookContent = await fetchBookContent(parsedBook);
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
  
  useEffect(() => {
    if (!user || !book) {
        setLibraryBook(null);
        setIsBookmarkLoading(false);
        return;
    };

    setIsBookmarkLoading(true);
    const bookId = generateBookId(book);
    getLibraryBook(user.uid, bookId)
        .then(setLibraryBook)
        .finally(() => setIsBookmarkLoading(false));

  }, [user, book]);

  useEffect(() => {
    if (libraryBook?.progress && mainRef.current && content) {
        const mainEl = mainRef.current;
        const scrollHeight = mainEl.scrollHeight - mainEl.clientHeight;
        if (scrollHeight > 0) {
            const scrollTop = (libraryBook.progress / 100) * scrollHeight;
            mainEl.scrollTo({ top: scrollTop, behavior: 'auto' });
        }
    }
  }, [libraryBook, content]);

  useEffect(() => {
    let scrollInterval: NodeJS.Timeout | null = null;
    if (autoScroll && content && !isLoading) {
      scrollInterval = setInterval(() => {
        document.querySelector('main')?.scrollBy(0, 1);
      }, 50);
    }
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [autoScroll, content, isLoading]);
  
  useEffect(() => {
    if (!isBookmarked || !user || !book || currentProgress === 0) return;

    const bookId = generateBookId(book);
    const handler = setTimeout(() => {
        updateBookProgress(user.uid, bookId, currentProgress).catch(e => console.error("Failed to save progress", e));
    }, 1500);

    return () => clearTimeout(handler);
  }, [currentProgress, book, user, isBookmarked]);

  const handleScroll = () => {
    if (!mainRef.current || !isBookmarked) return;
    const mainEl = mainRef.current;
    const { scrollTop, scrollHeight, clientHeight } = mainEl;
    
    const totalScrollable = scrollHeight - clientHeight;
    if (totalScrollable <= 0) return;

    const progressPercentage = (scrollTop / totalScrollable) * 100;
    setCurrentProgress(progressPercentage);
  };

  const handleToggleBookmark = async () => {
    if (!user || !book) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to save books to your library.",
        });
        return;
    }

    setIsBookmarkLoading(true);
    
    try {
        if (isBookmarked) {
            const bookId = generateBookId(book);
            await removeBookFromLibrary(user.uid, bookId);
            setLibraryBook(null);
            toast({ title: "Bookmark Removed", description: `"${book.title}" removed from your archive.` });
        } else {
            await addBookToLibrary(user.uid, book);
            const bookId = generateBookId(book);
            const newLibraryBook = await getLibraryBook(user.uid, bookId);
            setLibraryBook(newLibraryBook);
            toast({ title: "Bookmark Added", description: `"${book.title}" saved to your archive.` });
        }
    } catch (error) {
        console.error("Failed to toggle bookmark:", error);
        toast({
            variant: "destructive",
            title: "Sync Error",
            description: "Could not update your archive. Please try again.",
        });
    } finally {
        setIsBookmarkLoading(false);
    }
  };


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
    return <div className="flex flex-1 justify-center items-center"><p>No content to display.</p></div>;
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] animate-fade-in">
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-2 border-b border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="truncate">{`TRANSMISSION > ${book?.source.toUpperCase() || '...'} > ID_${book?.id || '...'}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Bookmark"
              onClick={handleToggleBookmark}
              disabled={isBookmarkLoading || !user}
            >
              {isBookmarkLoading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Bookmark className={`h-4 w-4 transition-colors ${isBookmarked ? 'fill-accent text-accent' : ''}`} />
              )}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Settings"><Settings className="h-4 w-4" /></Button>
          </div>
        </header>

        <main ref={mainRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-8 md:p-16 lg:p-24 flex flex-col">
          <div className="mb-8 font-body text-sm text-accent/80 space-y-1">
            <p>&gt;&gt;&gt; Transmission Link Established: "{book?.title || '...'}"</p>
            <p>&gt;&gt;&gt; Rendering content...</p>
          </div>
          {renderContent()}
        </main>
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
