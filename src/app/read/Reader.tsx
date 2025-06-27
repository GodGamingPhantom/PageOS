'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, List, Bookmark, Settings, LoaderCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TOCModal from './TOCModal';
import { useAuth } from '@/context/auth-provider';
import useBookLoader from '@/hooks/useBookLoader';
import useBookmark from '@/hooks/useBookmark';
import ReaderControls from '@/components/ReaderControls';

const Reader = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const {
    book,
    isLoading,
    error,
    toc,
    sectors,
    currentSector,
    activeSector,
    setActiveSector,
    direction,
    setDirection
  } = useBookLoader(searchParams);

  const {
    isBookmarked,
    isWebBook,
    isBookmarkLoading,
    toggleBookmark
  } = useBookmark(user, book, activeSector, sectors);

  const [showTOC, setShowTOC] = useState(false);

  const paginate = (delta: number) => {
    const newIndex = activeSector + delta;
    if (newIndex >= 0 && newIndex < sectors.length) {
      setDirection(delta);
      setActiveSector(newIndex);
    }
  };

  const header = (
    <header className="flex items-center justify-between p-2 border-b border-border/50 text-xs text-muted-foreground h-[41px] shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="truncate">
          {isLoading ? 'LOADING...' : error ? 'ERROR' : `TRANSMISSION > ${book?.source.toUpperCase()} > ID_${book?.id.slice(-20)}`}
        </span>
      </div>
      {!isLoading && !error && (
        <div className="flex items-center gap-2">
          {toc.length > 0 && (
            <Button variant="ghost" size="icon" onClick={() => setShowTOC(true)} aria-label="Table of Contents">
              <List className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleBookmark}
            disabled={isBookmarkLoading || !user || isWebBook}
            title={isWebBook ? "Cannot bookmark web results" : "Bookmark this transmission"}
          >
            {isBookmarkLoading
              ? <LoaderCircle className="h-4 w-4 animate-spin" />
              : <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-accent text-accent' : ''}`} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => router.push('/settings')} aria-label="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      )}
    </header>
  );

  const sectorContent = currentSector ? (
    <div className="sector relative">
      <div className="sector-header font-headline text-xs text-accent/80 mb-4">
        ▶ SECTOR {String(activeSector + 1).padStart(4, '0')} ▍
      </div>
      <div className="sector-body space-y-4 font-reader text-base leading-relaxed text-foreground/90">
        {currentSector.map((p, i) => (
          <p key={i}>{p.trim()}</p>
        ))}
      </div>
      <div className="sector-footer text-[10px] text-muted-foreground/50 mt-6">
        MEM.STREAM ▍ DECODING {((activeSector + 1) / sectors.length * 100).toFixed(1)}%
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      No content to display.
    </div>
  );

  if (isLoading) return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] items-center justify-center gap-4">
      <LoaderCircle className="h-6 w-6 animate-spin text-accent" />
      <p>Rendering Transmission...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] items-center justify-center text-destructive">
      <AlertTriangle className="h-8 w-8" />
      <p className="font-headline">TRANSMISSION_ERROR</p>
      <p className="text-sm text-muted-foreground max-w-md text-center">{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col overflow-x-hidden h-[calc(100vh-3.5rem)]">
      {header}
      <main className="flex-1 overflow-y-auto relative px-4 pt-12 pb-32">
        <div className="max-w-3xl mx-auto w-full min-h-[calc(100vh-12rem)] relative isolate">
          <div className="invisible">
              {sectorContent}
          </div>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={activeSector}
              custom={direction}
              initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction < 0 ? '100%' : '-100%', opacity: 0 }}
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0"
            >
              {sectorContent}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {!isLoading && !error && (
        <div className="fixed bottom-4 left-0 right-0 z-50 pointer-events-none">
          <div className="flex justify-center pointer-events-auto">
            <ReaderControls
              onPrev={() => paginate(-1)}
              onNext={() => paginate(1)}
              isFirst={activeSector === 0}
              isLast={activeSector >= sectors.length - 1}
            />
          </div>
        </div>
      )}

      {showTOC && (
        <TOCModal
          toc={toc}
          activeSector={activeSector}
          onClose={() => setShowTOC(false)}
          onSelect={(sectorIndex) => {
            setDirection(sectorIndex > activeSector ? 1 : -1);
            setActiveSector(sectorIndex);
            setShowTOC(false);
          }}
        />
      )}
    </div>
  );
};

export default Reader;
