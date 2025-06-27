'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, Bookmark, ChevronLeft, ChevronRight,
  Settings, List, LoaderCircle, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import TOCModal from './TOCModal';
import useBookLoader from '@/hooks/useBookLoader';
import useBookmark from '@/hooks/useBookmark';

export default function Reader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { book, sectors, toc, isWebBook, isLoading, error } =
    useBookLoader(searchParams);
  const {
    activeSector, direction, isBookmarked, isBookmarkLoading,
    toggleBookmark, setSector, setDirection
  } = useBookmark(book, sectors);

  const [showTOC, setShowTOC] = useState(false);
  const current = sectors[activeSector] || [];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
  };

  const sectorContent = (
      <>
        <div className="text-xs font-headline text-accent/80 mb-4">
            ▶ SECTOR {String(activeSector + 1).padStart(4, '0')} ▍
        </div>
        <div className="space-y-4 font-reader text-base leading-relaxed text-foreground/90">
            {current.map((p, i) => <p key={i}>{p.trim()}</p>)}
        </div>
        <div className="mt-6 text-[10px] text-muted-foreground/50">
            MEM.STREAM ▍ DECODING {((activeSector + 1) / sectors.length * 100).toFixed(1)}%
        </div>
      </>
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
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-x-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between p-2 border-b border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="truncate">
            TRANSMISSION > {book?.source.toUpperCase()} > ID_{book?.id.slice(-20)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {toc.length > 0 && (
            <Button variant="ghost" size="icon" onClick={() => setShowTOC(true)}>
              <List className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost" size="icon"
            disabled={isBookmarkLoading || isWebBook}
            onClick={toggleBookmark}
          >
            {isBookmarkLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> :
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-accent text-accent' : ''}`} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 pt-12 pb-64">
        <div className="relative max-w-3xl mx-auto h-full min-h-[65vh] isolate">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={activeSector}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0"
            >
              <div className="min-h-[65vh] flex flex-col justify-start">
                {sectorContent}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* CONTROLS */}
      <div className="fixed bottom-4 left-0 right-0 z-50 pointer-events-none">
        <div className="flex w-full justify-center pointer-events-auto gap-4">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={() => { if (activeSector > 0) {setDirection(-1); setSector(activeSector - 1);} }} disabled={activeSector === 0}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={() => { if (activeSector < sectors.length - 1) {setDirection(1); setSector(activeSector + 1);} }} disabled={activeSector >= sectors.length - 1}>
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* TOC */}
      {showTOC && (
        <TOCModal
          toc={toc}
          activeSector={activeSector}
          onClose={() => setShowTOC(false)}
          onSelect={(idx) => { setDirection(idx > activeSector ? 1 : -1); setSector(idx); setShowTOC(false); }}
        />
      )}
    </div>
  );
}
