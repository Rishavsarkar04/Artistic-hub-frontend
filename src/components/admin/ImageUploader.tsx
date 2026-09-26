import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/** A photo in the uploader: uploading, uploaded (has `url`), or failed. */
export interface ImageDraft {
  key: number;
  /** Local preview shown while it uploads, and afterwards until the page is left. */
  preview: string;
  /** Set once the upload succeeds; this is what gets saved. */
  url: string | null;
  file: File | null;
  status: 'uploading' | 'done' | 'error';
  alt: string;
}

export const MAX_IMAGES = 8;
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

let nextKey = 1;

/** Existing saved photos as uploader items, e.g. when editing a product. */
export const toImageDrafts = (images: { url: string; alt_text: string | null }[]): ImageDraft[] =>
  images.map((img) => ({ key: nextKey++, preview: img.url, url: img.url, file: null, status: 'done', alt: img.alt_text ?? '' }));

interface ImageUploaderProps {
  images: ImageDraft[];
  setImages: React.Dispatch<React.SetStateAction<ImageDraft[]>>;
  /** Uploads one file and resolves to its saved URL. */
  upload: (file: File) => Promise<{ url: string }>;
  /** Smaller drop area and thumbnails, e.g. inside a variant card. */
  compact?: boolean;
}

/**
 * Pick or drop photos; each uploads straight away. The first photo is the cover. Photos can be moved,
 * removed, retried if an upload fails, and given alt text.
 */
export function ImageUploader({ images, setImages, upload, compact = false }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  const patch = (key: number, changes: Partial<ImageDraft>) => setImages((list) => list.map((img) => (img.key === key ? { ...img, ...changes } : img)));

  const start = (img: ImageDraft) => {
    patch(img.key, { status: 'uploading' });
    upload(img.file!)
      .then(({ url }) => patch(img.key, { url, status: 'done' }))
      .catch(() => patch(img.key, { status: 'error' }));
  };

  const addFiles = (files: FileList | File[]) => {
    const issues: string[] = [];
    const room = MAX_IMAGES - images.length;
    const accepted: ImageDraft[] = [];
    for (const file of Array.from(files)) {
      if (!TYPES.includes(file.type)) issues.push(`${file.name}: use a JPG, PNG or WebP image.`);
      else if (file.size > MAX_BYTES) issues.push(`${file.name}: larger than 5 MB.`);
      else if (accepted.length >= room) issues.push(`${file.name}: a product can have up to ${MAX_IMAGES} photos.`);
      else accepted.push({ key: nextKey++, preview: URL.createObjectURL(file), url: null, file, status: 'uploading', alt: '' });
    }
    setProblems(issues);
    if (!accepted.length) return;
    setImages((list) => [...list, ...accepted]);
    accepted.forEach(start);
  };

  const remove = (img: ImageDraft) => {
    setImages((list) => list.filter((x) => x.key !== img.key));
    if (img.preview.startsWith('blob:') && img.preview !== img.url) URL.revokeObjectURL(img.preview);
  };
  const move = (index: number, by: -1 | 1) =>
    setImages((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return next;
    });

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className={cn('rounded-xl border-2 border-dashed px-4 text-center transition-colors', compact ? 'py-4' : 'py-8', dragging ? 'border-foreground/50 bg-secondary/60' : 'border-border', images.length >= MAX_IMAGES && 'opacity-50')}
      >
        <ImagePlus size={compact ? 18 : 22} className="mx-auto text-muted-foreground" />
        <p className="text-sm mt-2">
          Drag photos here or{' '}
          <button type="button" onClick={() => inputRef.current?.click()} disabled={images.length >= MAX_IMAGES} className="font-medium underline underline-offset-4 disabled:no-underline">browse</button>
        </p>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP, up to 5 MB each, {MAX_IMAGES} photos at most.</p>
        <input ref={inputRef} type="file" accept={TYPES.join(',')} multiple className="sr-only" tabIndex={-1} aria-label="Choose photos"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
      </div>

      {problems.length > 0 && (
        <ul role="alert" className="mt-3 space-y-1 text-xs text-destructive">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
      )}

      {images.length > 0 && (
        <ol className={cn('mt-4 grid gap-3', compact ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4')}>
          {images.map((img, i) => (
            <li key={img.key} className="min-w-0">
              <div className="group relative aspect-square rounded-xl overflow-hidden bg-secondary">
                <img src={img.url ?? img.preview} alt="" className={cn('h-full w-full object-cover', img.status !== 'done' && 'opacity-50')} />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink/85 px-2 py-0.5 text-[0.8125rem] font-medium text-[#F7F4EF]">Cover</span>}
                {img.status === 'uploading' && <span className="absolute inset-0 flex items-center justify-center" aria-label="Uploading"><Loader2 size={20} className="animate-spin" /></span>}
                {img.status === 'error' && (
                  <button type="button" onClick={() => start(img)} className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-card/70 text-xs font-medium text-destructive">
                    <RotateCcw size={16} /> Upload failed. Retry
                  </button>
                )}
                <button type="button" onClick={() => remove(img)} aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-2 top-2 size-7 rounded-full bg-card/90 flex items-center justify-center shadow-sm hover:bg-card"><X size={14} /></button>
                <div className="absolute inset-x-2 bottom-2 flex justify-between">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`}
                    className="size-7 rounded-full bg-card/90 flex items-center justify-center shadow-sm disabled:invisible"><ArrowLeft size={14} /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label={`Move photo ${i + 1} later`}
                    className="size-7 rounded-full bg-card/90 flex items-center justify-center shadow-sm disabled:invisible"><ArrowRight size={14} /></button>
                </div>
              </div>
              <input value={img.alt} onChange={(e) => patch(img.key, { alt: e.target.value })} placeholder="Describe the photo" aria-label={`Alt text for photo ${i + 1}`}
                className="mt-2 w-full h-9 rounded-lg border border-border bg-card px-3 text-xs focus:outline-none focus:border-foreground/50" />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
