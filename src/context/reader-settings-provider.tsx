"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { SourceKey } from '@/adapters/sourceManager';

export type ReadingMode = "scroll" | "paged";
export type SourceSettings = Record<SourceKey, boolean>;

type ReaderSettings = {
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  autoScroll: boolean;
  setAutoScroll: (value: boolean) => void;
  sourceSettings: SourceSettings;
  toggleSource: (sourceKey: SourceKey) => void;
};

const ReaderSettingsContext = createContext<ReaderSettings | undefined>(undefined);

const defaultSourceSettings: SourceSettings = {
  gutendex: true,
  standardEbooks: true,
  openLibrary: true,
  wikisource: true,
  manybooks: true,
};

export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [readingMode, setReadingMode] = useState<ReadingMode>('scroll');
  const [autoScroll, setAutoScroll] = useState(false);
  const [sourceSettings, setSourceSettings] = useState<SourceSettings>(defaultSourceSettings);
  
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
  
  const toggleSource = useCallback((sourceKey: SourceKey) => {
    setSourceSettings(prev => {
      const newSettings = { ...prev, [sourceKey]: !prev[sourceKey] };
      try {
        localStorage.setItem('pageos-source-settings', JSON.stringify(newSettings));
      } catch (error) {
        console.warn(`Error setting source settings in localStorage: ${error}`);
      }
      return newSettings;
    });
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
      const storedSources = localStorage.getItem('pageos-source-settings');
      if (storedSources) {
        setSourceSettings(JSON.parse(storedSources));
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
    sourceSettings,
    toggleSource,
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
