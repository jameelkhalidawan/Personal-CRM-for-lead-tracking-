import { mergeOutreachTiming } from '../lib/outreachTiming';
import { usePreferencesStore } from '../stores/preferencesStore';

export function useOutreachTiming() {
  const outreachTiming = usePreferencesStore((s) => s.outreachTiming);
  return mergeOutreachTiming(outreachTiming);
}
