import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Icon on the confirm button; a bin by default (use another for non-delete actions like cancelling). */
  icon?: React.ElementType;
  /** Runs the destructive action; a thrown error is shown in the dialog. */
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** "Are you sure?" dialog for a destructive action, with a loading state and inline error. */
export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, icon: Icon = Trash2, onConfirm, onClose }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That didn’t work. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={() => { if (!busy) { setError(''); onClose(); } }} title={title} description={description}>
      {error && <p role="alert" className="text-sm text-destructive mb-3">{error}</p>}
      <div className="flex gap-3 justify-end mt-2">
        <Button variant="outline" onClick={onClose} disabled={busy}>{cancelLabel}</Button>
        <Button onClick={confirm} loading={busy} className="bg-destructive text-white hover:bg-destructive/90">
          <Icon size={15} /> {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
