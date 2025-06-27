
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchBookContent, SearchResult } from '@/adapters/sourceManager';
import { fetchWebBookContent } from '@/adapters/web';
import { Button } from '@/components/ui/button';
import { Bookmark, LoaderCircle, Settings, AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, List, X } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { addBookToLibrary, removeBookFromLibrary, getLibraryBook, updateBookProgress, generateBookId, LibraryBook } from '@/services/userData';
import { useToast } from "@/hooks/use-toast";
import TOCModal from './TOCModal';

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
    
    return book as SearchResult;
}

const ReaderControls = ({ onPrev, onNext, isFirst, isLast }: { onPrev: () => void, onNext: () => void, isFirst: boolean, isLast: boolean }) => {
  return (
    <div className="flex justify-center items-center gap-4">
      <Button
        onClick={onPrev}
        disabled={isFirst}
        variant="outline"
        size="icon"
        aria-label="Previous Sector"
        className="h-12 w-12 rounded-full bg-background/50 backdrop-blur-sm border-accent/30 text-accent hover:bg-accent/10 hover:text-accent hover:border-accent/50 disabled:opacity-50"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        onClick={onNext}
        disabled={isLast}
        variant="outline"
        size="icon"
        aria-label="Next Sector"
        className="h-12 w-12 rounded-full bg-background/50 backdrop-blur-sm border-accent/30 text-accent hover:bg-accent/10 hover:text-accent hover:border-accent/50 disabled:opacity-50"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
};

type WebBook = {
  source: 'web';
  id: string; // The URL
  title: string;
  authors: string;
}

function Reader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [book, setBook] = useState<SearchResult | WebBook | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [libraryBook, setLibraryBook] = useState<LibraryBook | null>(null);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  
  const [activeSector, setActiveSector] = useState(0);
  const [direction, setDirection] = useState(0);

  const [showTOC, setShowTOC] = useState(false);

  const isWebBook = book?.source === 'web';
  const isBookmarked = !!libraryBook && !isWebBook;
  
  const { sectors, toc } = useMemo(() => {
    if (!content) return { sectors: [], toc: [] };

    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim() !== '');
    const newSectors = [];
    const newTOC: { title: string; sectorIndex: number }[] = [];

    const SECTOR_SIZE = 4;

    for (let i = 0; i < paragraphs.length; i += SECTOR_SIZE) {
      const sectorParas = paragraphs.slice(i, i + SECTOR_SIZE);

      const heading = sectorParas.find(p =>
        /^chapter\s+\d+/i.test(p.trim()) ||
        /^CHAPTER\b/i.test(p.trim()) ||
        /^[IVXLCDM]+\.\s/i.test(p.trim()) ||
        /^PART\s+[A-Z]+/i.test(p.trim())
      );

      if (heading) {
        newTOC.push({
          title: heading.trim().split('\n')[0],
          sectorIndex: newSectors.length,
        });
      }

      newSectors.push(sectorParas);
    }
    
    return { sectors: newSectors, toc: newTOC };
  }, [content]);

  const paginate = (newDirection: number) => {
    let newIndex = activeSector + newDirection;
    if (newIndex >= 0 && newIndex < sectors.length) {
      setDirection(newDirection);
      setActiveSector(newIndex);
    }
  };
  
  const goToNextSector = () => paginate(1);
  const goToPrevSector = () => paginate(-1);
  
  useEffect(() => {
    const loadBookData = async () => {
      setIsLoading(true);
      setError(null);
      
      const source = searchParams.get('source');
      
      try {
        let currentBook: SearchResult | WebBook | null = null;
        let loadedContent: string | Blob | null = null;

        if (source === 'web') {
            const url = searchParams.get('url');
            const title = searchParams.get('title');
            if (!url || !title) throw new Error("Web book URL or title is missing.");
            
            currentBook = {
                id: url,
                source: 'web',
                title: title,
                authors: 'Source: Web',
            };
            loadedContent = await fetchWebBookContent(url);

        } else {
          currentBook = parseBookFromParams(searchParams);
          if (currentBook) {
            loadedContent = await fetchBookContent(currentBook);
          }
        }

        if (!currentBook) {
          throw new Error("Book data is incomplete or invalid.");
        }
        setBook(currentBook);
        
        if (typeof loadedContent === 'string') {
          setContent(loadedContent);
        } else if (loadedContent) {
           setError('Unsupported format. The reader can only display plain text or scraped HTML content.');
           setContent(null);
        } else {
            throw new Error("Failed to load or parse book content.");
        }

      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred while loading the book.');
        setContent(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookData();
  }, [searchParams]);
  
  useEffect(() => {
    if (!user || !book || isWebBook) {
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

  }, [user, book, sectors.length, isWebBook]);

  useEffect(() => {
    if (!isBookmarked || !user || !book || sectors.length === 0 || isWebBook) return;

    const handler = setTimeout(() => {
        const bookId = generateBookId(book as SearchResult);
        const percentage = sectors.length > 0 ? ((activeSector + 1) / sectors.length) * 100 : 0;
        updateBookProgress(user.uid, bookId, {
            progress: Math.min(100, percentage),
            lastReadSector: activeSector
        }).catch(e => console.error("Failed to save progress", e));
    }, 1500);

    return () => clearTimeout(handler);
  }, [activeSector, book, user, isBookmarked, sectors.length, isWebBook]);


  const handleToggleBookmark = async () => {
    if (!user || !book || isWebBook) {
        toast({
            variant: "destructive",
            title: "Action Not Available",
            description: "Cannot save web results to your library.",
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
            await addBookToLibrary(user.uid, book as SearchResult);
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

  const header = (
    <header className="flex items-center justify-between p-2 border-b border-border/50 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="truncate">{isLoading ? 'LOADING...' : error ? 'ERROR' : `TRANSMISSION > ${book?.source.toUpperCase() || '...'} > ID_${book?.id.slice(-20) || '...'}`}</span>
      </div>
      {!isLoading && !error && (
        <div className="flex items-center gap-2">
          {toc.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Table of Contents"
              onClick={() => setShowTOC(true)}
              title="Table of Contents"
            >
              <List className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Bookmark"
            onClick={handleToggleBookmark}
            disabled={isBookmarkLoading || !user || isWebBook}
            title={isWebBook ? "Cannot bookmark web results" : "Bookmark this transmission"}
          >
            {isBookmarkLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Bookmark className={`h-4 w-4 transition-colors ${isBookmarked ? 'fill-accent text-accent' : ''}`} />
            )}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Settings" onClick={() => router.push('/settings')}><Settings className="h-4 w-4" /></Button>
        </div>
      )}
    </header>
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] animate-fade-in flex-col">
        {header}
        <main className="flex-1 grid place-items-center">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
            <p>Rendering Transmission...</p>
          </div>
        </main>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] animate-fade-in flex-col">
        {header}
        <main className="flex-1 grid place-items-center">
          <div className="flex flex-col items-center gap-4 text-destructive">
            <AlertTriangle className="h-8 w-8" />
            <p className="font-headline">TRANSMISSION_ERROR</p>
            <p className="text-sm text-muted-foreground max-w-md text-center">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  const currentSector = sectors[activeSector];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] animate-fade-in flex-col overflow-x-hidden">
      {header}
  
      <main className="flex-1 overflow-y-auto px-4 pt-8 pb-28">
        <div className="relative w-full max-w-3xl mx-auto">
          <div className="relative">
            {!currentSector ? (
              <div className="flex-1 grid place-items-center">
                <p>No content to display.</p>
              </div>
            ) : (
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
                  className="w-full"
                >
                  <div className="sector w-full">
                    <div className="sector-header font-headline text-xs text-accent/80 mb-4">
                      ▶ SECTOR {String(activeSector + 1).padStart(4, '0')} ▍
                    </div>
                    <div className="sector-body space-y-4 font-reader text-base leading-relaxed text-foreground/90">
                      {currentSector.map((para, pi) => (
                        <p key={pi} className="sector-paragraph">
                          {para.trim()}
                        </p>
                      ))}
                    </div>
                    <div className="sector-footer text-[10px] text-muted-foreground/50 mt-6">
                      MEM.STREAM ▍ DECODING {((activeSector + 1) / sectors.length * 100).toFixed(1)}%
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
  
      <div className="fixed bottom-4 left-0 right-0 z-50 pointer-events-none">
        <div className="w-full flex justify-center pointer-events-auto">
            <ReaderControls
              onPrev={goToPrevSector}
              onNext={goToNextSector}
              isFirst={activeSector === 0}
              isLast={!sectors.length || activeSector === sectors.length - 1}
            />
        </div>
      </div>
  
      {showTOC && (
        <TOCModal
          toc={toc}
          activeSector={activeSector}
          onClose={() => setShowTOC(false)}
          onSelect={(sectorIndex) => {
            setDirection(sectorIndex > activeSector ? 1 : -1);
            setActiveSector(sectorIndex);
          }}
        />
      )}
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
