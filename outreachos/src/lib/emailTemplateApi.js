import { getSupabase } from './supabase';

export function templateToForm(template) {
  if (!template) return null;
  return {
    name: template.name ?? '',
    subject: template.subject ?? '',
    body: template.body ?? '',
    category: template.category ?? 'General',
  };
}

export async function fetchAllEmailTemplates() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createEmailTemplate(form) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('email_templates')
    .insert({
      name: form.name.trim(),
      subject: form.subject?.trim() || null,
      body: form.body?.trim() || null,
      category: form.category?.trim() || null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateEmailTemplate(id, form) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('email_templates')
    .update({
      name: form.name.trim(),
      subject: form.subject?.trim() || null,
      body: form.body?.trim() || null,
      category: form.category?.trim() || null,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEmailTemplate(id) {
  const supabase = getSupabase();
  const { error } = await supabase.from('email_templates').delete().eq('id', id);
  if (error) throw error;
}
