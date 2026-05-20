import { getSupabase } from './supabase';

const BUSINESS_SELECT = `
  *,
  business_services (
    service_id,
    services ( id, name )
  )
`;

export function mapBusinessRow(row) {
  if (!row) return null;
  const services = (row.business_services ?? [])
    .map((bs) => bs.services)
    .filter(Boolean);
  const { business_services, ...rest } = row;
  return { ...rest, services };
}

export async function fetchAllBusinesses() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('businesses')
    .select(BUSINESS_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapBusinessRow);
}

export async function fetchServices() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('services')
    .select('id, name, description, is_active')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function fetchBusinessDetail(businessId) {
  const supabase = getSupabase();

  const [businessRes, dmRes, actRes] = await Promise.all([
    supabase.from('businesses').select(BUSINESS_SELECT).eq('id', businessId).single(),
    supabase
      .from('decision_makers')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true }),
    supabase
      .from('activities')
      .select('*, decision_makers ( id, name )')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false }),
  ]);

  if (businessRes.error) throw businessRes.error;

  const activities = (actRes.data ?? []).map((row) => {
    const dm = row.decision_makers;
    const { decision_makers, ...rest } = row;
    return {
      ...rest,
      decision_maker_name: dm?.name ?? null,
    };
  });

  return {
    business: mapBusinessRow(businessRes.data),
    decisionMakers: dmRes.data ?? [],
    activities,
  };
}

function buildBusinessPayload(form) {
  return {
    business_name: form.business_name.trim(),
    niche: form.niche.trim() || null,
    business_email: form.business_email.trim() || null,
    website_url: form.website_url.trim() || null,
    linkedin_url: form.linkedin_url.trim() || null,
    phone_number: form.phone_number.trim() || null,
    city: form.city.trim() || null,
    state: form.state.trim() || null,
    country: form.country.trim() || null,
    problem_notes: form.problem_notes.trim() || null,
    lead_source: form.lead_source.trim() || null,
    status: form.status,
    priority: form.priority,
    estimated_value:
      form.estimated_value === '' || form.estimated_value == null
        ? null
        : Number(form.estimated_value),
    last_contacted_at: form.last_contacted_at || null,
    next_followup_at: form.next_followup_at || null,
  };
}

export async function syncBusinessServices(businessId, serviceIds) {
  const supabase = getSupabase();
  const { error: delError } = await supabase
    .from('business_services')
    .delete()
    .eq('business_id', businessId);

  if (delError) throw delError;

  if (!serviceIds?.length) return;

  const { error: insError } = await supabase.from('business_services').insert(
    serviceIds.map((service_id) => ({ business_id: businessId, service_id })),
  );

  if (insError) throw insError;
}

export async function createBusiness(form) {
  const supabase = getSupabase();
  const payload = buildBusinessPayload(form);

  const { data, error } = await supabase
    .from('businesses')
    .insert(payload)
    .select(BUSINESS_SELECT)
    .single();

  if (error) throw error;

  await syncBusinessServices(data.id, form.serviceIds);

  const refreshed = await supabase
    .from('businesses')
    .select(BUSINESS_SELECT)
    .eq('id', data.id)
    .single();

  if (refreshed.error) throw refreshed.error;
  return mapBusinessRow(refreshed.data);
}

export async function updateBusiness(id, form) {
  const supabase = getSupabase();
  const payload = buildBusinessPayload(form);

  const { data, error } = await supabase
    .from('businesses')
    .update(payload)
    .eq('id', id)
    .select(BUSINESS_SELECT)
    .single();

  if (error) throw error;

  await syncBusinessServices(id, form.serviceIds);

  const refreshed = await supabase
    .from('businesses')
    .select(BUSINESS_SELECT)
    .eq('id', id)
    .single();

  if (refreshed.error) throw refreshed.error;
  return mapBusinessRow(refreshed.data);
}

export async function patchBusinessStatus(id, status) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('businesses')
    .update({ status })
    .eq('id', id)
    .select(BUSINESS_SELECT)
    .single();

  if (error) throw error;
  return mapBusinessRow(data);
}

export async function deleteBusiness(id) {
  const supabase = getSupabase();
  const { error } = await supabase.from('businesses').delete().eq('id', id);
  if (error) throw error;
}
