import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBooks } from "@/lib/mock-data";
import { Grid3x3, List } from "lucide-react";

export default function LibraryPage() {
  const books = getBooks();

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline text-accent">PERSONAL_ARCHIVE</h1>
          <p className="text-muted-foreground">
            {books.length} memory logs synchronized.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Select defaultValue="last-accessed">
            <SelectTrigger className="w-[180px] border-border/50 bg-input focus:border-accent">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="border-border/50 bg-background">
              <SelectItem value="last-accessed">Last Accessed</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="border-border/50 bg-input text-accent">
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-border/50 bg-input text-muted-foreground">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}
