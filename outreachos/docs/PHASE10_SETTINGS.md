# Phase 10 — Email templates + settings + auto-start

**Status:** ✅ Complete

## Goal

- Full **email templates** CRUD (shared library)
- **Settings** page: account, reminders, appearance, startup, about
- **Light / dark** theme
- **Launch on Windows startup** (Electron)

## Prerequisites

- Phases 1–9 complete
- `email_templates` seeded in Supabase (6 default rows from schema)

## Test checklist

### A. Email templates

- [ ] **Email Templates** nav → table lists seeded templates
- [ ] **Search** and **Category** filter work
- [ ] **Add template** → save → appears in list
- [ ] Row click → view → **Edit** → save changes
- [ ] **Copy** puts subject + body on clipboard
- [ ] **Delete** → confirm → removed

### B. Appearance

- [ ] **Settings** → **Appearance** → switch **Light** / **Dark**
- [ ] Theme persists after refresh
- [ ] All main pages readable in both themes

### C. Startup (Electron only)

- [ ] **Settings** → enable **Launch when Windows starts**
- [ ] Windows Settings → Startup apps shows OutreachOS (or equivalent)
- [ ] Disable toggle → removed from startup

### D. Settings cleanup

- [ ] Reminders card still works (Phase 9)
- [ ] UI component demo cards removed from Settings
- [ ] **About** shows version and runtime

### E. Regression

- [ ] Dashboard Kanban, businesses, activities still work
- [ ] `npm run build` succeeds

## Key files

- `src/pages/EmailTemplatesPage.jsx`
- `src/stores/emailTemplateStore.js`
- `src/components/settings/` — Appearance, Startup, About
- `src/stores/preferencesStore.js`
- `src/index.css` + `tailwind.config.js` — CSS theme variables
- `electron/autoLaunch.cjs`

## Placeholders

Use in template subject/body: `{{business_name}}`, `{{contact_name}}`, `{{niche}}`, `{{your_name}}`
