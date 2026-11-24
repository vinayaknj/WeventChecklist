# Wedding Studio Client Register (GitHub + Supabase)

## What this setup gives you

1. Frontend hosted on GitHub Pages (low/no cost).
2. Shared data storage in Supabase Postgres.
3. CRUD from browser: add, view, edit, delete events.

## 1. Create Supabase table

1. Open your Supabase project.
2. Go to SQL Editor.
3. Run [supabase-schema.sql](supabase-schema.sql).

## 2. Configure frontend keys

1. Open Supabase Project Settings -> API.
2. Copy:
   - Project URL
   - anon public key
3. Edit [supabase-config.js](supabase-config.js):

```javascript
window.SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY",
};
```

## 3. Run locally

1. Open [index.html](index.html) in browser.
2. Add/Edit/Delete events.
3. Records are stored in Supabase.

If Supabase config is missing/invalid, the app falls back to local browser storage.

## 4. Host on GitHub Pages

1. Push these files to a GitHub repository.
2. In GitHub repo Settings -> Pages:
   - Source: Deploy from branch
   - Branch: `main` (or your default), folder `/root`
3. Wait for deploy and open your GitHub Pages URL.

## Important security note

1. `anonKey` is public and can be used in frontend apps.
2. Keep Row Level Security enabled.
3. Current policy in [supabase-schema.sql](supabase-schema.sql) allows anon CRUD for simplicity.
4. For production, restrict policies (for example, add authentication and role-based access).
