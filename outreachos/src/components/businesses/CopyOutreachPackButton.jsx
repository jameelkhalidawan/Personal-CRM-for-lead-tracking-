import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildOutreachPack } from '../../lib/outreachPack';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

export function CopyOutreachPackButton({
  business,
  decisionMaker = null,
  decisionMakers = [],
  activities = [],
  emailSubject = '',
  emailBody = '',
  size = 'sm',
  variant = 'secondary',
}) {
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = buildOutreachPack({
      business,
      decisionMaker,
      decisionMakers,
      activities,
      user,
      emailSubject,
      emailBody,
    });
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant={variant} size={size} type="button" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied' : 'Copy outreach pack'}
    </Button>
  );
}
