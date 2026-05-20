import { create } from 'zustand';
import { getSupabase, getSupabaseConfigError } from '../lib/supabase';
import { applyDatabaseConnectionOverride } from '../lib/runtimeConfig';
import {
  clearElectronAuthStorage,
  getAuthFlags,
  setAuthFlags,
} from '../lib/authStorage';

let authListenerBound = false;

async function syncDatabaseConnectionFromServer() {
  try {
    await applyDatabaseConnectionOverride();
  } catch {
    // keep baked bootstrap credentials
  }
}

function mapAuthError(message) {
  const lower = (message ?? '').toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password.';
  }
  if (lower.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in.';
  }
  if (lower.includes('password')) {
    return message;
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Check your connection and try again.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email before signing in, or disable email confirmation in Supabase Auth settings.';
  }
  return message || 'Something went wrong. Please try again.';
}

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  error: null,
  authView: 'login', // 'login' | 'register'

  setAuthView: (authView) => set({ authView, error: null }),

  clearError: () => set({ error: null }),

  initialize: async () => {
    const state = useAuthStore.getState();
    if (state.initialized) return;

    const configError = getSupabaseConfigError();
    if (configError) {
      set({
        loading: false,
        initialized: true,
        error: configError,
        user: null,
        session: null,
      });
      return;
    }

    const supabase = getSupabase();
    const flags = await getAuthFlags();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      set({
        loading: false,
        initialized: true,
        error: mapAuthError(error.message),
        user: null,
        session: null,
        authView: flags.hasEverLoggedIn ? 'login' : 'register',
      });
      return;
    }

    set({
      user: session?.user ?? null,
      session: session ?? null,
      loading: false,
      initialized: true,
      error: null,
      authView: session ? 'login' : flags.hasEverLoggedIn ? 'login' : 'register',
    });

    if (session) {
      await syncDatabaseConnectionFromServer();
    }

    if (!authListenerBound) {
      authListenerBound = true;
      supabase.auth.onAuthStateChange(async (event, nextSession) => {
        if (event === 'SIGNED_OUT') {
          set({ user: null, session: null });
          return;
        }
        if (nextSession) {
          await setAuthFlags({ hasEverLoggedIn: true });
          await syncDatabaseConnectionFromServer();
          set({
            user: nextSession.user,
            session: nextSession,
            error: null,
          });
        }
      });
    }
  },

  signUp: async ({ name, email, password, confirmPassword }) => {
    set({ error: null, loading: true });

    if (!name.trim()) {
      set({ error: 'Name is required.', loading: false });
      return { ok: false };
    }
    if (!email.trim()) {
      set({ error: 'Email is required.', loading: false });
      return { ok: false };
    }
    if (password.length < 6) {
      set({ error: 'Password must be at least 6 characters.', loading: false });
      return { ok: false };
    }
    if (password !== confirmPassword) {
      set({ error: 'Passwords do not match.', loading: false });
      return { ok: false };
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            display_name: name.trim(),
          },
        },
      });

      if (error) {
        set({ error: mapAuthError(error.message), loading: false });
        return { ok: false };
      }

      if (!data.session) {
        set({
          loading: false,
          error:
            'Account created. Check your email to confirm, or disable email confirmation in Supabase → Authentication → Providers → Email.',
          authView: 'login',
        });
        return { ok: false };
      }

      await setAuthFlags({ hasEverLoggedIn: true });
      await syncDatabaseConnectionFromServer();
      set({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });
      return { ok: true };
    } catch (err) {
      set({
        error: mapAuthError(err.message),
        loading: false,
      });
      return { ok: false };
    }
  },

  signIn: async ({ email, password }) => {
    set({ error: null, loading: true });

    if (!email.trim()) {
      set({ error: 'Email is required.', loading: false });
      return { ok: false };
    }
    if (!password) {
      set({ error: 'Password is required.', loading: false });
      return { ok: false };
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        set({ error: mapAuthError(error.message), loading: false });
        return { ok: false };
      }

      await setAuthFlags({ hasEverLoggedIn: true });
      await syncDatabaseConnectionFromServer();
      set({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });
      return { ok: true };
    } catch (err) {
      set({
        error: mapAuthError(err.message),
        loading: false,
      });
      return { ok: false };
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch {
      // continue clearing local session even if network fails
    }
    await clearElectronAuthStorage();
    set({
      user: null,
      session: null,
      loading: false,
      authView: 'login',
      error: null,
    });
  },
}));
