import { OUTCOME_ACTIVITY_TYPES } from '../constants/activity';
import { getSupabase } from './supabase';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from './format';
import { formatEmailForNotes, isEmailActivityType } from './templateRender';

const STATUS_FROM_OUTCOME = {
  interested: 'interested',
  meeting: 'contacted',
  proposal: 'proposal_sent',
  closed: 'closed_won',
};

const ACTIVITY_SELECT = `
  *,
  businesses ( id, business_name ),
  decision_makers ( id, name )
`;

export function activityToForm(activity) {
  if (!activity) return null;
  return {
    type: activity.type ?? 'note',
    decision_maker_id: activity.decision_maker_id ?? '',
    notes: activity.notes ?? '',
    followup_at: toDatetimeLocalValue(activity.followup_at),
  };
}

export function mapActivityRow(row) {
  if (!row) return null;
  const business = row.businesses;
  const dm = row.decision_makers;
  const { businesses, decision_makers, ...rest } = row;
  return {
    ...rest,
    business_name: business?.business_name ?? null,
    decision_maker_name: dm?.name ?? null,
  };
}

function resolveActivityNotes(form) {
  if (isEmailActivityType(form.type) && (form.email_subject || form.email_body)) {
    return formatEmailForNotes(form.email_subject, form.email_body) || null;
  }
  return form.notes?.trim() || null;
}

function buildPayload(form, businessId, performedBy) {
  return {
    business_id: businessId,
    decision_maker_id: form.decision_maker_id || null,
    performed_by: performedBy ?? null,
    type: form.type,
    notes: resolveActivityNotes(form),
    followup_at: fromDatetimeLocalValue(form.followup_at),
  };
}

async function syncBusinessStatusFromOutcome(businessId, activityType) {
  const status = STATUS_FROM_OUTCOME[activityType];
  if (!status) return;
  const supabase = getSupabase();
  const { error } = await supabase
    .from('businesses')
    .update({ status })
    .eq('id', businessId);
  if (error) throw error;
}

async function touchContactDates(businessId, decisionMakerId, followupAt) {
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const businessPatch = { last_contacted_at: now };
  if (followupAt) businessPatch.next_followup_at = followupAt;

  const { error: bizError } = await supabase
    .from('businesses')
    .update(businessPatch)
    .eq('id', businessId);
  if (bizError) throw bizError;

  if (decisionMakerId) {
    const dmPatch = { last_contacted_at: now };
    if (followupAt) dmPatch.next_followup_at = followupAt;
    const { error: dmError } = await supabase
      .from('decision_makers')
      .update(dmPatch)
      .eq('id', decisionMakerId);
    if (dmError) throw dmError;
  }
}

export async function fetchActivitiesByBusiness(businessId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('activities')
    .select('*, decision_makers ( id, name )')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => {
    const dm = row.decision_makers;
    const { decision_makers, ...rest } = row;
    return {
      ...rest,
      decision_maker_name: dm?.name ?? null,
    };
  });
}

export async function fetchAllActivities() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('activities')
    .select(ACTIVITY_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapActivityRow);
}

export async function createActivity(businessId, form, performedBy) {
  const supabase = getSupabase();
  const payload = buildPayload(form, businessId, performedBy);

  const { data, error } = await supabase
    .from('activities')
    .insert(payload)
    .select('*, decision_makers ( id, name )')
    .single();

  if (error) throw error;

  await touchContactDates(businessId, payload.decision_maker_id, payload.followup_at);

  if (OUTCOME_ACTIVITY_TYPES.includes(payload.type)) {
    await syncBusinessStatusFromOutcome(businessId, payload.type);
  }

  const dm = data.decision_makers;
  const { decision_makers, ...rest } = data;
  return {
    ...rest,
    decision_maker_name: dm?.name ?? null,
  };
}

export async function updateActivity(id, businessId, form, performedBy) {
  const supabase = getSupabase();
  const payload = buildPayload(form, businessId, performedBy);

  const { data, error } = await supabase
    .from('activities')
    .update({
      decision_maker_id: payload.decision_maker_id,
      type: payload.type,
      notes: payload.notes,
      followup_at: payload.followup_at,
    })
    .eq('id', id)
    .select('*, decision_makers ( id, name )')
    .single();

  if (error) throw error;

  const dm = data.decision_makers;
  const { decision_makers, ...rest } = data;
  return {
    ...rest,
    decision_maker_name: dm?.name ?? null,
  };
}

export async function deleteActivity(id) {
  const supabase = getSupabase();
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;
}
