
import Link from "next/link";
import Image from "next/image";
import type { SearchResult } from "@/adapters/sourceManager";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function createBookQuery(book: SearchResult): string {
  const params = new URLSearchParams();
  params.set("source", book.source);
  params.set("id", book.id);
  params.set("title", book.title);
  params.set("authors", book.authors);

  switch (book.source) {
    case "gutendex":
      params.set("formats", JSON.stringify(book.formats));
      break;
    case "openLibrary":
      params.set("edition", book.edition);
      if (book.cover) {
        params.set("cover", book.cover);
      }
      break;
    case "standardEbooks":
      if (book.epub) {
        params.set("epub", book.epub);
      }
      break;
    case "wikisource":
      params.set("pageid", String(book.pageid));
      break;
  }
  return params.toString();
}

const getCoverUrl = (book: SearchResult) => {
    if (book.source === 'openLibrary' && book.cover) {
        return book.cover;
    }
    return "https://placehold.co/600x800";
}

export function SearchResultCard({ book }: { book: SearchResult }) {
  const getFileExtension = (source: string) => {
    if (source === "standardEbooks") return "epub";
    if (source === "wikisource") return "wiki";
    return "txt";
  };

  const formattedTitle = `▸ [${book.title
    .replace(/[?'.]/g, "")
    .replace(/ /g, "_")
    .slice(0, 25)
    .toUpperCase()}.${getFileExtension(book.source)}]`;

  const href = `/read?${createBookQuery(book)}`;

  return (
    <Link href={href}>
      <Card className="group flex h-full flex-col border border-transparent bg-card transition-all hover:border-accent hover:box-glow hover:bg-accent/10">
        <CardHeader className="p-4">
          <div className="aspect-[3/4] overflow-hidden rounded-sm border border-border/50">
            <Image
              src={getCoverUrl(book)}
              alt={`Cover of ${book.title}`}
              width={600}
              height={800}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="book cover"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <CardTitle className="font-body text-base leading-tight text-foreground transition-colors group-hover:text-accent" title={book.title}>
            {formattedTitle}
          </CardTitle>
          <p className="text-sm text-muted-foreground truncate">{book.authors}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <p className="text-xs text-muted-foreground/80">
            <span className="text-accent/50">src:</span> {book.source}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
