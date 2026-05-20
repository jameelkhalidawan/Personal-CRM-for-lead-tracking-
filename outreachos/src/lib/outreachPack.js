import { getFollowUpInsight } from './followUpInsight';
import { getPlaybookState } from './outreachSequence';
import { getLeadTitle, getLeadContext, getEffectiveFollowUpAt } from './leadModel';

export function buildOutreachPack({
  business,
  decisionMaker,
  decisionMakers = [],
  activities = [],
  user,
  emailSubject = '',
  emailBody = '',
}) {
  const dm = decisionMaker ?? decisionMakers[0] ?? null;
  const insight = getFollowUpInsight(business, activities, decisionMakers);
  const state = getPlaybookState(business, decisionMakers, activities);
  const followUpAt = getEffectiveFollowUpAt(dm, business);
  const yourName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    '';

  const lines = [
    `Lead: ${getLeadTitle(dm, business)}`,
    dm?.role ? `Role: ${dm.role}` : null,
    `Company: ${getLeadContext(dm, business)}`,
    `Pipeline status: ${business?.status ?? '—'}`,
    '',
    '--- How to reach them ---',
    dm?.email ? `Email: ${dm.email}` : business?.business_email ? `Email: ${business.business_email}` : null,
    dm?.phone_number
      ? `Phone: ${dm.phone_number}`
      : business?.phone_number
        ? `Phone: ${business.phone_number}`
        : null,
    dm?.linkedin_url ? `LinkedIn: ${dm.linkedin_url}` : null,
    '',
    '--- Next step ---',
    `Action: ${insight.nextAction}`,
    `Process: ${insight.processLabel}`,
    state.current ? `Playbook: ${state.current.label}` : null,
    followUpAt ? `Follow-up: ${new Date(followUpAt).toLocaleString()}` : null,
    insight.note ? `Notes: ${insight.note}` : null,
    business?.problem_notes ? `Problem notes: ${business.problem_notes}` : null,
    '',
  ].filter((line) => line !== null);

  if (emailSubject || emailBody) {
    lines.push('--- Email draft ---');
    if (emailSubject) lines.push(`Subject: ${emailSubject}`);
    if (emailBody) lines.push('', emailBody);
  }

  if (yourName) {
    lines.push('', `— ${yourName}`);
  }

  return lines.join('\n');
}
