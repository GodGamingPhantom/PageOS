// src/components/fallback-links.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WebFallbackResult } from "@/adapters/webFallback";
import { Globe, FileText, FileJson2, FileQuestion } from "lucide-react";
import { Badge } from "./ui/badge";

const FiletypeIcon = ({ type }: { type: WebFallbackResult['filetype'] }) => {
    switch (type) {
        case 'html': return <Globe className="h-4 w-4 text-accent" />;
        case 'pdf': return <FileJson2 className="h-4 w-4 text-accent" />;
        case 'txt': return <FileText className="h-4 w-4 text-accent" />;
        default: return <FileQuestion className="h-4 w-4 text-accent" />;
    }
}

export function FallbackLinks({ results }: { results: WebFallbackResult[] }) {
  return (
    <section>
        <h2 className="font-headline text-lg text-accent/80 mb-4 border-b border-dashed border-border pb-2">
            // WEB_FALLBACK_RESULTS
        </h2>
        <Card className="border-border/50 bg-card">
            <CardHeader>
                <CardTitle className="font-headline text-accent/80">External Links Found</CardTitle>
                <CardDescription>
                    Primary archives returned no results. The following are unverified links from the open web.
                    Proceed with caution.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {results.map((result, index) => (
                        <li key={index} className="rounded-md border border-border/30 p-4 transition-colors hover:bg-input/50">
                             <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <div className="flex items-start gap-4">
                                    <FiletypeIcon type={result.filetype} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-foreground group-hover:text-accent group-hover:underline">
                                                {result.title}
                                            </p>
                                            <Badge variant="outline" className="border-accent/50 text-accent/80 text-xs">
                                                {result.filetype.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {result.snippet}
                                        </p>
                                        <p className="text-xs text-muted-foreground/70 mt-2 truncate group-hover:text-accent/80">
                                            {result.url}
                                        </p>
                                    </div>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    </section>
  );
}
