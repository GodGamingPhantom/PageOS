'use client';

import { useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import type { SearchResult } from '@/adapters/sourceManager';
import {
  addBookToLibrary,
  getLibraryBook,
  removeBookFromLibrary,
  updateBookProgress,
  generateBookId
} from '@/services/userData';
import { useToast } from '@/hooks/use-toast';

export default function useBookmark(
  user: User | null,
  book: SearchResult | null,
  activeSector: number,
  sectors: string[][]
) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const { toast } = useToast();
  
  const isWebBook = book?.source === 'web';
  const bookId = book ? generateBookId(book) : null;

  useEffect(() => {
    if (!user || !bookId || isWebBook) {
        setIsBookmarked(false);
        return;
    };

    setIsBookmarkLoading(true);
    getLibraryBook(user.uid, bookId)
      .then(libraryBook => {
        setIsBookmarked(!!libraryBook);
      })
      .catch(console.error)
      .finally(() => setIsBookmarkLoading(false));

  }, [user, bookId, isWebBook]);
  
  useEffect(() => {
    if (!user || !bookId || !isBookmarked || sectors.length === 0) return;

    const handler = setTimeout(() => {
      const progress = {
        percentage: ((activeSector + 1) / sectors.length) * 100,
        lastReadSector: activeSector,
      };
      updateBookProgress(user.uid, bookId, progress).catch(console.error);
    }, 1500);

    return () => clearTimeout(handler);
  }, [activeSector, sectors.length, user, bookId, isBookmarked]);

  const toggleBookmark = useCallback(async () => {
    if (!user || !book || !bookId || isWebBook) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save books to your library.",
        variant: 'destructive',
      });
      return;
    }
    
    setIsBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await removeBookFromLibrary(user.uid, bookId);
        setIsBookmarked(false);
        toast({ title: 'Removed from Archive' });
      } else {
        await addBookToLibrary(user.uid, book);
        setIsBookmarked(true);
        toast({ title: 'Saved to Archive' });
      }
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
      toast({
        title: 'Error',
        description: 'Could not update your library. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBookmarkLoading(false);
    }
  }, [isBookmarked, user, book, bookId, isWebBook, toast]);

  return { isBookmarked, isBookmarkLoading, isWebBook, toggleBookmark };
}
