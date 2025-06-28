
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SearchResult, MappedGutenbergBook } from '@/adapters/sourceManager';
import { fetchBookContent } from '@/adapters/sourceManager';
import { fetchWebBookContent } from '@/adapters/web';
import { getLibraryBook } from '@/services/userData';
import { useAuth } from '@/context/auth-provider';
import { generateBookId } from '@/services/userData';

export default function useBookLoader(searchParams: URLSearchParams) {
  const { user } = useAuth();
  const [book, setBook] = useState<SearchResult | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const loadBookData = async () => {
      setIsLoading(true);
      setError(null);

      const source = searchParams.get('source');
      const id = searchParams.get('id');
      const title = searchParams.get('title');
      const url = searchParams.get('url');

      if (!source || !title) {
        setError('Missing required book metadata.');
        setIsLoading(false);
        return;
      }

      try {
        let parsedBook: SearchResult;
        let loadedContent: string | Blob | null = null;

        if (source === 'web' && url) {
          parsedBook = {
            id: url,
            title: title,
            source: 'web',
            authors: searchParams.get('authors') || 'Web Source',
            url: url,
            formats: {},
          };
          loadedContent = await fetchWebBookContent(url);
          if (!loadedContent) throw new Error("No readable content extracted from .txt file");
        } 
        
        else if (source === 'gutendex' && id) {
          const formatsString = searchParams.get('formats');
          if (!formatsString) throw new Error("Gutenberg book is missing 'formats' data.");
          
          parsedBook = {
            id: id,
            title: title,
            source: 'gutendex',
            authors: searchParams.get('authors') || 'Unknown',
            formats: JSON.parse(formatsString),
          };
          loadedContent = await fetchBookContent(parsedBook as MappedGutenbergBook);
        } 
        
        else {
          throw new Error(`Unsupported book source: ${source}`);
        }

        setBook(parsedBook);
        setContent(typeof loadedContent === 'string' ? loadedContent : null);

        if (user && parsedBook) {
          const bookId = generateBookId(parsedBook);
          const libraryBook = await getLibraryBook(user.uid, bookId);
          if (libraryBook?.lastReadSector !== undefined) {
            setActiveSector(libraryBook.lastReadSector);
          }
        }

      } catch (e) {
        console.error("Book loading error:", e);
        setError(e instanceof Error ? e.message : 'Unknown book load error.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookData();
  }, [searchParams, user]);

  const { sectors, toc } = useMemo(() => {
    if (!content) return { sectors: [], toc: [] };

    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim() !== '');
    const sectors: string[][] = [];
    const toc: { title: string; sectorIndex: number }[] = [];
    const SECTOR_SIZE = 4;

    const chapterRegex = /^(chapter|part|section)\s+[\divxclmk]+\.?/i;
    const allCaps = /^[A-Z\s]{6,}$/;

    for (let i = 0; i < paragraphs.length; i += SECTOR_SIZE) {
      const chunk = paragraphs.slice(i, i + SECTOR_SIZE);
      const heading = chunk.find(p => chapterRegex.test(p) || allCaps.test(p));
      if (heading) toc.push({ title: heading.trim(), sectorIndex: sectors.length });
      sectors.push(chunk);
    }

    if (toc.length === 0 && sectors.length > 10) {
      for (let i = 0; i < sectors.length; i += 10) {
        toc.push({ title: `Sector ${i + 1}`, sectorIndex: i });
      }
    }

    return { sectors, toc };
  }, [content]);

  return {
    book,
    isLoading,
    error,
    toc,
    sectors,
    currentSector: sectors[activeSector],
    activeSector,
    setActiveSector,
    direction,
    setDirection,
  };
}
