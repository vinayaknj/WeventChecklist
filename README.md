# Vivah Premium Wedding — Client Booking Register

## What this setup gives you

1. Frontend hosted on GitHub Pages (₹0 hosting cost).
2. Persistent storage in **Google Sheets** (never pauses, with built-in Google Drive Version History).
3. **Studio PIN protection** verified inside Google Apps Script (the PIN is never stored in GitHub).
4. Full CRUD from desktop or mobile: add, search, view, edit, delete events, and export CSV backups.

---

## 1. Set up Google Sheets + Studio PIN (2 minutes)

1. Create a new Google Sheet in Google Drive (e.g. `Vivah Premium Wedding Bookings`).
2. In the Google Sheet, open **Extensions → Apps Script**.
3. Copy the entire contents of [google-apps-script.gs](google-apps-script.gs) and paste it into `Code.gs`.
4. Change `const STUDIO_PIN = "1234";` at the top of `Code.gs` to your own secret Studio PIN, then click **Save**.
5. Click **Deploy → New deployment**:
   - Click the gear icon → select **Web app**
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
   - Click **Deploy**, authorize the permissions prompt, and copy the **Web app URL** (it ends with `/exec`).

---

## 2. Connect the frontend

Edit [sheets-config.js](sheets-config.js) and paste your Web App URL:

```javascript
window.SHEETS_CONFIG = {
  webAppUrl: "https://script.google.com/macros/s/YOUR_ACTUAL_DEPLOYMENT_ID/exec",
};
```

> **Note**: When `sheets-config.js` is configured, the app uses Google Sheets + Studio PIN. If neither Google Sheets nor Supabase is configured, it falls back to local browser storage.

---

## 3. Run locally or host on GitHub Pages

1. Open [index.html](index.html) locally or push to GitHub (`main` branch, `/root` folder in **Settings → Pages**).
2. Enter your Studio PIN on the unlock screen to view, add, edit, or delete events.
3. Use **Export CSV** in **All Events** anytime to download an offline backup.

---

## Optional: Supabase mode

If you use Supabase instead of Google Sheets, keep `sheets-config.js` with its placeholder URL, run [supabase-schema.sql](supabase-schema.sql) in the Supabase SQL Editor, and set credentials in [supabase-config.js](supabase-config.js).
