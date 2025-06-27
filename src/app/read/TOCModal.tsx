'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type Item = { title:string; sectorIndex:number };
type Props = {
  toc: Item[];
  activeSector:number;
  onClose():void;
  onSelect(idx:number):void;
};

export default function TOCModal({ toc, activeSector, onClose, onSelect }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md mx-auto p-6 bg-card rounded-md shadow-xl border border-border">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
          <h2 className="text-sm font-headline text-accent">Table of Contents</h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto space-y-1 text-sm">
          {toc.length === 0 && <p className="text-xs text-muted-foreground p-2">No chapters found.</p>}
          {toc.map(({ title, sectorIndex }, i) => (
            <button
              key={i}
              onClick={() => onSelect(sectorIndex)}
              className={`block w-full text-left p-2 rounded-md transition-colors ${
                sectorIndex === activeSector ? 'bg-accent/10 text-accent' : 'hover:bg-accent/10 hover:text-accent'
              }`}
            >
              {title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
