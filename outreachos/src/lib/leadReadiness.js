import { getContactChannels } from './outreachSequence';

/** Minimum data before a lead is ready for active outreach (#12) */
export function getLeadReadiness(business, decisionMakers = []) {
  const issues = [];
  const hasNiche = Boolean(String(business?.niche ?? '').trim());
  const channels = getContactChannels(business, decisionMakers);
  const hasChannel = channels.phone || channels.email;
  const hasContact = (decisionMakers ?? []).length > 0;

  if (!hasNiche) issues.push('Add niche');
  if (!hasContact) issues.push('Add at least one contact');
  if (!hasChannel) issues.push('Add phone or email (business or contact)');

  return {
    ready: issues.length === 0,
    issues,
    hasNiche,
    hasContact,
    hasChannel,
  };
}
