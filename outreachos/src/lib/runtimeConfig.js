/** Runtime Supabase config: baked .env (dev/build) or Electron userData file (installed app). */

let activeConfig = null;

export function getRuntimeSupabaseConfig() {
  if (activeConfig?.url?.trim() && activeConfig?.anonKey?.trim()) {
    return activeConfig;
  }
  const url = import.meta.env.VITE_SUPABASE_URL ?? '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  if (url.trim() && anonKey.trim()) {
    return { url: url.trim(), anonKey: anonKey.trim(), source: 'env' };
  }
  return { url: '', anonKey: '', source: 'none' };
}

export function setRuntimeSupabaseConfig(config) {
  activeConfig = config
    ? { url: config.url?.trim() ?? '', anonKey: config.anonKey?.trim() ?? '', source: config.source ?? 'file' }
    : null;
}

export function isRuntimeConfigComplete(config = getRuntimeSupabaseConfig()) {
  return Boolean(config?.url?.trim() && config?.anonKey?.trim());
}

export async function bootstrapRuntimeConfig() {
  if (typeof window !== 'undefined' && window.electronAPI?.appConfig) {
    try {
      const stored = await window.electronAPI.appConfig.get();
      if (stored?.url?.trim() && stored?.anonKey?.trim()) {
        setRuntimeSupabaseConfig({ ...stored, source: 'file' });
        return getRuntimeSupabaseConfig();
      }
    } catch {
      // fall through to baked env
    }
  }

  const baked = getRuntimeSupabaseConfig();
  if (isRuntimeConfigComplete(baked)) {
    setRuntimeSupabaseConfig(baked);
  }
  return getRuntimeSupabaseConfig();
}

export async function saveRuntimeSupabaseConfig(url, anonKey) {
  if (window.electronAPI?.appConfig) {
    const saved = await window.electronAPI.appConfig.set({ url, anonKey });
    setRuntimeSupabaseConfig({ ...saved, source: 'file' });
    return getRuntimeSupabaseConfig();
  }
  setRuntimeSupabaseConfig({ url, anonKey, source: 'env' });
  return getRuntimeSupabaseConfig();
}
