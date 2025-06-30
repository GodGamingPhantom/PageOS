"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import type { Source } from "@/adapters/sourceManager";

export type SourceSettings = Partial<Record<Source, boolean>>;

type ReaderSettings = {
  autoScroll: boolean;
  setAutoScroll: (value: boolean) => void;
  sourceSettings: SourceSettings;
  toggleSource: (sourceKey: Source) => void;
  showBootAnimation: boolean;
  setShowBootAnimation: (value: boolean) => void;
};

const ReaderSettingsContext = createContext<ReaderSettings | undefined>(undefined);

const defaultSourceSettings: SourceSettings = {
  gutendex: true,
};

export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [autoScroll, setAutoScroll] = useState(false);
  const [sourceSettings, setSourceSettings] = useState<SourceSettings>(defaultSourceSettings);
  const [showBootAnimation, setShowBootAnimation] = useState(true);

  const handleSetAutoScroll = useCallback((value: boolean) => {
    try {
      localStorage.setItem("pageos-autoscroll", JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting autoscroll in localStorage: ${error}`);
    }
    setAutoScroll(value);
  }, []);

  const handleSetShowBootAnimation = useCallback((value: boolean) => {
    try {
      localStorage.setItem("pageos-show-boot-animation", JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting boot animation in localStorage: ${error}`);
    }
    setShowBootAnimation(value);
  }, []);

  const toggleSource = useCallback((sourceKey: Source) => {
    setSourceSettings((prev: SourceSettings) => {
      const newSettings: SourceSettings = {
        ...prev,
        [sourceKey]: !prev[sourceKey],
      };
      try {
        localStorage.setItem("pageos-source-settings", JSON.stringify(newSettings));
      } catch (error) {
        console.warn(`Error saving source settings to localStorage: ${error}`);
      }
      return newSettings;
    });
  }, []);

  useEffect(() => {
    try {
      const storedAutoScroll = localStorage.getItem("pageos-autoscroll");
      if (storedAutoScroll !== null) {
        setAutoScroll(JSON.parse(storedAutoScroll));
      }

      const storedSources = localStorage.getItem("pageos-source-settings");
      if (storedSources) {
        const parsed = JSON.parse(storedSources);
        setSourceSettings((prev: SourceSettings) => ({
          ...prev,
          ...parsed,
        }));
      } else {
        localStorage.setItem("pageos-source-settings", JSON.stringify(defaultSourceSettings));
      }

      const storedBoot = localStorage.getItem("pageos-show-boot-animation");
      if (storedBoot !== null) {
        setShowBootAnimation(JSON.parse(storedBoot));
      }
    } catch (error) {
      console.warn(`Error reading from localStorage: ${error}`);
    }
  }, []);

  const value: ReaderSettings = {
    autoScroll,
    setAutoScroll: handleSetAutoScroll,
    sourceSettings,
    toggleSource,
    showBootAnimation,
    setShowBootAnimation: handleSetShowBootAnimation,
  };

  return (
    <ReaderSettingsContext.Provider value={value}>
      {children}
    </ReaderSettingsContext.Provider>
  );
}

export function useReaderSettings(): ReaderSettings {
  const context = useContext(ReaderSettingsContext);
  if (!context) {
    throw new Error("useReaderSettings must be used within a ReaderSettingsProvider");
  }
  return context;
}
