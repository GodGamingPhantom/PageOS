'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { fetchBookContent, SearchResult } from '@/adapters/sourceManager';
import { Button } from '@/components/ui/button';
import { Bookmark, LoaderCircle, Settings, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useReaderSettings } from '@/context/reader-settings-provider';
import { useAuth } from '@/context/auth-provider';
import { addBookToLibrary, removeBookFromLibrary, getLibraryBook, updateBookProgress, generateBookId, LibraryBook } from '@/services/userData';
import { useToast } from "@/hooks/use-toast";

const SECTOR_SIZE = 4; // 4 paragraphs per sector

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

  const { user } = useAuth();
  const { toast } = useToast();

  const [libraryBook, setLibraryBook] = useState<LibraryBook | null>(null);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(true);
  
  // New state for S.E.C.T.O.R. system
  const [activeSector, setActiveSector] = useState(0);

  const isBookmarked = !!libraryBook;

  const sectors = useMemo(() => {
    if (!content) return [];
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim() !== '');
    const newSectors = [];
    for (let i = 0; i < paragraphs.length; i += SECTOR_SIZE) {
        newSectors.push(paragraphs.slice(i, i + SECTOR_SIZE));
    }
    return newSectors;
  }, [content]);

  // Load book content
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
  
  // Get bookmark status from Firebase
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

  // Auto-scroll to last read sector
  useEffect(() => {
    if (sectors.length > 0 && libraryBook?.lastReadSector) {
        const sectorElement = document.getElementById(`sector-${libraryBook.lastReadSector}`);
        if (sectorElement) {
            // Using timeout to ensure DOM is fully ready
            setTimeout(() => {
                sectorElement.scrollIntoView({ behavior: 'auto', block: 'start' });
            }, 100);
        }
    }
  }, [sectors, libraryBook]);

  // Debounced progress update to Firebase
  useEffect(() => {
    if (!isBookmarked || !user || !book || sectors.length === 0) return;

    const handler = setTimeout(() => {
        const bookId = generateBookId(book);
        const percentage = sectors.length > 0 ? (activeSector / (sectors.length -1)) * 100 : 0;
        updateBookProgress(user.uid, bookId, {
            percentage: Math.min(100, percentage),
            lastReadSector: activeSector
        }).catch(e => console.error("Failed to save progress", e));
    }, 1500);

    return () => clearTimeout(handler);
  }, [activeSector, book, user, isBookmarked, sectors.length]);

  // Set up IntersectionObserver to track active sector
  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectorIndex = Number(entry.target.getAttribute('data-sector-index'));
                    setActiveSector(sectorIndex);
                }
            });
        },
        { root: mainRef.current, threshold: 0.5 }
    );

    const sectorElements = mainRef.current?.querySelectorAll('[data-sector-index]');
    if (sectorElements) {
        sectorElements.forEach(el => observer.observe(el));
    }

    return () => {
        if (sectorElements) {
            sectorElements.forEach(el => observer.unobserve(el));
        }
    };
  }, [sectors]); // Re-run when sectors are ready

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
    if (sectors.length > 0) {
      return sectors.map((sector, index) => (
        <motion.div
            key={index}
            id={`sector-${index}`}
            data-sector-index={index}
            className="sector-frame group relative my-12 rounded-lg border border-border/20 p-4 md:p-6 bg-card/50 transition-shadow duration-300 hover:border-accent/50 hover:box-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
        >
            <div className="sector-header font-headline text-xs text-accent/80 mb-4">
                ▶ SECTOR {String(index + 1).padStart(4, '0')} ▍
            </div>
            <div className="sector-body space-y-4 font-reader text-base leading-relaxed text-foreground/90">
                {sector.map((para, pi) => (
                    <p key={pi} className="sector-paragraph">{para.trim()}</p>
                ))}
            </div>
            <div className="sector-footer text-[10px] text-muted-foreground/50 mt-6">
                MEM.STREAM ▍ DECODING {((index + 1) / sectors.length * 100).toFixed(1)}%
            </div>
        </motion.div>
      ));
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

        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-8 md:px-16 lg:px-24 xl:px-32 2xl:px-48 flex flex-col items-center">
            <div className="w-full max-w-3xl">
                <div className="my-8 font-body text-sm text-accent/80 space-y-1">
                    <p>&gt;&gt;&gt; Transmission Link Established: "{book?.title || '...'}"</p>
                    <p>&gt;&gt;&gt; Rendering S.E.C.T.O.R. stream...</p>
                </div>
                {renderContent()}
            </div>
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
