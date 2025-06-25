import { getBookBySlug } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Menu, Settings, Bookmark } from "lucide-react";

export default function ReaderPage({ params }: { params: { slug: string } }) {
  const book = getBookBySlug(params.slug);

  if (!book) {
    notFound();
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] animate-fade-in">
      {/* Chapter Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-headline text-lg text-accent">Chapter Index</h2>
          <p className="text-sm text-muted-foreground truncate">{book.title}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {book.chapters.map((chapter, index) => (
            <a
              key={index}
              href="#"
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-input ${
                chapter.read ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${chapter.read ? 'bg-muted-foreground' : 'bg-accent animate-pulse'}`}></span>
              <span>{chapter.title}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Reader Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Info Bar */}
        <header className="flex items-center justify-between p-2 border-b border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-4 w-4" /></Button>
            <span>{`TRANSMISSION > ${book.source.toUpperCase()} > ID_${book.id}`}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon"><Bookmark className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
          </div>
        </header>

        {/* Reading Pane */}
        <main className="flex-1 overflow-y-auto p-8 md:p-16 lg:p-24 font-reader text-lg leading-relaxed text-foreground/90">
          <div className="mb-8 font-body text-sm text-accent/80 space-y-1">
            <p>&gt;&gt;&gt; Transmission Link Established: "{book.title}"</p>
            <p>&gt;&gt;&gt; Rendering Chapter 1...</p>
          </div>
          <h1 className="text-4xl font-headline text-accent mb-8">{book.chapters[0].title}</h1>
          <p>{book.content}</p>
          <br />
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh.</p>
        </main>

        {/* Bottom Control Bar */}
        <footer className="p-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                <div className="flex-1 px-4 flex items-center gap-4">
                    <Progress value={book.progress} className="h-2 bg-input [&>div]:bg-accent" />
                    <span>{book.progress}%</span>
                </div>
                <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="text-center text-xs text-muted-foreground/50 mt-1">Memory Stream Active...</div>
        </footer>
      </div>
    </div>
  );
}
