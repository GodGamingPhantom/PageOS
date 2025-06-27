'use client';
import { useEffect, useState } from 'react';
import { addBookToLibrary, getLibraryBook, removeBookFromLibrary, updateBookProgress, generateBookId } from '@/services/userData';
import { useToast } from './use-toast';

export default function useBookmark(user: any, book: any, activeSector: number, sectors: string[][]) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const isWebBook = book?.source === 'web';

  useEffect(() => {
    if (!user || !book || isWebBook) {
      setIsBookmarked(false);
      return;
    };
    setIsBookmarkLoading(true);
    const bookId = generateBookId(book);
    getLibraryBook(user.uid, bookId).then(lb => {
      setIsBookmarked(!!lb);
      if (lb?.lastReadSector && lb.lastReadSector < sectors.length) {
        // We don't automatically jump to the bookmarked sector here
        // to avoid disorienting the user. Progress is saved in the background.
      }
    }).finally(() => setIsBookmarkLoading(false));
  }, [user, book, isWebBook, sectors.length]);

  useEffect(() => {
    if (!isBookmarked || isWebBook || !book || !user || sectors.length === 0) return;
    const timeout = setTimeout(() => {
      const bookId = generateBookId(book);
      updateBookProgress(user.uid, bookId, {
        lastReadSector: activeSector,
        progress: sectors.length > 0 ? ((activeSector + 1) / sectors.length) * 100 : 0
      });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [activeSector, book, isBookmarked, isWebBook, sectors, user]);

  const toggleBookmark = async () => {
    if (!user || !book || isWebBook) {
      if (isWebBook) {
        toast({
          variant: "destructive",
          title: "Cannot Bookmark Web Content",
          description: "Saving pages from the web is not currently supported.",
        });
      }
      return;
    };
    setIsBookmarkLoading(true);
    const bookId = generateBookId(book);
    try {
      if (isBookmarked) {
        await removeBookFromLibrary(user.uid, bookId);
        setIsBookmarked(false);
        toast({ title: "Bookmark Removed" });
      } else {
        await addBookToLibrary(user.uid, book);
        setIsBookmarked(true);
        toast({ title: "Bookmarked!", description: "Your progress will now be saved." });
      }
    } catch (error) {
       toast({
          variant: "destructive",
          title: "Sync Error",
          description: "Could not save bookmark. Please try again.",
        });
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  return { isBookmarked, isWebBook, isBookmarkLoading, toggleBookmark };
}
