import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createMockTag, mockAdminTags } from '@/data/admin/tags';
import type { AdminTag } from '@/types';

/**
 * The tag list for a form, shared by every TagPicker on it so a tag created in one shows up in all.
 * MOCK: starts from `mockAdminTags` and creates with `createMockTag`; with the API, load the list with
 * useApiQuery<AdminTag[]>(endpoints.admin.tags.list) and create with a POST to endpoints.admin.tags.create.
 */
export function useTagList() {
  const [tags, setTags] = useState<AdminTag[]>(() => [...mockAdminTags]);
  const create = async (name: string) => {
    const tag = await createMockTag(name);
    setTags((list) => [...list, tag]);
    return tag;
  };
  return { tags, create };
}

interface TagPickerProps {
  tags: AdminTag[];
  /** Creates a tag (see `useTagList`) and resolves to it. */
  onCreate: (name: string) => Promise<AdminTag>;
  selected: number[];
  onChange: (ids: number[]) => void;
  label: string;
  hint?: string;
  /** Unique per picker, so several can sit on one page. */
  id: string;
  compact?: boolean;
}

/** Pick tags from the list, or create a new one, which is then selected. */
export function TagPicker({ tags, onCreate, selected, onChange, label, hint, id, compact = false }: TagPickerProps) {
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const toggle = (tagId: number) => onChange(selected.includes(tagId) ? selected.filter((x) => x !== tagId) : [...selected, tagId]);

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // An existing tag with that name is simply selected instead of created twice.
    const existing = tags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (!selected.includes(existing.id)) onChange([...selected, existing.id]);
      setName('');
      setError('');
      return;
    }
    setAdding(true);
    setError('');
    try {
      const tag = await onCreate(trimmed);
      onChange([...selected, tag.id]);
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The tag could not be added.');
    } finally {
      setAdding(false);
    }
  };

  const chip = compact ? 'h-8 px-3 text-xs' : 'h-9 px-3.5 text-[13px]';
  return (
    <fieldset>
      <legend className="text-sm font-medium mb-2">{label} {hint && <span className="text-muted-foreground font-normal">({hint})</span>}</legend>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => {
          const on = selected.includes(t.id);
          return (
            <button key={t.id} type="button" onClick={() => toggle(t.id)} aria-pressed={on}
              className={cn('rounded-full border inline-flex items-center gap-1.5 transition-colors', chip, on ? 'bg-ink text-[#F7F4EF] border-ink' : 'bg-card border-border hover:border-foreground/40')}>
              {on && <Check size={13} />}{t.name}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2 max-w-sm">
        <input id={`${id}-new`} value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="New tag, e.g. Citrus" aria-label={`New tag for ${label.toLowerCase()}`}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          className={cn('flex-1 min-w-0 rounded-full border border-border bg-card focus:outline-none focus:border-foreground/50', chip)} />
        <button type="button" onClick={add} disabled={!name.trim() || adding}
          className={cn('rounded-full border border-border font-medium inline-flex items-center gap-1 hover:border-foreground/40 disabled:opacity-40 disabled:pointer-events-none', chip)}>
          <Plus size={14} /> {adding ? 'Adding…' : 'Add tag'}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
    </fieldset>
  );
}
