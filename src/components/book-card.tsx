import Link from "next/link";
import Image from "next/image";
import type { Book } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

export function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/read/${book.slug}`}>
      <Card className="group flex h-full flex-col border border-transparent bg-card transition-all hover:border-accent hover:box-glow">
        <CardHeader className="p-4">
          <div className="aspect-[3/4] overflow-hidden rounded-sm border border-border/50">
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              width={600}
              height={800}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="sci-fi book cover"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <CardTitle className="font-headline text-lg leading-tight text-foreground transition-colors group-hover:text-accent">
            {book.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{book.author}</p>
          <p className="mt-2 text-xs text-muted-foreground/80">
            <span className="text-accent/50">src:</span> {book.source}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 p-4 pt-0">
          <div className="w-full">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{book.progress}%</span>
            </div>
            <Progress
              value={book.progress}
              className="h-1 bg-input [&>div]:bg-accent"
            />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
