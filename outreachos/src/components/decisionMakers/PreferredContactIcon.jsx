import {
  Mail,
  Phone,
  Link2,
  MessageCircle,
  Camera,
  X,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/cn';

const ICONS = {
  email: Mail,
  phone: Phone,
  linkedin: Link2,
  whatsapp: MessageCircle,
  instagram: Camera,
  twitter: X,
};

export function PreferredContactIcon({ method, className, showLabel = false }) {
  if (!method) {
    return showLabel ? (
      <span className="text-small text-text-muted">—</span>
    ) : (
      <HelpCircle className={cn('h-4 w-4 text-text-muted', className)} aria-hidden />
    );
  }

  const Icon = ICONS[method] ?? HelpCircle;
  const label = method.charAt(0).toUpperCase() + method.slice(1);

  if (showLabel) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-small text-text-secondary', className)}>
        <Icon className="h-4 w-4 text-accent-secondary" aria-hidden />
        {label}
      </span>
    );
  }

  return (
    <Icon
      className={cn('h-4 w-4 text-accent-secondary', className)}
      aria-label={label}
      title={label}
    />
  );
}
