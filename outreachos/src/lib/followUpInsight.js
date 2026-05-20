import { ACTIVITY_TYPE_LABELS, OUTCOME_ACTIVITY_TYPES } from '../constants/activity';
import { pickPrimaryContact } from './contactPick';
import {
  filterActivitiesForContact,
  getLeadTitle,
  getLeadContext,
  getOutreachContactsForBusiness,
} from './leadModel';
import { readOutreachTimingFromStorage } from './outreachTiming';
import { getPlaybookState } from './outreachSequence';

function sortActivitiesNewest(activities) {
  return [...(activities ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

/** What to do next, where the lead is in the process, and any note to show on dashboard cards */
export function getFollowUpInsight(
  business,
  activities = [],
  decisionMakers = [],
  timing = readOutreachTimingFromStorage(),
  decisionMaker = null,
) {
  const scopedActivities = decisionMaker
    ? filterActivitiesForContact(activities, decisionMaker.id)
    : activities;
  const sorted = sortActivitiesNewest(scopedActivities);
  const state = getPlaybookState(
    business,
    decisionMakers,
    scopedActivities,
    timing,
    decisionMaker,
  );

  let nextAction;
  let processLabel;

  if (!state.channels.phone && !state.channels.email) {
    nextAction = 'Add phone or email to start outreach';
    processLabel = 'Needs contact info';
  } else if (state.engaged) {
    const lastOutcome = sorted.find((a) => OUTCOME_ACTIVITY_TYPES.includes(a.type));
    nextAction = lastOutcome
      ? `Follow up — ${ACTIVITY_TYPE_LABELS[lastOutcome.type] ?? lastOutcome.type}`
      : 'Follow up on engagement';
    processLabel =
      state.totalSteps > 0
        ? `Engaged · ${state.completedCount}/${state.totalSteps} outreach steps done`
        : 'Engaged — continue conversation';
  } else if (state.currentSteps?.length > 1) {
    nextAction = state.currentSteps.map((s) => s.label).join(' + ');
    processLabel =
      state.totalSteps > 0
        ? `Call & email in parallel · ${state.completedCount}/${state.totalSteps} done`
        : 'Call & email tracks due';
  } else if (state.current) {
    const trackLabel =
      state.current.track === 'phone'
        ? 'Call track'
        : state.current.track === 'email'
          ? 'Email track'
          : 'Outreach';
    nextAction = state.current.label;
    processLabel =
      state.totalSteps > 0
        ? `${trackLabel} · ${state.completedCount + 1} of ${state.totalSteps}`
        : 'Outreach in progress';
  } else if (state.allDone && state.totalSteps > 0) {
    nextAction = 'Log outcome or schedule next touch';
    processLabel = 'Outreach sequence complete';
  } else {
    nextAction = 'Review lead and log next touch';
    processLabel = 'In pipeline';
  }

  const latestWithNotes = sorted.find((a) => (a.notes ?? '').trim());
  const displayNote =
    (business.problem_notes ?? '').trim() ||
    (latestWithNotes?.notes ?? '').trim() ||
    null;

  const lastActivity = sorted[0];
  const lastActivityLabel = lastActivity
    ? ACTIVITY_TYPE_LABELS[lastActivity.type] ?? lastActivity.type.replace(/_/g, ' ')
    : null;

  return {
    nextAction,
    processLabel,
    note: displayNote,
    lastActivityLabel,
    playbookProgress:
      state.totalSteps > 0 ? `${state.completedCount}/${state.totalSteps}` : null,
    engaged: state.engaged,
  };
}

export function groupActivitiesByBusiness(activities) {
  const map = {};
  for (const a of activities ?? []) {
    if (!map[a.business_id]) map[a.business_id] = [];
    map[a.business_id].push(a);
  }
  return map;
}

export function enrichFollowUpList(businesses, activitiesByBusiness, dmsByBusiness) {
  return (businesses ?? []).map((business) => {
    const dms = dmsByBusiness[business.id] ?? [];
    const decisionMaker = pickPrimaryContact(dms, business);
    return {
      business,
      decisionMaker,
      insight: getFollowUpInsight(
        business,
        activitiesByBusiness[business.id] ?? [],
        dms,
        undefined,
        decisionMaker,
      ),
      leadTitle: getLeadTitle(decisionMaker, business),
      leadContext: getLeadContext(decisionMaker, business),
    };
  });
}

/** One follow-up card per decision maker when a business has multiple contacts */
export function expandFollowUpListByContact(businesses, activitiesByBusiness, dmsByBusiness) {
  const items = [];

  for (const business of businesses ?? []) {
    const dms = dmsByBusiness[business.id] ?? [];
    const contacts = getOutreachContactsForBusiness(business, dms);
    if (!contacts.length) {
      const insight = getFollowUpInsight(
        business,
        activitiesByBusiness[business.id] ?? [],
        dms,
        undefined,
        null,
      );
      items.push({
        business,
        decisionMaker: null,
        insight,
        leadTitle: getLeadTitle(null, business),
        leadContext: getLeadContext(null, business),
      });
      continue;
    }

    for (const decisionMaker of contacts) {
      const insight = getFollowUpInsight(
        business,
        activitiesByBusiness[business.id] ?? [],
        dms,
        undefined,
        decisionMaker,
      );
      items.push({
        business,
        decisionMaker,
        insight,
        leadTitle: getLeadTitle(decisionMaker, business),
        leadContext: getLeadContext(decisionMaker, business),
        contactIndex: contacts.indexOf(decisionMaker) + 1,
        contactTotal: contacts.length,
      });
    }
  }

  return items;
}
