/** Runtime Supabase config: baked build env + optional overrides from Supabase DB (admin-managed). */

import { fetchAppConnectionFromDatabase } from './appSettingsApi';
import { resetSupabaseClient } from './supabase';

let activeConfig = null;

function getBakedConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL ?? '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  if (url.trim() && anonKey.trim()) {
    return { url: url.trim(), anonKey: anonKey.trim(), source: 'env' };
  }
  return null;
}

export function getRuntimeSupabaseConfig() {
  if (activeConfig?.url?.trim() && activeConfig?.anonKey?.trim()) {
    return activeConfig;
  }
  return getBakedConfig() ?? { url: '', anonKey: '', source: 'none' };
}

export function setRuntimeSupabaseConfig(config) {
  activeConfig = config
    ? {
        url: config.url?.trim() ?? '',
        anonKey: config.anonKey?.trim() ?? '',
        source: config.source ?? 'env',
      }
    : null;
}

export function isRuntimeConfigComplete(config = getRuntimeSupabaseConfig()) {
  return Boolean(config?.url?.trim() && config?.anonKey?.trim());
}

/** Initial connect — uses baked credentials from the installer build only (not local files). */
export async function bootstrapRuntimeConfig() {
  const baked = getBakedConfig();
  if (baked) {
    setRuntimeSupabaseConfig(baked);
  }
  return getRuntimeSupabaseConfig();
}

/** After login — apply admin-managed overrides from the database. */
export async function applyDatabaseConnectionOverride() {
  try {
    const fromDb = await fetchAppConnectionFromDatabase();
    if (fromDb) {
      setRuntimeSupabaseConfig(fromDb);
      resetSupabaseClient();
      return fromDb;
    }
  } catch {
    // keep baked config
  }
  return null;
}
