/** Suggested categories only — users can type any custom category */
export const SUGGESTED_CATEGORIES = [
  'AI Voice Agent',
  'Chatbot',
  'Website Redesign',
  'AI Automation',
  'Follow-up',
  'Proposal',
  'General',
];

export const TEMPLATE_PLACEHOLDERS = [
  { key: '{{decision_maker_name}}', label: 'Contact name' },
  { key: '{{decision_maker_email}}', label: 'Contact email' },
  { key: '{{decision_maker_role}}', label: 'Contact role' },
  { key: '{{business_name}}', label: 'Business name' },
  { key: '{{niche}}', label: 'Niche' },
  { key: '{{your_name}}', label: 'Your name' },
  { key: '{{phone_number}}', label: 'Phone' },
];

export const EMPTY_EMAIL_TEMPLATE_FORM = {
  name: '',
  subject: '',
  body: '',
  category: '',
};
