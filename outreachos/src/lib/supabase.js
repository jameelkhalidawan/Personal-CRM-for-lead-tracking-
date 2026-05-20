import { createClient } from '@supabase/supabase-js';
import { electronAuthStorage } from './authStorage';
import { getRuntimeSupabaseConfig } from './runtimeConfig';

const STAGE_LABELS = {
  config: 'Checking configuration…',
  network: 'Contacting Supabase servers…',
  api: 'Verifying API key…',
};

let supabaseClient = null;

export function resetSupabaseClient() {
  supabaseClient = null;
}

function getConfigValues() {
  const { url, anonKey } = getRuntimeSupabaseConfig();
  return { supabaseUrl: url, supabaseAnonKey: anonKey };
}

export function getSupabaseConfigError() {
  const { supabaseUrl, supabaseAnonKey } = getConfigValues();

  if (!supabaseUrl?.trim()) {
    return 'Supabase URL is missing. Configure it in Settings or during first-time setup.';
  }
  if (!supabaseAnonKey?.trim()) {
    return 'Supabase anon key is missing. Configure it in Settings or during first-time setup.';
  }

  try {
    const parsed = new URL(supabaseUrl.trim());
    if (!parsed.hostname.endsWith('.supabase.co')) {
      return 'Supabase URL must be a valid https://xxxx.supabase.co URL.';
    }
  } catch {
    return 'Supabase URL is not a valid URL.';
  }

  return null;
}

export function getSupabase() {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

  const { supabaseUrl, supabaseAnonKey } = getConfigValues();

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
      auth: {
        storage: electronAuthStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }

  return supabaseClient;
}

function getProjectHost() {
  const { supabaseUrl } = getConfigValues();
  try {
    return new URL(supabaseUrl.trim()).hostname;
  } catch {
    return 'unknown';
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Proves we can reach the Supabase project over the network (not just that config is set).
 */
export async function testSupabaseConnection(onProgress) {
  const report = (stage, message) => {
    onProgress?.({ stage, message, loading: true });
  };

  report('config', STAGE_LABELS.config);

  const configError = getSupabaseConfigError();
  if (configError) {
    return { ok: false, message: configError, stage: 'config' };
  }

  const { supabaseUrl, supabaseAnonKey } = getConfigValues();
  const baseUrl = supabaseUrl.trim().replace(/\/$/, '');
  const apiKey = supabaseAnonKey.trim();
  const projectHost = getProjectHost();
  const startedAt = performance.now();

  const authHeaders = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
  };

  report('network', `Contacting ${projectHost}…`);

  let healthResponse;
  try {
    healthResponse = await fetchWithTimeout(`${baseUrl}/auth/v1/health`, {
      headers: authHeaders,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        ok: false,
        message: `Could not reach ${projectHost} — request timed out. Check your internet or project URL.`,
        stage: 'network',
      };
    }
    return {
      ok: false,
      message: `Could not reach ${projectHost} — ${error.message}`,
      stage: 'network',
    };
  }

  if (healthResponse.status === 401 || healthResponse.status === 403) {
    return {
      ok: false,
      message:
        'Reached Supabase, but your API key was rejected. Use the publishable or anon key from Project Settings → API — not the secret key.',
      stage: 'api',
    };
  }

  if (!healthResponse.ok) {
    return {
      ok: false,
      message: `Connection failed at ${projectHost} (HTTP ${healthResponse.status}).`,
      stage: 'network',
    };
  }

  report('api', 'Confirming project responds…');

  let healthBody;
  try {
    healthBody = await healthResponse.json();
  } catch {
    return {
      ok: false,
      message: 'Supabase responded but returned invalid data.',
      stage: 'api',
    };
  }

  const latencyMs = Math.round(performance.now() - startedAt);
  const authVersion = healthBody?.version ? `Auth ${healthBody.version}` : 'Auth online';

  return {
    ok: true,
    message: `Connected to ${projectHost} — live Supabase response verified (${latencyMs}ms, ${authVersion}).`,
    stage: 'connected',
    projectHost,
    latencyMs,
  };
}
