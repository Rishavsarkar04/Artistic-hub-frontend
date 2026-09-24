import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { useApp } from '../store/AppContext';
import { Button } from '@/components/ui/button';
import { getPageBySlug, formatDate } from '../data/pages';

/** Renders any published CMS page by slug; content is rich-text HTML from the editor. */
export function ContentPage() {
  const { state, navigate } = useApp();
  const page = getPageBySlug(state.currentSlug);
  // Sanitise CMS HTML before rendering, even though only editors can write it.
  const html = useMemo(() => (page ? DOMPurify.sanitize(page.content) : ''), [page]);

  if (!page) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="display-lg text-4xl sm:text-5xl">Page not found</h1>
        <p className="text-muted-foreground mt-3">This page may have moved or is no longer available.</p>
        <Button className="mt-8" onClick={() => navigate('home')}>Back to home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground flex gap-2">
        <button onClick={() => navigate('home')} className="hover:text-foreground">Home</button><span>/</span>
        <span className="text-foreground" aria-current="page">{page.title}</span>
      </nav>
      <h1 className="display-lg text-5xl sm:text-6xl mt-6">{page.title}</h1>
      <p className="text-sm text-muted-foreground mt-3">Last updated {formatDate(page.updated_at)}</p>
      <div className="rich-text mt-10 pt-10 border-t border-border" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
