import React, { useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
import type { AdminTag } from '@/types';

interface ManageTagsDialogProps {
  open: boolean;
  onClose: () => void;
  tags: AdminTag[];
  /** Creates a tag; the picker that opened the dialog also selects it. */
  onCreate: (name: string) => Promise<AdminTag>;
  onRename: (tagId: number, name: string) => Promise<AdminTag>;
  onDelete: (tagId: number) => Promise<void>;
}

/** One row at a time is being renamed or confirming a delete. */
type Active = { id: number; mode: 'rename'; name: string } | { id: number; mode: 'delete' };

/** Add, rename or delete the shared tags, away from the product form. One box both finds and adds. */
export function ManageTagsDialog({ open, onClose, tags, onCreate, onRename, onDelete }: ManageTagsDialogProps) {
  const [filter, setFilter] = useState('');
  const [active, setActive] = useState<Active | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setActive(null); setError(''); };
  const close = () => { if (busy) return; reset(); setFilter(''); onClose(); };

  const needle = filter.trim().toLowerCase();
  const shown = needle ? tags.filter((t) => t.name.toLowerCase().includes(needle)) : tags;
  const canAdd = !!needle && !tags.some((t) => t.name.toLowerCase() === needle);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
      setActive(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That didn’t work. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveRename = (tag: AdminTag, name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === tag.name) return reset();
    if (tags.some((t) => t.id !== tag.id && t.name.toLowerCase() === trimmed.toLowerCase())) return setError(`There's already a tag called ${trimmed}.`);
    run(async () => {
      await onRename(tag.id, trimmed);
      toast.success(`${tag.name} was renamed to ${trimmed}.`);
    });
  };

  const add = () => {
    if (!canAdd || busy) return;
    const trimmed = filter.trim();
    run(async () => {
      await onCreate(trimmed);
      setFilter('');
      toast.success(`${trimmed} was added.`);
    });
  };

  const confirmDelete = (tag: AdminTag) =>
    run(async () => {
      await onDelete(tag.id);
      toast.success(`The ${tag.name} tag was deleted.`);
    });

  return (
    <Modal open={open} onClose={close} title="Tags" className="sm:max-w-md"
      description="Tags are shared by every product, so a rename or delete here changes them everywhere. A tag you add is selected for this variant.">
      <form className="flex gap-2 mb-3" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Find or add a tag</span>
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input autoFocus value={filter} onChange={(e) => { setFilter(e.target.value); setError(''); }} placeholder="Find or add a tag, e.g. Citrus"
            className="w-full h-10 rounded-full border border-border bg-card pl-9 pr-4 text-sm focus:outline-none focus:border-foreground/50" />
        </label>
        {canAdd && (
          <Button type="submit" size="sm" loading={busy && !active} disabled={busy} className="h-10 max-w-[45%]">
            <Plus size={14} /> <span className="truncate">Add “{filter.trim()}”</span>
          </Button>
        )}
      </form>

      <ul className="max-h-80 overflow-y-auto -mx-1 px-1 divide-y divide-border">
        {shown.map((t) => {
          const mine = active?.id === t.id ? active : null;
          if (mine?.mode === 'rename') {
            return (
              <li key={t.id} className="py-2">
                <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); saveRename(t, mine.name); }}>
                  <input autoFocus value={mine.name} disabled={busy} aria-label={`New name for ${t.name}`}
                    onChange={(e) => { setActive({ ...mine, name: e.target.value }); setError(''); }}
                    className="flex-1 min-w-0 h-9 rounded-full border border-foreground/40 bg-card px-3.5 text-sm focus:outline-none focus:border-foreground/70" />
                  <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={busy}>Cancel</Button>
                  <Button type="submit" size="sm" loading={busy} disabled={!mine.name.trim()}>Save</Button>
                </form>
              </li>
            );
          }
          if (mine?.mode === 'delete') {
            return (
              <li key={t.id} className="flex items-center gap-1 py-1.5">
                <span className="flex-1 min-w-0 truncate text-sm">Delete <strong className="font-medium">{t.name}</strong>?</span>
                <button type="button" onClick={reset} disabled={busy}
                  className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 disabled:opacity-40">Cancel</button>
                <button type="button" onClick={() => confirmDelete(t)} disabled={busy}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-40">
                  {busy ? 'Deleting…' : 'Delete'}
                </button>
              </li>
            );
          }
          return (
            <li key={t.id} className="flex items-center gap-2 py-1.5">
              <span className="flex-1 min-w-0 truncate text-sm">{t.name}</span>
              <button type="button" onClick={() => { setActive({ id: t.id, mode: 'rename', name: t.name }); setError(''); }} disabled={busy}
                aria-label={`Rename ${t.name}`} className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 disabled:opacity-40">
                <Pencil size={14} />
              </button>
              <button type="button" onClick={() => { setActive({ id: t.id, mode: 'delete' }); setError(''); }} disabled={busy}
                aria-label={`Delete ${t.name}`} className="rounded-full p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40">
                <Trash2 size={14} />
              </button>
            </li>
          );
        })}
        {shown.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">{tags.length ? 'No tag matches that yet.' : 'No tags yet. Type a name above to add one.'}</li>}
      </ul>

      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={close} disabled={busy}>Done</Button>
      </div>
    </Modal>
  );
}
