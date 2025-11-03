# Brainster — AI at Work ROI

Zero-dependency Next.js (App Router) app. All styling inline so Vercel never serves stale CSS.

## Run locally
npm i
npm run dev

## Deploy
- Commit to `main` (GitHub)
- Vercel will auto-build

## Troubleshooting
- If Vercel logs reference old imports (e.g., `decodeInputs`), you’re deploying an older commit.
- Ensure the latest commit includes changes to `app/page.tsx` and `app/report/page.tsx`.
- Search for duplicate routes: `src/app/report/page.tsx`, `pages/report.tsx`, or `app/(...)/report/page.tsx` and delete them.
