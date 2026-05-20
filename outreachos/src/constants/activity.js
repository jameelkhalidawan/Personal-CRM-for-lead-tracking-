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
  email_subject: '',
  email_body: '',
  template_id: '',
};
