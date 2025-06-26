'use client';

import type { MappedStandardEbook } from './sourceManager';

export async function searchStandardEbooks(query: string): Promise<MappedStandardEbook[]> {
  if (!query) return [];
  const searchQuery = query.replace(/ /g, '+');
  const response = await fetch(`/api/proxy?url=${encodeURIComponent(`https://standardebooks.org/ebooks?query=${searchQuery}`)}`);
  
  if (!response.ok) {
    console.error('Failed to fetch from Standard Ebooks:', response.statusText);
    return [];
  }
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const entries = Array.from(doc.querySelectorAll('#ebooks-list > li'));

  return entries.map(entry => {
    const titleLink = entry.querySelector('a') as HTMLAnchorElement;
    const author = entry.querySelector('p.author')?.textContent?.trim() || 'Unknown';
    const href = titleLink?.getAttribute('href') || '';
    const slug = href.replace('/ebooks/', '');

    if (!slug || !titleLink?.textContent) return null;

    return {
      id: `standardEbooks_${slug.replace(/\//g, '_')}`,
      title: titleLink.textContent.trim(),
      authors: author,
      source: 'standardEbooks',
      slug,
    };
  }).filter((book): book is MappedStandardEbook => book !== null);
}


export async function fetchStandardEbooksBookContent(slug: string): Promise<string> {
  const url = `https://standardebooks.org/ebooks/${slug}/text/single-page`;
  const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch book content from Standard Ebooks for slug ${slug}`);
  }
  const html = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const mainContent = doc.querySelector('section.main');
  if (!mainContent) throw new Error("Unable to locate book content for Standard Ebook");

  const paragraphs = Array.from(mainContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6, blockquote'));
  return paragraphs.map(p => p.textContent?.trim()).filter(Boolean).join('\n\n');
}
