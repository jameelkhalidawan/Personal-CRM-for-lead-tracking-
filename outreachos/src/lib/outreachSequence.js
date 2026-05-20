import { OUTCOME_ACTIVITY_TYPES } from '../constants/activity';
import { pickContactForChannel } from './contactPick';

export { pickContactForChannel };

const PHONE_STEPS = [
  {
    type: 'call',
    label: 'First call',
    stage: 'first_call',
    channel: 'phone',
    defaultNote: 'Initial outreach call — introduce services and qualify interest.',
    followupDays: 2,
  },
  {
    type: 'call',
    label: 'Follow-up call',
    stage: 'follow_up_call',
    channel: 'phone',
    defaultNote: 'Follow-up call — reference last attempt and confirm next step.',
    followupDays: 3,
  },
];

const EMAIL_STEPS = [
  {
    type: 'cold_email',
    label: 'First email',
    stage: 'first_email',
    channel: 'email',
    defaultNote: 'Cold outreach email — short value prop and clear CTA.',
    followupDays: 3,
  },
  {
    type: 'followup_email',
    label: 'Follow-up email 1',
    stage: 'follow_up_email_1',
    channel: 'email',
    defaultNote: 'First follow-up — bump previous email with one new angle.',
    followupDays: 4,
  },
  {
    type: 'followup_email',
    label: 'Follow-up email 2',
    stage: 'follow_up_email_2',
    channel: 'email',
    defaultNote: 'Second follow-up — final polite check-in before pausing sequence.',
    followupDays: 5,
  },
];

function hasValue(v) {
  return Boolean(String(v ?? '').trim());
}

/** Phone/email available on business or any decision maker */
export function getContactChannels(business, decisionMakers = []) {
  const dms = decisionMakers ?? [];
  const phone =
    hasValue(business?.phone_number) || dms.some((dm) => hasValue(dm.phone_number));
  const email =
    hasValue(business?.business_email) ||
    dms.some((dm) => hasValue(dm.email));
  return { phone, email };
}

export function hasPlaybookOutcome(activities) {
  return (activities ?? []).some((a) => OUTCOME_ACTIVITY_TYPES.includes(a.type));
}

/** Ordered outreach steps for this lead (phone track, then email track) */
export function buildPlaybookSteps(business, decisionMakers = []) {
  const channels = getContactChannels(business, decisionMakers);
  const steps = [];
  if (channels.phone) steps.push(...PHONE_STEPS);
  if (channels.email) steps.push(...EMAIL_STEPS);
  if (!steps.length) {
    steps.push({
      type: 'note',
      label: 'Add contact info',
      stage: 'needs_contact',
      channel: 'none',
      defaultNote: 'Add a phone number or email on the business or a contact to start the playbook.',
      followupDays: null,
    });
  }
  return steps;
}

function sortActivities(activities) {
  return [...(activities ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

/** Mark each playbook step done based on activity history */
export function resolvePlaybookProgress(steps, activities) {
  const ordered = sortActivities(activities);
  const calls = ordered.filter((a) => a.type === 'call');
  const coldSent = ordered.some((a) => a.type === 'cold_email');
  const followups = ordered.filter((a) => a.type === 'followup_email');
  let callIdx = 0;
  let followupIdx = 0;

  return steps.map((step) => {
    let done = false;
    if (step.channel === 'phone') {
      done = callIdx < calls.length;
      if (done) callIdx += 1;
    } else if (step.channel === 'email') {
      if (step.stage === 'first_email') {
        done = coldSent;
      } else {
        done = followupIdx < followups.length;
        if (done) followupIdx += 1;
      }
    }
    return { ...step, done };
  });
}

export function addDaysDatetimeLocal(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function presetFromCallOutcome(action, business, decisionMakers) {
  return {
    type: 'call',
    notes: action.notes ?? '',
    followup_at: action.followupDays ? addDaysDatetimeLocal(action.followupDays) : '',
    decision_maker_id: pickContactForChannel('phone', business, decisionMakers),
    step: { label: action.label },
  };
}

export function presetFromOutcome(action) {
  return {
    type: action.type,
    notes: '',
    followup_at: '',
    decision_maker_id: '',
    step: { label: action.label },
    outcomeHint: action.description,
    isOutcome: true,
  };
}

export function presetFromStep(step, business, decisionMakers) {
  if (!step || step.channel === 'none') {
    return { type: 'note', notes: step?.defaultNote ?? '', followup_at: '', decision_maker_id: '' };
  }
  return {
    type: step.type,
    notes: step.defaultNote ?? '',
    followup_at: step.followupDays ? addDaysDatetimeLocal(step.followupDays) : '',
    decision_maker_id: pickContactForChannel(step.channel, business, decisionMakers),
  };
}

export function getPlaybookState(business, decisionMakers, activities) {
  const channels = getContactChannels(business, decisionMakers);
  const steps = resolvePlaybookProgress(
    buildPlaybookSteps(business, decisionMakers),
    activities,
  );
  const engaged = hasPlaybookOutcome(activities);
  const current = engaged ? null : steps.find((s) => !s.done && s.channel !== 'none');
  const upcoming = engaged
    ? steps.filter((s) => !s.done)
    : steps.filter((s) => !s.done && s !== current);
  const completedCount = steps.filter((s) => s.done).length;
  const allDone = steps.length > 0 && steps.every((s) => s.done || s.channel === 'none');

  return {
    channels,
    steps,
    current,
    upcoming,
    engaged,
    allDone,
    completedCount,
    totalSteps: steps.filter((s) => s.channel !== 'none').length,
  };
}

export function getSuggestedPreset(business, decisionMakers, activities) {
  const state = getPlaybookState(business, decisionMakers, activities);
  if (state.current) {
    return {
      ...presetFromStep(state.current, business, decisionMakers),
      step: state.current,
      reason: `Next in sequence: ${state.current.label}`,
    };
  }
  return null;
}
