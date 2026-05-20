import { addDaysDatetimeLocal } from './outreachSequence';

export const FOLLOW_UP_SNIPPETS = [
  { label: 'Tomorrow', days: 1 },
  { label: '+3 days', days: 3 },
  { label: '+1 week', days: 7 },
  { label: '+2 weeks', days: 14 },
];

export function followUpDaysFromNow(days) {
  return addDaysDatetimeLocal(days);
}
