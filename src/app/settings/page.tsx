"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, LoaderCircle } from "lucide-react";
import { useTheme } from "@/context/theme-provider";
import { useReaderSettings } from "@/context/reader-settings-provider";

type Status = 'Online' | 'Offline' | 'Error' | 'Checking';

const SourceStatus = ({ status }: { status: Status }) => {
  if (status === 'Checking') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        <span>Checking...</span>
      </div>
    );
  }

  const Icon = status === 'Online' ? CheckCircle : status === 'Offline' ? XCircle : AlertTriangle;
  const color = status === 'Online' ? 'text-accent' : status === 'Offline' ? 'text-muted-foreground' : 'text-destructive';
  
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className={color}>{status}</span>
    </div>
  );
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { readingMode, setReadingMode, autoScroll, setAutoScroll } = useReaderSettings();
  
  const [sourceStatuses, setSourceStatuses] = useState<Record<string, Status>>({
    'Project Gutenberg': 'Checking',
    'Standard Ebooks': 'Checking',
    'Open Library': 'Checking',
    'Wikisource': 'Checking',
  });

  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const checkSourceStatuses = useCallback(async () => {
    setSourceStatuses({
      'Project Gutenberg': 'Checking',
      'Standard Ebooks': 'Checking',
      'Open Library': 'Checking',
      'Wikisource': 'Checking',
    });

    const check = async (url: string): Promise<Status> => {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        return response.ok ? 'Online' : 'Error';
      } catch (error) {
        return 'Error';
      }
    };

    setSourceStatuses({
      'Project Gutenberg': await check('https://gutendex.com/books/?search=a'),
      'Standard Ebooks': await check('/api/standard-ebooks?query=a'),
      'Open Library': await check('https://openlibrary.org/search.json?q=a&limit=1'),
      'Wikisource': await check('https://en.wikisource.org/w/api.php?action=query&list=search&srsearch=a&format=json&origin=*'),
    });
  }, []);

  useEffect(() => {
    checkSourceStatuses();
  }, [checkSourceStatuses]);

  const handleImport = () => {
    if (!newSourceUrl.trim()) return;
    setIsImporting(true);
    // This is a placeholder for real import functionality
    setTimeout(() => {
      alert(`Import feature is not implemented. Cannot import from: ${newSourceUrl}`);
      setIsImporting(false);
      setNewSourceUrl("");
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-headline text-accent">SYSTEM_CONFIG</h1>
        <p className="text-muted-foreground">Configure operator preferences and system parameters.</p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-input border border-border/50">
          <TabsTrigger value="appearance">Interface</TabsTrigger>
          <TabsTrigger value="reading">Reader</TabsTrigger>
          <TabsTrigger value="sources">Nodes</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-accent/80">Visual Interface</CardTitle>
              <CardDescription>Adjust fonts, colors, and layout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <Label htmlFor="theme-void" className="flex flex-col gap-1 cursor-pointer">
                  <span>VOID.BLACK</span>
                  <span className="font-normal text-muted-foreground">Black background, white text.</span>
                </Label>
                <Switch 
                  id="theme-void" 
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => checked && setTheme('dark')}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <Label htmlFor="theme-paper" className="flex flex-col gap-1 cursor-pointer">
                  <span>PAPER.WHITE</span>
                  <span className="font-normal text-muted-foreground">White background, black text.</span>
                </Label>
                <Switch 
                  id="theme-paper" 
                  checked={theme === 'light'}
                  onCheckedChange={(checked) => checked && setTheme('light')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reading">
           <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-accent/80">Reader Experience</CardTitle>
              <CardDescription>Customize the transmission reader.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <Label htmlFor="mode-scroll" className="flex flex-col gap-1 cursor-pointer">
                  <span>Scroll Mode</span>
                  <span className="font-normal text-muted-foreground">Continuous vertical scrolling.</span>
                </Label>
                <Switch 
                  id="mode-scroll"
                  checked={readingMode === 'scroll'}
                  onCheckedChange={(checked) => checked && setReadingMode('scroll')}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <Label htmlFor="mode-paged" className="flex flex-col gap-1 cursor-pointer">
                  <span>Page Mode</span>
                  <span className="font-normal text-muted-foreground">Horizontal page-by-page turning.</span>
                </Label>
                <Switch 
                  id="mode-paged"
                  checked={readingMode === 'paged'}
                  onCheckedChange={(checked) => checked && setReadingMode('paged')}
                />
              </div>
               <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
                <Label htmlFor="mode-autoscroll" className="flex flex-col gap-1 cursor-pointer">
                  <span>Auto-scroll</span>
                  <span className="font-normal text-muted-foreground">Automatically scroll content.</span>
                </Label>
                <Switch
                  id="mode-autoscroll"
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sources">
          <Card className="border-border/50 bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline text-lg text-accent/80">TRANSMISSION_NODES</CardTitle>
                <CardDescription>Manage content sources.</CardDescription>
              </div>
              <Button variant="outline" size="icon" className="border-border/50" onClick={checkSourceStatuses}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(sourceStatuses).map(([name, status]) => (
                 <div key={name} className="flex items-center justify-between rounded-md border border-border/50 p-4">
                   <p>{name}</p>
                   <SourceStatus status={status} />
                 </div>
              ))}
              <div className="pt-4">
                <Label htmlFor="add-source" className="text-accent/80">&gt; IMPORT FROM NODE URL</Label>
                <div className="flex items-center gap-2 mt-2">
                    <Input 
                      id="add-source" 
                      placeholder="https://example.com/book.epub" 
                      className="bg-input border-border/50"
                      value={newSourceUrl}
                      onChange={(e) => setNewSourceUrl(e.target.value)}
                      disabled={isImporting}
                    />
                    <Button onClick={handleImport} disabled={isImporting || !newSourceUrl.trim()}>
                      {isImporting ? <LoaderCircle className="animate-spin" /> : 'Import()'}
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
