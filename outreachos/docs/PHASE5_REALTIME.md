# Phase 5 — Enable Realtime for businesses

For live updates when another user edits a business:

1. Supabase Dashboard → **Database** → **Replication**
2. Enable replication for:
   - `businesses`
   - `business_services`
3. Or run SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_services;
```

If realtime is off, the app still works — refresh by navigating away and back, or restart the app.
