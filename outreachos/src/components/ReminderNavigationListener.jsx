import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function ReminderNavigationListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const openBusiness = (businessId) => {
      if (!businessId) return;
      navigate('/businesses', { state: { openBusinessId: businessId } });
    };

    const onCustomEvent = (e) => {
      openBusiness(e.detail?.businessId);
    };

    window.addEventListener('outreachos:open-business', onCustomEvent);

    const api = window.electronAPI?.reminders;
    if (api?.onOpenBusiness) {
      const unsubscribe = api.onOpenBusiness(openBusiness);
      return () => {
        unsubscribe?.();
        window.removeEventListener('outreachos:open-business', onCustomEvent);
      };
    }

    return () => {
      window.removeEventListener('outreachos:open-business', onCustomEvent);
    };
  }, [navigate]);

  return null;
}
