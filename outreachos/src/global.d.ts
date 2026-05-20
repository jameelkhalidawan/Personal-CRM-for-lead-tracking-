export {};

declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      isElectron: boolean;
      authStorage: {
        getItem: (key: string) => Promise<string | null>;
        setItem: (key: string, value: string) => Promise<boolean>;
        removeItem: (key: string) => Promise<boolean>;
        clear: () => Promise<boolean>;
      };
      authFlags: {
        get: () => Promise<{ hasEverLoggedIn: boolean }>;
        set: (flags: { hasEverLoggedIn: boolean }) => Promise<boolean>;
      };
      autoLaunch?: {
        isEnabled: () => Promise<boolean>;
        setEnabled: (enabled: boolean) => Promise<boolean>;
      };
      reminders?: {
        notify: (payload: {
          title: string;
          body: string;
          businessId: string | null;
        }) => Promise<{ ok: boolean; reason?: string }>;
        onOpenBusiness: (callback: (businessId: string) => void) => () => void;
      };
    };
  }
}
