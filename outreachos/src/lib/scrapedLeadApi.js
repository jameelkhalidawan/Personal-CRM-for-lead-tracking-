import { getSupabase } from './supabase';

const LEAD_SELECT = `
  *
`;

const NOTE_SELECT = `
  *
`;

export const PROCESSING_STATUSES = [
  'fresh',
  'followup_1',
  'followup_2',
  'discard',
];

export const NEXT_STATUS = {
  fresh: 'followup_1',
  followup_1: 'followup_2',
  followup_2: 'discard',
};

export async function fetchScrapedLeads({ statuses = PROCESSING_STATUSES, jobId } = {}) {
  const supabase = getSupabase();
  let query = supabase
    .from('scraped_leads')
    .select(LEAD_SELECT)
    .in('status', statuses)
    .order('status_updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (jobId) {
    query = query.eq('scrape_job_id', jobId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchScrapedLeadNotes(leadId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('scraped_lead_notes')
    .select(NOTE_SELECT)
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function addScrapedLeadNote({ leadId, note, action = 'note', userId }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('scraped_lead_notes')
    .insert({
      lead_id: leadId,
      note: note.trim(),
      action,
      created_by: userId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScrapedLeadStatus(leadId, status) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('scraped_leads')
    .update({
      status,
      status_updated_at: new Date().toISOString(),
    })
    .eq('id', leadId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function transitionScrapedLead({ lead, nextStatus, note, action, userId }) {
  await addScrapedLeadNote({
    leadId: lead.id,
    note,
    action,
    userId,
  });
  return updateScrapedLeadStatus(lead.id, nextStatus);
}
