import React, { useState } from 'react';
import { Check, RotateCw, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ManageTagsDialog } from './ManageTagsDialog';
import type { AdminTag } from '@/types';

interface TagPickerProps {
  /** From `useTagList`, shared by every picker on the page. */
  tags: AdminTag[];
  isLoading?: boolean;
  /** Why the list failed to load; shown with a Try again button that calls `onRetry`. */
  loadError?: string;
  onRetry?: () => void;
  /** Creates a tag (see `useTagList`) and resolves to it. */
  onCreate: (name: string) => Promise<AdminTag>;
  /** Renames a tag everywhere it's used (from the dialog). */
  onRename: (tagId: number, name: string) => Promise<AdminTag>;
  /** Deletes a tag everywhere; the page should also drop it from every picker's selection. */
  onDelete: (tagId: number) => Promise<void>;
  selected: number[];
  onChange: (ids: number[]) => void;
  label: string;
  hint?: string;
  compact?: boolean;
}

/** Pick tags by clicking their chips. Adding, renaming and deleting live in the "Add or edit tags" dialog; a tag added there is selected here. */
export function TagPicker({ tags, isLoading = false, loadError, onRetry, onCreate, onRename, onDelete, selected, onChange, label, hint, compact = false }: TagPickerProps) {
  const [managing, setManaging] = useState(false);

  const toggle = (tagId: number) => onChange(selected.includes(tagId) ? selected.filter((x) => x !== tagId) : [...selected, tagId]);
  const create = async (name: string) => {
    const tag = await onCreate(name);
    onChange([...selected, tag.id]);
    return tag;
  };

  const chip = compact ? 'h-8 px-3 text-xs' : 'h-9 px-3.5 text-[0.9375rem]';
  return (
    <fieldset>
      <legend className="w-full flex items-baseline justify-between gap-3 mb-2 text-sm font-medium">
        <span>{label} {hint && <span className="text-muted-foreground font-normal">({hint})</span>}</span>
        <button type="button" onClick={() => setManaging(true)} disabled={isLoading || !!loadError}
          className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none">
          <Settings2 size={13} /> Add or edit tags
        </button>
      </legend>
      {isLoading && (
        <div className="flex flex-wrap gap-2" aria-busy="true" aria-label="Loading tags">
          {['w-16', 'w-12', 'w-20', 'w-14', 'w-18'].map((w) => <span key={w} className={cn('rounded-full bg-foreground/5 animate-pulse', chip, w)} />)}
        </div>
      )}
      {!isLoading && loadError && (
        <p role="alert" className="flex flex-wrap items-center gap-2 text-sm text-destructive">
          {loadError}
          {onRetry && (
            <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4">
              <RotateCw size={13} /> Try again
            </button>
          )}
        </p>
      )}
      {!isLoading && !loadError && <div className="flex flex-wrap gap-2">
        {tags.map((t) => {
          const on = selected.includes(t.id);
          return (
            <button key={t.id} type="button" onClick={() => toggle(t.id)} aria-pressed={on}
              className={cn('rounded-full border inline-flex items-center gap-1.5 transition-colors', chip, on ? 'bg-ink text-[#F7F4EF] border-ink' : 'bg-card border-border hover:border-foreground/40')}>
              {on && <Check size={13} />}{t.name}
            </button>
          );
        })}
        {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags yet. Use Add or edit tags to create one.</p>}
      </div>}
      <ManageTagsDialog open={managing} onClose={() => setManaging(false)} tags={tags} onCreate={create} onRename={onRename} onDelete={onDelete} />
    </fieldset>
  );
}
