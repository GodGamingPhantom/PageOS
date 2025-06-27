'use client';
import { useEffect, useState, useMemo } from 'react';
import { fetchBookContent, SearchResult } from '@/adapters/sourceManager';
import { fetchWebBookContent } from '@/adapters/web';

export default function useBookLoader(searchParams: URLSearchParams) {
  const [book, setBook] = useState<any>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const source = searchParams.get('source');
        let loadedContent: string | Blob | null = null;
        let parsedBook: SearchResult | { source: 'web'; id: string | null; title: string | null; authors: string; } | null = null;

        if (source === 'web') {
          const url = searchParams.get('url');
          const title = search_params.get('title');
          parsedBook = { source: 'web', id: url, title, authors: 'Web' };
          if (url) {
            loadedContent = await fetchWebBookContent(url);
          }
        } else {
          const bookData = Object.fromEntries(searchParams.entries());
          parsedBook = {
            id: bookData.id!,
            title: bookData.title!,
            source: bookData.source as any,
            authors: bookData.authors || '',
            formats: JSON.parse(bookData.formats || '{}'),
          };
          loadedContent = await fetchBookContent(parsedBook);
        }

        setBook(parsedBook);
        setContent(typeof loadedContent === 'string' ? loadedContent : '');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [searchParams]);

  const { sectors, toc } = useMemo(() => {
    if (!content) return { sectors: [], toc: [] };
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim() !== '');
    const sectors: string[][] = [];
    const toc: { title: string; sectorIndex: number }[] = [];

    for (let i = 0; i < paragraphs.length; i += 4) {
      const sector = paragraphs.slice(i, i + 4);
      const heading = sector.find(p => /^chapter\s+\d+/i.test(p) || /^PART/i.test(p) || /^[IVXLCDM]+\.\s/i.test(p.trim()));
      if (heading) toc.push({ title: heading.trim().split('\n')[0], sectorIndex: sectors.length });
      sectors.push(sector);
    }

    return { sectors, toc };
  }, [content]);

  return {
    book,
    content,
    isLoading,
    error,
    activeSector,
    setActiveSector,
    direction,
    setDirection,
    currentSector: sectors[activeSector],
    sectors,
    toc
  };
}
