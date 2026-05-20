import { EMAIL_ACTIVITY_TYPES } from '../constants/activity';
import { pickContactForChannel } from './contactPick';

/** Clone last cold/follow-up email activity for quick follow-up (#9) */
export function getLastEmailActivityPreset(activities = [], decisionMakers = [], business) {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const last = sorted.find((a) => EMAIL_ACTIVITY_TYPES.includes(a.type) && (a.notes ?? '').trim());
  if (!last) return null;

  const notes = last.notes ?? '';
  const subjectMatch = notes.match(/^Subject:\s*(.+)$/m);
  const subject = subjectMatch ? subjectMatch[1].trim() : '';
  const body = notes.replace(/^Subject:.*\n\n?/m, '').trim() || notes;

  return {
    type: 'followup_email',
    notes,
    email_subject: subject,
    email_body: body,
    followup_at: '',
    decision_maker_id:
      last.decision_maker_id ||
      pickContactForChannel('email', business, decisionMakers),
    template_id: '',
    step: { label: 'Follow-up (from last email)' },
  };
}
