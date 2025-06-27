
"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TOCModal({
  toc,
  activeSector,
  onSelect,
  onClose,
}: {
  toc: { title: string; sectorIndex: number }[];
  activeSector: number;
  onSelect: (sectorIndex: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md mx-auto p-6 bg-card rounded-md shadow-xl border border-border">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
          <h2 className="font-headline text-accent text-sm uppercase tracking-wide">Memory Map</h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto space-y-1 text-sm">
          {toc.length === 0 ? (
            <p className="text-muted-foreground text-xs">No chapters found.</p>
          ) : (
            toc.map(({ title, sectorIndex }, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(sectorIndex);
                  onClose();
                }}
                className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                  sectorIndex === activeSector
                    ? "bg-accent/20 text-accent"
                    : "hover:bg-accent/10 hover:text-accent"
                }`}
              >
                {title}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
