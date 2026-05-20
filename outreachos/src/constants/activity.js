/** Core sequence + outcomes + ad-hoc */
export const PLAYBOOK_ACTIVITY_TYPES = [
  { value: 'call', label: 'Call' },
  { value: 'cold_email', label: 'Cold email' },
  { value: 'followup_email', label: 'Follow-up email' },
];

export const OUTCOME_ACTIVITY_TYPES_LIST = [
  { value: 'interested', label: 'Got response / interested' },
  { value: 'meeting', label: 'Meeting booked' },
  { value: 'proposal', label: 'Proposal sent' },
  { value: 'closed', label: 'Deal closed' },
];

export const OUTCOME_ACTIVITY_TYPES = OUTCOME_ACTIVITY_TYPES_LIST.map((t) => t.value);

export const OTHER_ACTIVITY_TYPES = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'note', label: 'Note' },
];

export const ACTIVITY_TYPES = [
  ...PLAYBOOK_ACTIVITY_TYPES,
  ...OUTCOME_ACTIVITY_TYPES_LIST,
  ...OTHER_ACTIVITY_TYPES,
];

export const ACTIVITY_TYPE_LABELS = Object.fromEntries(
  ACTIVITY_TYPES.map((t) => [t.value, t.label]),
);

/** One-click call results (#4) */
/** One-click email results (parallel to call results) */
export const EMAIL_OUTCOME_ACTIONS = [
  {
    id: 'no_reply',
    label: 'No reply',
    notes: 'Email sent — no reply yet.',
    followupDays: 3,
    activityType: 'followup_email',
  },
  {
    id: 'bounced',
    label: 'Bounced',
    notes: 'Email bounced — verify address.',
    followupDays: 0,
    activityType: 'note',
  },
  {
    id: 'opened_no_reply',
    label: 'Opened, no reply',
    notes: 'Opened but no reply — schedule follow-up.',
    followupDays: 4,
    activityType: 'followup_email',
  },
  {
    id: 'replied_interested',
    label: 'Replied — interested',
    notes: 'They replied and showed interest.',
    followupDays: 2,
    activityType: 'followup_email',
  },
  {
    id: 'replied_not_now',
    label: 'Replied — not now',
    notes: 'They replied — not interested right now.',
    followupDays: 14,
    activityType: 'followup_email',
  },
];

export const CALL_OUTCOME_ACTIONS = [
  {
    id: 'no_answer',
    label: 'No answer',
    notes: 'Called — no answer.',
    followupDays: 2,
  },
  {
    id: 'voicemail',
    label: 'Voicemail',
    notes: 'Left voicemail.',
    followupDays: 3,
  },
  {
    id: 'wrong_number',
    label: 'Wrong number',
    notes: 'Wrong number / invalid contact.',
    followupDays: 0,
  },
  {
    id: 'spoke_interested',
    label: 'Spoke — interested',
    notes: 'Spoke with contact — showed interest. Follow up soon.',
    followupDays: 2,
  },
  {
    id: 'spoke_not_now',
    label: 'Spoke — not now',
    notes: 'Spoke with contact — not interested right now.',
    followupDays: 14,
  },
];

export const OUTCOME_QUICK_ACTIONS = [
  {
    type: 'interested',
    label: 'Got response',
    description: 'They replied or showed interest — pauses cold sequence.',
    status: 'interested',
  },
  {
    type: 'meeting',
    label: 'Meeting booked',
    description: 'Call or meeting scheduled.',
    status: 'contacted',
  },
  {
    type: 'proposal',
    label: 'Proposal sent',
    description: 'Proposal or quote delivered.',
    status: 'proposal_sent',
  },
  {
    type: 'closed',
    label: 'Deal closed',
    description: 'Won the deal.',
    status: 'closed_won',
  },
];

export const EMAIL_ACTIVITY_TYPES = ['cold_email', 'followup_email'];

export const EMPTY_ACTIVITY_FORM = {
  type: 'call',
  decision_maker_id: '',
  notes: '',
  followup_at: '',
  outreach_channel: 'phone',
  email_subject: '',
  email_body: '',
  template_id: '',
  call_template_id: '',
  call_script_id: '',
};
