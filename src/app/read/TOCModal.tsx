'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

type TOCEntry = {
  title: string;
  sectorIndex: number;
};

interface TOCModalProps {
  toc: TOCEntry[];
  activeSector: number;
  onClose: () => void;
  onSelect: (sectorIndex: number) => void;
}

export default function TOCModal({ toc, activeSector, onClose, onSelect }: TOCModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ ease: 'circOut', duration: 0.3 }}
          className="bg-card border border-border/50 rounded-lg w-full max-w-md h-[70vh] flex flex-col relative shadow-accent-glow"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
            <h2 className="font-headline text-lg text-accent">TABLE OF CONTENTS</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </header>
          <ScrollArea className="flex-1">
            <ul className="p-4 space-y-1">
              {toc.map((entry, index) => (
                <li key={index}>
                  <button
                    onClick={() => onSelect(entry.sectorIndex)}
                    className={`w-full text-left p-2 rounded-md transition-colors text-sm ${
                      activeSector >= entry.sectorIndex && (toc[index + 1] ? activeSector < toc[index + 1].sectorIndex : true)
                        ? 'bg-accent/20 text-accent'
                        : 'text-muted-foreground hover:bg-input hover:text-foreground'
                    }`}
                  >
                    {entry.title}
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
