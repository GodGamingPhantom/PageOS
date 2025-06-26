'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchBookContent, SearchResult } from '@/adapters/sourceManager';
import { Button } from '@/components/ui/button';
import { Bookmark, LoaderCircle, Settings, AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { addBookToLibrary, removeBookFromLibrary, getLibraryBook, updateBookProgress, generateBookId, LibraryBook } from '@/services/userData';
import { useToast } from "@/hooks/use-toast";
import { useReaderSettings } from '@/context/reader-settings-provider';

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

    return book as SearchResult;
}

const ReaderControls = ({ onPrev, onNext, isFirst, isLast }: { onPrev: () => void, onNext: () => void, isFirst: boolean, isLast: boolean }) => {
  return (
    <div className="fixed bottom-4 right-4 z-30 flex gap-2">
      <Button onClick={onPrev} disabled={isFirst} variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm transition-opacity disabled:opacity-0">
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button onClick={onNext} disabled={isLast} variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm transition-opacity disabled:opacity-0">
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
};


function Reader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [book, setBook] = useState<SearchResult | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [libraryBook, setLibraryBook] = useState<LibraryBook | null>(null);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(true);
  
  const [activeSector, setActiveSector] = useState(0);
  const [direction, setDirection] = useState(0);

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

  // Navigation logic
  const paginate = (newDirection: number) => {
    let newIndex = activeSector + newDirection;
    if (newIndex >= 0 && newIndex < sectors.length) {
      setDirection(newDirection);
      setActiveSector(newIndex);
    }
  };
  
  const goToNextSector = () => paginate(1);
  const goToPrevSector = () => paginate(-1);
  
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
        .then((lb) => {
            setLibraryBook(lb);
            if (lb?.lastReadSector && lb.lastReadSector < sectors.length) {
                setActiveSector(lb.lastReadSector);
            }
        })
        .finally(() => setIsBookmarkLoading(false));

  }, [user, book, sectors.length]);

  // Debounced progress update to Firebase
  useEffect(() => {
    if (!isBookmarked || !user || !book || sectors.length === 0) return;

    const handler = setTimeout(() => {
        const bookId = generateBookId(book);
        const percentage = sectors.length > 0 ? ((activeSector + 1) / sectors.length) * 100 : 0;
        updateBookProgress(user.uid, bookId, {
            percentage: Math.min(100, percentage),
            lastReadSector: activeSector
        }).catch(e => console.error("Failed to save progress", e));
    }, 1500);

    return () => clearTimeout(handler);
  }, [activeSector, book, user, isBookmarked, sectors.length]);


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
  
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
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
    const currentSector = sectors[activeSector];
    if (!currentSector) return <div className="flex flex-1 justify-center items-center"><p>No content to display.</p></div>;
    
    return (
        <AnimatePresence initial={false} custom={direction}>
            <motion.div
                key={activeSector}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                }}
                className="absolute inset-0 p-6 sm:p-8 md:p-12"
            >
                <div className="mx-auto w-full max-w-4xl h-full flex flex-col justify-center">
                    <div>
                      <div className="sector-header font-headline text-xs text-accent/80 mb-4">
                          ▶ SECTOR {String(activeSector + 1).padStart(4, '0')} ▍
                      </div>
                      <div className="sector-body space-y-4 font-reader text-base leading-relaxed text-foreground/90">
                          {currentSector.map((para, pi) => (
                              <p key={pi} className="sector-paragraph">{para.trim()}</p>
                          ))}
                      </div>
                      <div className="sector-footer text-[10px] text-muted-foreground/50 mt-6">
                          MEM.STREAM ▍ DECODING {((activeSector + 1) / sectors.length * 100).toFixed(1)}%
                      </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] animate-fade-in flex-col">
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
          <Button variant="ghost" size="icon" aria-label="Settings" onClick={() => router.push('/settings')}><Settings className="h-4 w-4" /></Button>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {renderContent()}
        <ReaderControls
          onPrev={goToPrevSector}
          onNext={goToNextSector}
          isFirst={activeSector === 0}
          isLast={activeSector === sectors.length - 1}
        />
      </main>
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
