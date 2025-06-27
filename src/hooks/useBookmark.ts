'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-provider';
import {
  getLibraryBook, addBookToLibrary, removeBookFromLibrary,
  updateBookProgress, generateBookId
} from '@/services/userData';
import type { SearchResult } from '@/adapters/sourceManager';
import { useToast } from './use-toast';

export default function useBookmark(book:any, sectors:any[]) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBookmarked, setBookmark] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [sectorIndex, setSectorIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!book || book.source === 'web' || !user) {
      setBookmark(false);
      setSectorIndex(0);
      return;
    };
    setLoading(true);
    const id = generateBookId(book as SearchResult);
    getLibraryBook(user.uid, id).then(lb => {
      setBookmark(!!lb);
      if (lb?.lastReadSector && sectors.length > 0 && lb.lastReadSector < sectors.length) {
          setSectorIndex(lb.lastReadSector);
      } else {
          setSectorIndex(0);
      }
    }).finally(() => setLoading(false));
  }, [book, user, sectors.length]);

  useEffect(() => {
    if (!isBookmarked || !book || !user || sectors.length === 0 || book.source === 'web') return;
    const timeout = setTimeout(() => {
      const id = generateBookId(book as SearchResult);
      updateBookProgress(user.uid, id, {
        percentage: ((sectorIndex + 1) / sectors.length) * 100,
        lastReadSector: sectorIndex
      }).catch(e => console.error("Failed to save progress", e));
    }, 1500);
    return () => clearTimeout(timeout);
  }, [sectorIndex, isBookmarked, book, user, sectors.length]);

  const toggleBookmark = async () => {
    if (!user || !book || book.source === 'web') {
        toast({ variant: "destructive", title: "Action Not Available", description: "Cannot save web results." });
        return;
    };
    setLoading(true);
    const id = generateBookId(book as SearchResult);
    try {
        if (isBookmarked) {
          await removeBookFromLibrary(user.uid, id);
          setBookmark(false);
          toast({ title: "Bookmark Removed" });
        } else {
          await addBookToLibrary(user.uid, book as SearchResult);
          setBookmark(true);
          toast({ title: "Bookmark Added" });
        }
    } catch (e) {
        toast({ variant: "destructive", title: "Sync Error", description: "Could not update bookmark." });
    } finally {
        setLoading(false);
    }
  };

  return {
    activeSector: sectorIndex,
    setSector: setSectorIndex,
    direction,
    setDirection,
    isBookmarked,
    isBookmarkLoading: isLoading,
    toggleBookmark,
  };
}
