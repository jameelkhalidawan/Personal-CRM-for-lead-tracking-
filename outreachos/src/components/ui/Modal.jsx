import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
  loading,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-xl border border-border bg-background-card shadow-2xl animate-fade-in"
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-h3 text-text-primary">{title}</h2>
            {description && (
              <p className="text-small text-text-secondary mt-1">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-background-elevated"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children && <div className="px-5 py-4">{children}</div>}
        {(onConfirm || cancelLabel) && (
          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              {cancelLabel}
            </Button>
            {onConfirm && (
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                loading={loading}
              >
                {confirmLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
