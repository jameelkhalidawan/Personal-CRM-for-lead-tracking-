import { getSupabase } from './supabase';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from './format';

const DM_SELECT = `
  *,
  businesses ( id, business_name )
`;

function buildPayload(form, businessId) {
  return {
    business_id: businessId,
    name: form.name.trim(),
    role: form.role.trim() || null,
    email: form.email.trim() || null,
    phone_number: form.phone_number.trim() || null,
    linkedin_url: form.linkedin_url.trim() || null,
    instagram_handle: form.instagram_handle.trim() || null,
    facebook_url: form.facebook_url.trim() || null,
    twitter_handle: form.twitter_handle.trim() || null,
    notes: form.notes.trim() || null,
    problem_notes: form.problem_notes.trim() || null,
    preferred_contact: form.preferred_contact || null,
    last_contacted_at: fromDatetimeLocalValue(form.last_contacted_at),
    next_followup_at: fromDatetimeLocalValue(form.next_followup_at),
  };
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

export async function createDecisionMaker(businessId, form) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('decision_makers')
    .insert(buildPayload(form, businessId))
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateDecisionMaker(id, businessId, form) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('decision_makers')
    .update(buildPayload(form, businessId))
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDecisionMaker(id) {
  const supabase = getSupabase();
  const { error } = await supabase.from('decision_makers').delete().eq('id', id);
  if (error) throw error;
}
