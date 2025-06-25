"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

export type ReadingMode = "scroll" | "paged";

type ReaderSettings = {
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  autoScroll: boolean;
  setAutoScroll: (value: boolean) => void;
};

const ReaderSettingsContext = createContext<ReaderSettings | undefined>(undefined);

export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [readingMode, setReadingMode] = useState<ReadingMode>('scroll');
  const [autoScroll, setAutoScroll] = useState(false);
  
  const handleSetReadingMode = useCallback((mode: ReadingMode) => {
    try {
      localStorage.setItem('pageos-reading-mode', mode);
    } catch (error) {
      console.warn(`Error setting reading mode in localStorage: ${error}`);
    }
    setReadingMode(mode);
  }, []);

  const handleSetAutoScroll = useCallback((value: boolean) => {
    try {
      localStorage.setItem('pageos-autoscroll', JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting autoscroll in localStorage: ${error}`);
    }
    setAutoScroll(value);
  }, []);

  useEffect(() => {
    try {
      const storedMode = localStorage.getItem('pageos-reading-mode') as ReadingMode | null;
      if (storedMode) {
        setReadingMode(storedMode);
      }
      const storedAutoScroll = localStorage.getItem('pageos-autoscroll');
      if (storedAutoScroll) {
        setAutoScroll(JSON.parse(storedAutoScroll));
      }
    } catch (error) {
      console.warn(`Error reading settings from localStorage: ${error}`);
    }
  }, []);


  const value = {
    readingMode,
    setReadingMode: handleSetReadingMode,
    autoScroll,
    setAutoScroll: handleSetAutoScroll,
  };

  return (
    <ReaderSettingsContext.Provider value={value}>
      {children}
    </ReaderSettingsContext.Provider>
  );
}

export const useReaderSettings = () => {
  const context = useContext(ReaderSettingsContext);
  if (context === undefined) {
    throw new Error('useReaderSettings must be used within a ReaderSettingsProvider');
  }
  return context;
};
