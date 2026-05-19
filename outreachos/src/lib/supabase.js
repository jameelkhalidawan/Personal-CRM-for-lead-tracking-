import { createClient } from '@supabase/supabase-js';
import { electronAuthStorage } from './authStorage';

const STAGE_LABELS = {
  config: 'Checking .env configuration…',
  network: 'Contacting Supabase servers…',
  api: 'Verifying API key…',
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient = null;

export function getSupabaseConfigError() {
  if (!supabaseUrl?.trim()) {
    return 'VITE_SUPABASE_URL is missing. Add it to your .env file.';
  }
  if (!supabaseAnonKey?.trim()) {
    return 'VITE_SUPABASE_ANON_KEY is missing. Add it to your .env file.';
  }

  try {
    const parsed = new URL(supabaseUrl.trim());
    if (!parsed.hostname.endsWith('.supabase.co')) {
      return 'VITE_SUPABASE_URL must be a valid https://xxxx.supabase.co URL.';
    }
  } catch {
    return 'VITE_SUPABASE_URL is not a valid URL.';
  }

  return null;
}

export function getSupabase() {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

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
 * Proves we can reach the Supabase project over the network (not just that .env is set).
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

  const baseUrl = supabaseUrl.trim().replace(/\/$/, '');
  const apiKey = supabaseAnonKey.trim();
  const projectHost = getProjectHost();
  const startedAt = performance.now();

  const authHeaders = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
  };

  report('network', `Contacting ${projectHost}…`);

  // Live request to Supabase Auth — proves URL is reachable and API key is accepted
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
