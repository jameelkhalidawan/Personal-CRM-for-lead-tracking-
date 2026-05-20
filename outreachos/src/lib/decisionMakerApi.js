import { getSupabase } from './supabase';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from './format';

const DM_SELECT = `
  *,
  businesses ( id, business_name )
`;

function str(field) {
  return String(field ?? '').trim();
}

/** Core columns always present in schema */
function buildCorePayload(form, businessId) {
  return {
    business_id: businessId,
    name: str(form.name),
    role: str(form.role) || null,
    email: str(form.email) || null,
    phone_number: str(form.phone_number) || null,
    linkedin_url: str(form.linkedin_url) || null,
    instagram_handle: str(form.instagram_handle) || null,
    facebook_url: str(form.facebook_url) || null,
    twitter_handle: str(form.twitter_handle) || null,
    notes: str(form.notes) || null,
    problem_notes: str(form.problem_notes) || null,
    preferred_contact: form.preferred_contact || null,
    last_contacted_at: fromDatetimeLocalValue(form.last_contacted_at),
    next_followup_at: fromDatetimeLocalValue(form.next_followup_at),
  };
}

function buildPayload(form, businessId) {
  return {
    ...buildCorePayload(form, businessId),
    is_primary: Boolean(form.is_primary),
  };
}

function isMissingPrimaryColumnError(err) {
  const msg = String(err?.message ?? err ?? '').toLowerCase();
  return msg.includes('is_primary') || msg.includes('schema cache');
}

export function decisionMakerToForm(dm) {
  if (!dm) return null;
  return {
    name: dm.name ?? '',
    role: dm.role ?? '',
    email: dm.email ?? '',
    phone_number: dm.phone_number ?? '',
    linkedin_url: dm.linkedin_url ?? '',
    instagram_handle: dm.instagram_handle ?? '',
    facebook_url: dm.facebook_url ?? '',
    twitter_handle: dm.twitter_handle ?? '',
    notes: dm.notes ?? '',
    problem_notes: dm.problem_notes ?? '',
    preferred_contact: dm.preferred_contact ?? '',
    is_primary: Boolean(dm.is_primary),
    last_contacted_at: toDatetimeLocalValue(dm.last_contacted_at),
    next_followup_at: toDatetimeLocalValue(dm.next_followup_at),
  };
}

export function mapDecisionMakerRow(row) {
  if (!row) return null;
  const business = row.businesses;
  const { businesses, ...rest } = row;
  return {
    ...rest,
    business_name: business?.business_name ?? null,
  };
}

export async function fetchDecisionMakersForBusinesses(businessIds) {
  if (!businessIds?.length) return {};
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('decision_makers')
    .select('*')
    .in('business_id', businessIds);

  if (error) throw error;
  const map = {};
  for (const dm of data ?? []) {
    if (!map[dm.business_id]) map[dm.business_id] = [];
    map[dm.business_id].push(dm);
  }
  return map;
}

export async function fetchDecisionMakersByBusiness(businessId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('decision_makers')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchAllDecisionMakers() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('decision_makers')
    .select(DM_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDecisionMakerRow);
}

export async function fetchDecisionMaker(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('decision_makers')
    .select(DM_SELECT)
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapDecisionMakerRow(data);
}

async function syncPrimaryContact(businessId, contactId) {
  const supabase = getSupabase();
  const { error: clearError } = await supabase
    .from('decision_makers')
    .update({ is_primary: false })
    .eq('business_id', businessId)
    .neq('id', contactId);
  if (clearError && !isMissingPrimaryColumnError(clearError)) throw clearError;

  const { error: setError } = await supabase
    .from('decision_makers')
    .update({ is_primary: true })
    .eq('id', contactId);
  if (setError && !isMissingPrimaryColumnError(setError)) throw setError;
}

export async function createDecisionMaker(businessId, form) {
  const supabase = getSupabase();
  let result = await supabase
    .from('decision_makers')
    .insert(buildCorePayload(form, businessId))
    .select('*')
    .single();

  if (result.error) throw result.error;

  let data = result.data;

  if (form.is_primary && data?.id) {
    try {
      await syncPrimaryContact(businessId, data.id);
      const refreshed = await supabase
        .from('decision_makers')
        .select('*')
        .eq('id', data.id)
        .single();
      if (!refreshed.error && refreshed.data) data = refreshed.data;
    } catch (err) {
      if (!isMissingPrimaryColumnError(err)) throw err;
    }
  }

  return data;
}

export async function updateDecisionMaker(id, businessId, form) {
  const supabase = getSupabase();
  const result = await supabase
    .from('decision_makers')
    .update(buildCorePayload(form, businessId))
    .eq('id', id)
    .select('*')
    .single();

  if (result.error) throw result.error;

  if (form.is_primary && id) {
    try {
      await syncPrimaryContact(businessId, id);
    } catch (err) {
      if (!isMissingPrimaryColumnError(err)) throw err;
    }
  }

  return result.data;
}

export async function deleteDecisionMaker(id) {
  const supabase = getSupabase();
  const { error } = await supabase.from('decision_makers').delete().eq('id', id);
  if (error) throw error;
}
