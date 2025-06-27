'use client';
import { useState, useEffect, useMemo } from 'react';
import { fetchBookContent, SearchResult } from '@/adapters/sourceManager';
import { fetchWebBookContent } from '@/adapters/web';
import { URLSearchParams } from 'url';

export default function useBookLoader(searchParams: URLSearchParams) {
  const [book, setBook] = useState<SearchResult | {source:'web',id:string,title:string,authors:string} | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      const src = searchParams.get('source');
      try {
        if (src === 'web') {
          const url = searchParams.get('url')!;
          const title = searchParams.get('title')!;
          setBook({ source:'web', id:url, title, authors:'Web Source' });
          const webContent = await fetchWebBookContent(url);
          setContent(webContent || '');
        } else {
          const bookData = Object.fromEntries(searchParams.entries());
          const parsedBook: SearchResult = {
            id: bookData.id!, source: bookData.source! as any, title: bookData.title!, authors: bookData.authors!, formats: JSON.parse(bookData.formats!),
          };
          setBook(parsedBook);
          const bookContent = await fetchBookContent(parsedBook);
          setContent(typeof bookContent === 'string' ? bookContent : '');
        }
      } catch(e:any) {
        setError(e.message || 'Load failed');
      } finally { setLoading(false); }
    })();
  }, [searchParams]);

  const { sectors, toc } = useMemo(() => {
    if (!content) return { sectors: [], toc: [] };
    const paras = content.split(/\n\s*\n/).filter(p => p.trim());
    const secs: string[][] = [];
    const tocItems: {title:string, sectorIndex:number}[] = [];
    const SECTOR_SIZE = 4;
    for (let i = 0; i < paras.length; i += SECTOR_SIZE) {
        const block = paras.slice(i, i + SECTOR_SIZE);
        const heading = block.find(b =>
          /^chapter\s+\d+/i.test(b.trim()) ||
          /^CHAPTER\b/i.test(b.trim()) ||
          /^[IVXLCDM]+\.\s/i.test(b.trim()) ||
          /^PART\s+[A-Z]+/i.test(b.trim())
        );
        if (heading) tocItems.push({ title: heading.trim().split('\n')[0], sectorIndex: secs.length });
        secs.push(block);
    }
    return { sectors: secs, toc: tocItems };
  }, [content]);

  return { book, sectors, toc, isWebBook: book?.source === 'web', isLoading, error };
}
