import { OUTCOME_ACTIVITY_TYPES } from '../constants/activity';
import { DEFAULT_OUTREACH_TIMING } from '../constants/outreachTiming';
import { mergeOutreachTiming, getCallOutcomeDays, getEmailOutcomeDays } from './outreachTiming';
import { pickContactForChannel } from './contactPick';
import { filterActivitiesForContact } from './leadModel';

export { pickContactForChannel, filterActivitiesForContact };

function hasValue(v) {
  return Boolean(String(v ?? '').trim());
}

function buildPhoneSteps(timing) {
  const t = mergeOutreachTiming(timing);
  return [
    {
      type: 'call',
      label: 'First call',
      stage: 'first_call',
      channel: 'phone',
      track: 'phone',
      defaultNote: 'Initial outreach call — introduce services and qualify interest.',
      followupDays: t.firstCallDays,
    },
    {
      type: 'call',
      label: 'Follow-up',
      stage: 'follow_up_call',
      channel: 'phone',
      track: 'phone',
      defaultNote: 'Follow-up call — reference last attempt and confirm next step.',
      followupDays: t.followUpCallDays,
    },
  ];
}

function buildEmailSteps(timing) {
  const t = mergeOutreachTiming(timing);
  return [
    {
      type: 'cold_email',
      label: 'First email',
      stage: 'first_email',
      channel: 'email',
      track: 'email',
      defaultNote: 'Cold outreach email — short value prop and clear CTA.',
      followupDays: t.firstEmailDays,
    },
    {
      type: 'followup_email',
      label: 'Follow-up 1',
      stage: 'follow_up_email_1',
      channel: 'email',
      track: 'email',
      defaultNote: 'First follow-up — bump previous email with one new angle.',
      followupDays: t.followUpEmail1Days,
    },
    {
      type: 'followup_email',
      label: 'Follow-up 2',
      stage: 'follow_up_email_2',
      channel: 'email',
      track: 'email',
      defaultNote: 'Second follow-up — final polite check-in before pausing sequence.',
      followupDays: t.followUpEmail2Days,
    },
  ];
}

/** Phone/email for one contact, or union of all contacts when not scoped */
export function getContactChannels(business, decisionMakers = []) {
  const dms = decisionMakers ?? [];
  if (dms.length === 1) {
    const dm = dms[0];
    return {
      phone: hasValue(dm?.phone_number) || hasValue(business?.phone_number),
      email: hasValue(dm?.email) || hasValue(business?.business_email),
    };
  }
  const phone =
    hasValue(business?.phone_number) || dms.some((dm) => hasValue(dm.phone_number));
  const email =
    hasValue(business?.business_email) || dms.some((dm) => hasValue(dm.email));
  return { phone, email };
}

export function hasPlaybookOutcome(activities) {
  return (activities ?? []).some((a) => OUTCOME_ACTIVITY_TYPES.includes(a.type));
}

/**
 * Parallel tracks: call steps and email steps are independent.
 * If contact has phone + email, both tracks are required.
 */
export function buildPlaybookSteps(business, decisionMakers = [], timing) {
  const channels = getContactChannels(business, decisionMakers);
  const steps = [];
  if (channels.phone) steps.push(...buildPhoneSteps(timing));
  if (channels.email) steps.push(...buildEmailSteps(timing));
  if (!steps.length) {
    steps.push({
      type: 'note',
      label: 'Add contact info',
      stage: 'needs_contact',
      channel: 'none',
      track: 'none',
      defaultNote: 'Add a phone number or email on the business or a contact to start outreach.',
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

/** Mark each playbook step done based on activity history (per track) */
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

export function addDaysDatetimeLocal(days, fromDate = new Date()) {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildTrackState(steps, channel) {
  const trackSteps = steps.filter((s) => s.channel === channel);
  const current = trackSteps.find((s) => !s.done);
  const completed = trackSteps.filter((s) => s.done).length;
  return {
    steps: trackSteps,
    current,
    completed,
    total: trackSteps.length,
    allDone: trackSteps.length > 0 && trackSteps.every((s) => s.done),
  };
}

export function presetFromEmailOutcome(
  action,
  business,
  decisionMakers,
  timing,
  decisionMaker = null,
) {
  const days = action.followupDays ?? getEmailOutcomeDays(timing, action.id);
  const dms = decisionMaker ? [decisionMaker] : decisionMakers;
  const type = action.activityType ?? 'followup_email';
  return {
    type,
    notes: action.notes ?? '',
    followup_at: days ? addDaysDatetimeLocal(days) : '',
    decision_maker_id:
      decisionMaker?.id ?? pickContactForChannel('email', business, dms),
    outreach_channel: 'email',
    step: { label: action.label },
  };
}

export function presetFromCallOutcome(
  action,
  business,
  decisionMakers,
  timing,
  decisionMaker = null,
) {
  const days = action.followupDays ?? getCallOutcomeDays(timing, action.id);
  const dms = decisionMaker ? [decisionMaker] : decisionMakers;
  return {
    type: 'call',
    notes: action.notes ?? '',
    followup_at: days ? addDaysDatetimeLocal(days) : '',
    decision_maker_id:
      decisionMaker?.id ?? pickContactForChannel('phone', business, dms),
    outreach_channel: 'phone',
    step: { label: action.label },
  };
}

export function presetFromOutcome(action, channel = '') {
  return {
    type: action.type,
    notes: '',
    followup_at: '',
    decision_maker_id: '',
    outreach_channel: channel || '',
    step: { label: action.label },
    outcomeHint: action.description,
    isOutcome: true,
  };
}

export function presetFromStep(step, business, decisionMakers, timing, decisionMaker = null) {
  if (!step || step.channel === 'none') {
    return { type: 'note', notes: step?.defaultNote ?? '', followup_at: '', decision_maker_id: '' };
  }
  const t = mergeOutreachTiming(timing);
  const startOffset = t.newLeadStartDays ?? 0;
  const stepDays = step.followupDays ?? 0;
  const totalDays = startOffset + stepDays;
  const dms = decisionMaker ? [decisionMaker] : decisionMakers;
  const channel =
    step.channel === 'phone' || step.channel === 'email' ? step.channel : '';
  return {
    type: step.type,
    notes: step.defaultNote ?? '',
    followup_at: totalDays || step.followupDays ? addDaysDatetimeLocal(totalDays || step.followupDays) : '',
    decision_maker_id:
      decisionMaker?.id ?? pickContactForChannel(step.channel, business, dms),
    outreach_channel: channel,
  };
}

export function getPlaybookState(
  business,
  decisionMakers,
  activities,
  timing = DEFAULT_OUTREACH_TIMING,
  decisionMaker = null,
) {
  const scopedDms = decisionMaker ? [decisionMaker] : decisionMakers;
  const scopedActivities = decisionMaker
    ? filterActivitiesForContact(activities, decisionMaker.id)
    : activities;

  const channels = getContactChannels(business, scopedDms);
  const steps = resolvePlaybookProgress(
    buildPlaybookSteps(business, scopedDms, timing),
    scopedActivities,
  );
  const engaged = hasPlaybookOutcome(scopedActivities);

  const phoneTrack = buildTrackState(steps, 'phone');
  const emailTrack = buildTrackState(steps, 'email');

  const currentSteps = engaged
    ? []
    : [phoneTrack.current, emailTrack.current].filter(Boolean);

  const current = currentSteps[0] ?? null;
  const upcoming = engaged
    ? steps.filter((s) => !s.done)
    : steps.filter((s) => !s.done && !currentSteps.includes(s));

  const completedCount = steps.filter((s) => s.done).length;
  const totalSteps = steps.filter((s) => s.channel !== 'none').length;
  const allDone = totalSteps > 0 && steps.every((s) => s.done || s.channel === 'none');

  return {
    channels,
    steps,
    tracks: { phone: phoneTrack, email: emailTrack },
    currentSteps,
    current,
    upcoming,
    engaged,
    allDone,
    completedCount,
    totalSteps,
    timing: mergeOutreachTiming(timing),
    decisionMakerId: decisionMaker?.id ?? null,
  };
}

export function getSuggestedPreset(
  business,
  decisionMakers,
  activities,
  timing = DEFAULT_OUTREACH_TIMING,
  decisionMaker = null,
) {
  const state = getPlaybookState(
    business,
    decisionMakers,
    activities,
    timing,
    decisionMaker,
  );
  if (state.engaged) return null;

  const contactName = decisionMaker?.name?.trim();
  const who = contactName ? `${contactName}: ` : '';

  if (state.currentSteps.length === 1) {
    const step = state.currentSteps[0];
    return {
      ...presetFromStep(step, business, decisionMakers, timing, decisionMaker),
      step,
      reason: `${who}Next (${step.track} track): ${step.label}`,
    };
  }

  if (state.currentSteps.length > 1) {
    const labels = state.currentSteps.map((s) => s.label).join(' + ');
    const step = state.currentSteps[0];
    return {
      ...presetFromStep(step, business, decisionMakers, timing, decisionMaker),
      step,
      reason: `${who}Parallel tracks due: ${labels}`,
      parallelSteps: state.currentSteps,
    };
  }

  return null;
}

/** Short label for contact list / queue rows */
export function getPlaybookProgressSummary(state) {
  if (!state) return null;
  if (state.engaged) return 'Engaged';
  if (state.allDone && state.totalSteps > 0) return 'Sequence done';
  if (state.currentSteps?.length > 1) {
    return state.currentSteps.map((s) => s.label).join(' + ');
  }
  if (state.current) return state.current.label;
  if (state.totalSteps > 0) return `${state.completedCount}/${state.totalSteps} done`;
  return null;
}
