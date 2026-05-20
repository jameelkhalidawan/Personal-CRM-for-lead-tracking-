import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

export function SlidePanel({
  open,
  onClose,
  title,
  children,
  width = 'w-[480px]',
  zClass = 'z-50',
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

  const panel = (
    <div className={cn('fixed inset-0 flex justify-end', zClass)}>
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        className={cn(
          'relative h-full max-w-full border-l border-border bg-background-card shadow-2xl animate-slide-in',
          width,
          'max-lg:w-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="slide-panel-title"
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <h2 id="slide-panel-title" className="text-h3 text-text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-background-elevated hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-[calc(100%-3.5rem)] overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );

  return createPortal(panel, document.body);
}
