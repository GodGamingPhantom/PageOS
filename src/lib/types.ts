export type Book = {
  id: string;
  slug: string;
  title: string;
  author: string;
  source: string;
  progress: number;
  coverUrl: string;
  lastAccessed: string;
  genre: string;
  chapters: { title: string; read: boolean }[];
  content: string;
};
