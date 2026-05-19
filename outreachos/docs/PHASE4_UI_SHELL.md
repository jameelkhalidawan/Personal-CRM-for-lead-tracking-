# Phase 4 — UI design system + layout shell

**Status:** ✅ Complete

## Goal

Fixed sidebar, six routes, shared UI components, premium dark theme.

## How to run

```powershell
cd "d:\Conscious Automation\CRM\outreachos"
npm run dev
```

Sign in first (Phase 2). Use sidebar or hash routes:

| Route | Screen |
|-------|--------|
| `/#/` | Dashboard |
| `/#/businesses` | Businesses |
| `/#/decision-makers` | Decision Makers (placeholder) |
| `/#/activities` | Activities (placeholder) |
| `/#/email-templates` | Email Templates (placeholder) |
| `/#/settings` | Settings + UI kit demo |

## Test checklist

### Layout & navigation

- [ ] Sidebar visible on all screens after login (240px, logo, 6 items)
- [ ] Click each nav item → correct page loads
- [ ] Active nav item has purple highlight
- [ ] User avatar + email at bottom of sidebar
- [ ] Resize window to **1024px** and **1440px** — sidebar fixed, main area scrolls

### UI components (Settings page)

- [ ] **Button variants:** Primary, Secondary, Ghost, Danger all visible
- [ ] **Badges:** Status and priority colors look correct
- [ ] **Form controls:** Search, input, select, textarea render
- [ ] **Open slide panel** → slides from right, backdrop visible, X and backdrop close it
- [ ] **Open confirm modal** → centered dialog, backdrop, Cancel / Delete work

### Console

- [ ] No red errors in DevTools (F12)

## Key files

- `src/layouts/AppLayout.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/ui/*`
- `src/routes/AppRouter.jsx`
- `src/pages/*Page.jsx`
