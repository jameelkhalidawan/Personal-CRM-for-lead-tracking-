import { EMAIL_ACTIVITY_TYPES } from '../constants/activity';

export const OUTREACH_CHANNELS = [
  { value: 'phone', label: 'Call / phone' },
  { value: 'email', label: 'Email' },
];

const PHONE_ACTIVITY_TYPES = new Set(['call']);
const EMAIL_TYPES = new Set(EMAIL_ACTIVITY_TYPES);

/** Infer channel from activity type when outreach_channel is not stored. */
export function getChannelForActivityType(type) {
  if (PHONE_ACTIVITY_TYPES.has(type)) return 'phone';
  if (EMAIL_TYPES.has(type)) return 'email';
  return '';
}

export function getActivityChannel(activity) {
  if (!activity) return '';
  if (activity.outreach_channel === 'phone' || activity.outreach_channel === 'email') {
    return activity.outreach_channel;
  }
  return getChannelForActivityType(activity.type);
}

export function isPhoneOutreachActivity(activity) {
  return getActivityChannel(activity) === 'phone';
}

export function isEmailOutreachActivity(activity) {
  return getActivityChannel(activity) === 'email';
}

export function resolveFormChannel(form) {
  if (form?.outreach_channel === 'phone' || form?.outreach_channel === 'email') {
    return form.outreach_channel;
  }
  return getChannelForActivityType(form?.type) || null;
}
