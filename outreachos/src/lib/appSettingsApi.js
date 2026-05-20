import { getSupabase } from './supabase';

/** Load URL/key overrides stored in Supabase (admin-managed). */
export async function fetchAppConnectionFromDatabase() {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('get_app_connection_settings');
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.supabase_url?.trim() || !row?.supabase_anon_key?.trim()) {
    return null;
  }

  return {
    url: row.supabase_url.trim(),
    anonKey: row.supabase_anon_key.trim(),
    source: 'database',
  };
}

export async function verifyAdminPassword(password) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('verify_admin_password', {
    p_password: password,
  });
  if (error) throw error;
  return Boolean(data);
}

export async function updateAppConnectionInDatabase(password, url, anonKey) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('update_app_connection_settings', {
    p_password: password,
    p_url: url?.trim() ?? '',
    p_anon_key: anonKey?.trim() ?? '',
  });
  if (error) throw error;
  return Boolean(data);
}
