# Phase 1 — Project scaffold + Supabase setup

**Status:** ✅ Complete

## Goal

Electron + React + Vite + Tailwind app that connects to your Supabase project.

## Prerequisites

- Node.js 20+
- Supabase free-tier project

## Setup steps

### 1. Create Supabase project

1. [supabase.com](https://supabase.com) → **New project**
2. Save database password
3. **Project Settings → API** → copy **Project URL** and **publishable** key (`sb_publishable_…` or legacy `anon` JWT)

### 2. Environment file

```powershell
cd "d:\Conscious Automation\CRM\outreachos"
Copy-Item .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key
```

### 3. Install and run

```powershell
npm install
npm run dev
```

Electron window should open (not browser-only).

## Test checklist

- [ ] `npm run dev` opens **Electron** window
- [ ] Shows **Hello OutreachOS** (not blank)
- [ ] Purple **Tailwind accent** bar visible
- [ ] **Database / Supabase** section shows green success with Auth version + ms
- [ ] `git status` does **not** list `.env`

## Key files

- `electron/main.cjs`, `electron/preload.cjs`
- `vite.config.js`, `tailwind.config.js`
- `src/lib/supabase.js`
- `.env.example`, `.gitignore`
