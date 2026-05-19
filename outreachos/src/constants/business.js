export const BUSINESS_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
  { value: 'not_interested', label: 'Not Interested' },
];

export const BUSINESS_PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const BUSINESS_SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Date Added' },
  { value: 'last_contacted_desc', label: 'Last Contacted' },
  { value: 'next_followup_asc', label: 'Next Follow-up' },
  { value: 'priority_desc', label: 'Priority' },
  { value: 'estimated_value_desc', label: 'Estimated Value' },
];

export const EMPTY_BUSINESS_FORM = {
  business_name: '',
  niche: '',
  business_email: '',
  website_url: '',
  linkedin_url: '',
  phone_number: '',
  city: '',
  state: '',
  country: '',
  problem_notes: '',
  lead_source: '',
  status: 'new',
  priority: 'medium',
  estimated_value: '',
  last_contacted_at: '',
  next_followup_at: '',
  serviceIds: [],
};
