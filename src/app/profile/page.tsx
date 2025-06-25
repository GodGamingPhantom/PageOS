import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getBooks } from "@/lib/mock-data";
import { Download, Upload } from "lucide-react";

export default function ProfilePage() {
  const history = getBooks().slice(0, 4);
  const favorites = getBooks().slice(2, 6);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-headline text-accent">USER_PROFILE</h1>
        <p className="text-muted-foreground">Operator session logs and preferences.</p>
      </div>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="font-headline text-lg text-accent/80">Data Sync</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Connect to Firebase to synchronize your reading history, bookmarks, and preferences across all your devices.
          </p>
          <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/10 hover:text-accent">
            Connect to Firebase
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="font-headline text-lg text-accent/80">Reading History</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {history.map((book) => (
                <li key={book.id} className="text-sm text-foreground">
                  <span className="text-muted-foreground mr-2">{book.lastAccessed}:</span> 
                  Accessed '{book.title}'
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="font-headline text-lg text-accent/80">Favorited Books</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {favorites.map((book) => (
                <li key={book.id} className="text-sm text-foreground">
                  <span className="text-accent/80 mr-2">▸</span>
                  {book.title}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="font-headline text-lg text-accent/80">Export Data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="border-border/50">
            <Download className="mr-2 h-4 w-4" /> Export Bookmarks
          </Button>
          <Button variant="outline" className="border-border/50">
            <Download className="mr-2 h-4 w-4" /> Export Completed Titles
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
