import { useEffect, useRef } from 'react';
import Button from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-jet/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative bg-white dark:bg-jet-900 rounded-2xl shadow-xl p-6 w-full max-w-sm animate-scale-in focus:outline-none"
      >
        <h3 className="text-lg font-bold text-jet dark:text-jet-100 mb-2">{title}</h3>
        <p className="text-sm text-jet-600 dark:text-jet-300 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'secondary' : 'primary'}
            size="sm"
            fullWidth
            onClick={onConfirm}
            className=""
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
