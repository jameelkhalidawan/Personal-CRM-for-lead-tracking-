import { DEFAULT_REMINDER_SETTINGS } from '../constants/reminder';
import { getSupabase } from './supabase';

export async function fetchReminderSettings(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('reminder_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { ...DEFAULT_REMINDER_SETTINGS, user_id: userId };
  return data;
}

export async function upsertReminderSettings(userId, settings) {
  const supabase = getSupabase();
  const payload = {
    user_id: userId,
    universal_enabled: settings.universal_enabled,
    check_interval_mins: settings.check_interval_mins,
    advance_notice_mins: settings.advance_notice_mins,
    overdue_alerts: settings.overdue_alerts,
  };

  const { data, error } = await supabase
    .from('reminder_settings')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
