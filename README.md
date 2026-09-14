# Water Business Manager

A responsive React + TypeScript + Vite bookkeeping app for a small water-can, bottled-water and juice supply business.

## Features

- Single-user login: `Water` / `Bottle`
- Persistent browser storage with localStorage
- Shop management
- Product management
- Morning supply entry
- Evening collection
- Partial payments and carry-forward balances
- Shop ledger through transaction history
- Outstanding payments
- Reports and CSV export
- JSON backup/restore
- Responsive mobile layout
- Light/dark mode
- Indian Rupee formatting and India date conventions

## Run locally

1. Install Node.js (LTS).
2. Open this folder in VS Code.
3. Open the terminal in the project folder.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Deploy

This is a Vite SPA. You can deploy the `dist` folder to Netlify, Vercel, GitHub Pages (with SPA routing considerations), or another static host.

## Important storage note

This version stores business data in the browser's localStorage. That means the data is tied to that browser/device. Use **Settings → Download JSON Backup** regularly.

For a production system that must synchronize across multiple phones/computers, replace `src/storage.ts` with a hosted database/authentication layer such as Supabase and configure real server-side authentication.

## Security note

The requested credentials are implemented in the frontend. This is acceptable for a local/simple prototype but is **not secure authentication for a public production application**, because frontend code can be inspected. For real business deployment, use server-side authentication and database security.
