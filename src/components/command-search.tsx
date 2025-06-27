
"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Search } from "lucide-react";
import type { SearchResponse } from "@/adapters/sourceManager";
import { searchBooksAcrossSources } from "@/adapters/sourceManager";

interface CommandSearchProps {
  onResults: (results: SearchResponse) => void;
  onLoading: (loading: boolean) => void;
}

export function CommandSearch({ onResults, onLoading }: CommandSearchProps) {
  const [value, setValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!value) {
      onResults({ primary: [], fallback: [] });
      return;
    };
    setIsSearching(true);
    onLoading(true);
    try {
      // With other sources removed, we no longer need to pass an array of enabled sources.
      // The sourceManager will default to searching the only primary source: Gutendex.
      const results = await searchBooksAcrossSources(value);
      onResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      onResults({ primary: [], fallback: [] });
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
    <div className="flex items-center gap-2">
      <div className="relative grow">
        <span className="absolute left-4 top-0 h-full font-body text-accent/80 flex items-center gap-2 pointer-events-none z-10 text-lg">
          <span>&gt;</span>
          {!isSearching && <span className="animate-cursor-blink bg-accent w-2 h-5 inline-block" />}
        </span>
        <Input
          type="text"
          placeholder="Search public domain archives or the web..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSearching}
          className="w-full bg-input border-border/50 pl-14 h-12 text-lg focus:border-accent"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="absolute right-4 top-0 h-full text-accent/80 hover:text-accent transition-colors disabled:opacity-50"
        >
          {isSearching ? <LoaderCircle className="animate-spin" /> : <Search />}
        </button>
      </div>
      {/* The filter popover has been removed as there is only one primary source now. */}
    </div>
  );
}
