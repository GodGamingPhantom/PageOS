import { BookCard } from "@/components/book-card";
import { CommandSearch } from "@/components/command-search";
import { getBooks } from "@/lib/mock-data";
import type { Book } from "@/lib/types";

export default function HomePage() {
  const books = getBooks();
  const trendingBooks = books.slice(0, 4);
  const recentBooks = books.slice(4, 8);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-headline text-accent">SYSTEM_FEED</h1>
        <p className="text-muted-foreground">Latest transmissions and popular memory logs</p>
      </div>

      <CommandSearch />

      <section>
        <h2 className="font-headline text-lg text-accent/80 mb-4 border-b border-dashed border-border pb-2">
         // TRENDING_NOW
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-headline text-lg text-accent/80 mb-4 border-b border-dashed border-border pb-2">
         // RECENTLY_ADDED
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}
