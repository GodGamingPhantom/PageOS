
"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Filter, LoaderCircle, Search } from "lucide-react";
import type { SearchResponse, SourceKey } from "@/adapters/sourceManager";
import { searchBooksAcrossSources } from "@/adapters/sourceManager";
import { useReaderSettings } from "@/context/reader-settings-provider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CommandSearchProps {
  onResults: (results: SearchResponse) => void;
  onLoading: (loading: boolean) => void;
}

const ALL_SOURCES: { key: SourceKey; name: string }[] = [
  { key: 'gutendex', name: 'Project Gutenberg' },
  { key: 'openLibrary', name: 'Open Library' },
  { key: 'standardEbooks', name: 'Standard Ebooks' },
];

export function CommandSearch({ onResults, onLoading }: CommandSearchProps) {
  const [value, setValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { sourceSettings, toggleSource } = useReaderSettings();

  const handleSearch = async () => {
    if (!value) {
      onResults({ primary: [], fallback: [] });
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

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-12 w-12 flex-shrink-0 border-border/50">
            <Filter className="h-5 w-5 text-accent/80" />
            <span className="sr-only">Filter sources</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 border-border/50 bg-card">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none font-headline text-accent/80">TRANSMISSION_NODES</h4>
              <p className="text-sm text-muted-foreground">
                Enable or disable primary sources for your query.
              </p>
            </div>
            <div className="grid gap-3">
              {ALL_SOURCES.map((source) => (
                <Label
                  key={source.key}
                  htmlFor={source.key}
                  className="flex items-center gap-3 cursor-pointer text-sm font-normal"
                >
                  <Checkbox
                    id={source.key}
                    checked={sourceSettings[source.key] ?? true}
                    onCheckedChange={() => toggleSource(source.key)}
                  />
                  {source.name}
                </Label>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
