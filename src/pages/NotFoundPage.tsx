import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { paths } from '@/router/paths';

export function NotFoundPage({ title = 'Page not found', message = 'This page may have moved or is no longer available.' }: { title?: string; message?: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="display-lg text-4xl sm:text-5xl">{title}</h1>
      <p className="text-muted-foreground mt-3">{message}</p>
      <Button className="mt-8" asChild><Link to={paths.home}>Back to home</Link></Button>
    </div>
  );
}
