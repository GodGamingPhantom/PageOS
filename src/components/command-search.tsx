
"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Search } from "lucide-react";
import type { SearchResult, SourceKey } from "@/adapters/sourceManager";
import { searchBooksAcrossSources } from "@/adapters/sourceManager";
import { useReaderSettings } from "@/context/reader-settings-provider";

interface CommandSearchProps {
  onResults: (results: SearchResult[]) => void;
  onLoading: (loading: boolean) => void;
}

export function CommandSearch({ onResults, onLoading }: CommandSearchProps) {
  const [value, setValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { sourceSettings } = useReaderSettings();

  const handleSearch = async () => {
    if (!value) {
      onResults([]);
      return;
    };
    setIsSearching(true);
    onLoading(true);
    try {
      const enabledSources = Object.entries(sourceSettings)
        .filter(([, isEnabled]) => isEnabled)
        .map(([key]) => key as SourceKey);

      const results = await searchBooksAcrossSources(value, enabledSources);
      onResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      onResults([]);
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative flex items-center">
      <span className="absolute left-4 font-body text-accent/80 flex items-center gap-2 pointer-events-none">
        <span>&gt;</span>
        {!isSearching && <span className="animate-cursor-blink bg-accent w-2 h-4 inline-block" />}
      </span>
      <Input
        type="text"
        placeholder="Search public domain archives..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSearching}
        className="w-full bg-input border-border/50 pl-14 h-12 text-lg focus:border-accent"
      />
      <button
        onClick={handleSearch}
        disabled={isSearching}
        className="absolute right-4 text-accent/80 hover:text-accent transition-colors disabled:opacity-50"
      >
        {isSearching ? <LoaderCircle className="animate-spin" /> : <Search />}
      </button>
    </div>
  );
}
