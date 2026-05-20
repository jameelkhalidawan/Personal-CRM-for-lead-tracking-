import { getSupabase } from './supabase';

export function newScriptId() {
  return crypto.randomUUID?.() ?? `script-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeScripts(scripts) {
  const list = Array.isArray(scripts) ? scripts : [];
  return list
    .map((s, i) => ({
      id: s.id || newScriptId(),
      label: String(s.label ?? `Script ${i + 1}`).trim() || `Script ${i + 1}`,
      body: String(s.body ?? '').trim(),
    }))
    .filter((s) => s.label || s.body);
}

export function parseScriptsFromRow(row) {
  if (!row) return [];
  const raw = row.scripts;
  if (Array.isArray(raw)) return normalizeScripts(raw);
  if (typeof raw === 'string') {
    try {
      return normalizeScripts(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  return [];
}

export function mapCallTemplateRow(row) {
  if (!row) return null;
  return {
    ...row,
    scripts: parseScriptsFromRow(row),
  };
}

export function templateToForm(template) {
  if (!template) return null;
  const scripts = parseScriptsFromRow(template);
  return {
    name: template.name ?? '',
    category: template.category ?? 'General',
    scripts: scripts.length
      ? scripts
      : [{ id: newScriptId(), label: 'Opening', body: '' }],
  };
}

export async function fetchAllCallTemplates() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('call_templates')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCallTemplateRow);
}

export async function createCallTemplate(form) {
  const supabase = getSupabase();
  const scripts = normalizeScripts(form.scripts);
  const { data, error } = await supabase
    .from('call_templates')
    .insert({
      name: form.name.trim(),
      category: form.category?.trim() || null,
      scripts,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapCallTemplateRow(data);
}

export async function updateCallTemplate(id, form) {
  const supabase = getSupabase();
  const scripts = normalizeScripts(form.scripts);
  const { data, error } = await supabase
    .from('call_templates')
    .update({
      name: form.name.trim(),
      category: form.category?.trim() || null,
      scripts,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapCallTemplateRow(data);
}

export async function deleteCallTemplate(id) {
  const supabase = getSupabase();
  const { error } = await supabase.from('call_templates').delete().eq('id', id);
  if (error) throw error;
}
