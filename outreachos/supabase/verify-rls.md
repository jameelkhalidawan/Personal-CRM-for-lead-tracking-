# Verify RLS from the app (after schema is applied)

Use this after you have run `schema.sql` and are logged into OutreachOS.

## In browser DevTools (Electron → detach DevTools → Console)

```javascript
// Uses your app's Supabase client if you expose it temporarily, or run from a small test page.
// Easiest: wait for Phase 5 Businesses UI to add a lead from the app.
```

## Expected behavior

| Caller | Insert into `businesses` |
|--------|--------------------------|
| Logged-in app (JWT in headers) | Allowed |
| No JWT / logged out | Blocked by RLS |

Supabase returns an error like `new row violates row-level security policy` when blocked.
