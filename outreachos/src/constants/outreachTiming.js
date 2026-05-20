/** Default days between outreach steps (editable in Settings) */
export const DEFAULT_OUTREACH_TIMING = {
  /** Days after a new lead before any outreach step is due */
  newLeadStartDays: 0,
  firstCallDays: 0,
  followUpCallDays: 2,
  firstEmailDays: 0,
  followUpEmail1Days: 3,
  followUpEmail2Days: 5,
  callNoAnswerDays: 2,
  callVoicemailDays: 3,
  callInterestedDays: 2,
  callNotNowDays: 14,
  emailNoReplyDays: 3,
  emailOpenedNoReplyDays: 4,
  emailRepliedInterestedDays: 2,
  emailRepliedNotNowDays: 14,
};

export const OUTREACH_TIMING_SECTIONS = [
  {
    title: 'New lead',
    description: 'When outreach should start after you add a contact.',
    fields: [
      { key: 'newLeadStartDays', label: 'Start outreach (days after lead added)', min: 0, max: 30 },
    ],
  },
  {
    title: 'Call track',
    description: 'Independent call sequence — not blocked by email progress.',
    fields: [
      { key: 'firstCallDays', label: 'First call (days after start)', min: 0, max: 30 },
      { key: 'followUpCallDays', label: 'Follow-up call (days after previous call step)', min: 0, max: 30 },
    ],
  },
  {
    title: 'Email track',
    description: 'Independent email sequence — runs in parallel with calls.',
    fields: [
      { key: 'firstEmailDays', label: 'First email (days after start)', min: 0, max: 30 },
      { key: 'followUpEmail1Days', label: 'Follow-up email 1 (days after first email)', min: 0, max: 30 },
      { key: 'followUpEmail2Days', label: 'Follow-up email 2 (days after follow-up 1)', min: 0, max: 30 },
    ],
  },
  {
    title: 'Call quick results',
    description: 'Default follow-up spacing when you log a call result.',
    fields: [
      { key: 'callNoAnswerDays', label: 'No answer → next touch', min: 0, max: 30 },
      { key: 'callVoicemailDays', label: 'Voicemail → next touch', min: 0, max: 30 },
      { key: 'callInterestedDays', label: 'Spoke — interested → next touch', min: 0, max: 30 },
      { key: 'callNotNowDays', label: 'Spoke — not now → next touch', min: 0, max: 30 },
    ],
  },
  {
    title: 'Email quick results',
    description: 'Default follow-up spacing when you log an email result.',
    fields: [
      { key: 'emailNoReplyDays', label: 'No reply → next touch', min: 0, max: 30 },
      { key: 'emailOpenedNoReplyDays', label: 'Opened, no reply → next touch', min: 0, max: 30 },
      { key: 'emailRepliedInterestedDays', label: 'Replied — interested → next touch', min: 0, max: 30 },
      { key: 'emailRepliedNotNowDays', label: 'Replied — not now → next touch', min: 0, max: 30 },
    ],
  },
];
