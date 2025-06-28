'use client';

import { Shield } from 'lucide-react';

const legalLines = [
  'PAGE.OS is a decentralized interface for exploring publicly available web texts.',
  'It does not host, store, or modify any copyrighted content.',
  'All content accessed through this platform is fetched via open web sources, and any transmission of copyrighted material is purely incidental to external indexing.',
  'We are not the copyright holders of any book or media shown.',
  'PAGE.OS does not condone piracy or unauthorized distribution of intellectual property.',
  'If you believe your rights have been infringed, please contact the origin domain directly.',
  'This system acts purely as a transmission node — akin to a search engine — designed for archival exploration and educational access.',
  'No legal liability is assumed or implied.',
];

export function LegalSidebar() {
  return (
    <aside className="sticky top-20 h-[calc(100vh-6rem)] bg-card/70 backdrop-blur-sm ring-1 ring-accent/20 rounded-lg overflow-hidden border border-border/50">
      <div className="absolute inset-0 pointer-events-none bg-scanner bg-repeat animate-scanner z-0 opacity-50" />
      <div className="relative z-10 p-4 h-full flex flex-col">
        <h2 className="font-headline text-sm text-accent/80 tracking-wider animate-pulse flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>▍ LEGAL.TRANSMISSION</span>
        </h2>
        <div className="mt-4 space-y-3 text-xs text-muted-foreground/70 overflow-y-auto pr-2">
          {legalLines.map((line, index) => (
            <p key={index} data-line-id={index} className="leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
}
