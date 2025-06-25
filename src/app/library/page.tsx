import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Library } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-headline text-accent">ARCHIVE_DIRECTORY</h1>
        <p className="text-muted-foreground">
          Your personal collection of synchronized memory logs.
        </p>
      </header>
      <Card className="border-border/50 bg-card text-center">
        <CardHeader>
            <div className="mx-auto bg-input rounded-full p-3 w-fit">
            <Library className="h-8 w-8 text-accent" />
            </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="font-headline text-lg text-accent/80">ARCHIVE IS EMPTY</CardTitle>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Search for transmissions and save them to your archive for offline access. This feature is currently under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
