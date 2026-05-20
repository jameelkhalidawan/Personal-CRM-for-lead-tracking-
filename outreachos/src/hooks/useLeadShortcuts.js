import { useEffect } from 'react';

/**
 * Keyboard shortcuts for lead processing (#6)
 * L = log suggested, C = copy outreach pack, N = next lead, P = previous, ? = help
 */
export function useLeadShortcuts({
  enabled = true,
  onLogSuggested,
  onCopyPack,
  onNext,
  onPrevious,
  onShowHelp,
}) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'l' && onLogSuggested) {
        e.preventDefault();
        onLogSuggested();
      } else if (key === 'c' && onCopyPack) {
        e.preventDefault();
        onCopyPack();
      } else if (key === 'n' && onNext) {
        e.preventDefault();
        onNext();
      } else if (key === 'p' && onPrevious) {
        e.preventDefault();
        onPrevious();
      } else if (key === '?' && onShowHelp) {
        e.preventDefault();
        onShowHelp();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, onLogSuggested, onCopyPack, onNext, onPrevious, onShowHelp]);
}
