# Site verification

Use the Next.js production server for release checks. Legacy static-page tests remain historical references; the active browser suite is `tests/e2e`.

1. Run `npm run check` for lint, TypeScript, and backend/data contracts.
2. Run `npm run build`, then `npm run test:e2e` for the production app.
3. Inspect desktop and mobile home, lab, writing, library, and contact pages in both themes. Confirm navigation, focus return, filtering, readable contrast, and no page overflow.
4. Verify reduced-motion and WebGL-unavailable visitors can read and navigate using the static hero fallback.
5. Check the lab's worker timeout, generated configuration downloads, adjustable cost model, clocks, DAG validation, and external feed failure states.
6. Check `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, resume download, legacy blog redirects, and unknown-page recovery.
7. Against the intended Supabase project, confirm published reads, draft privacy, private contact tables, denied anonymous writes/RPC calls, and actual contact persistence. Use identified QA records and remove only those records after checking.
8. Stage a production Vercel deployment, verify pages and APIs on its URL, then promote that exact build. Inspect runtime error logs afterward.

The contact success message means the message is saved in Supabase. It does not promise email delivery. `/api/health` is a liveness check; public content can use validated local fallback during a database outage.

For a manual Lighthouse audit, start the production app on port 4173 first. `scripts/run_lighthouse_mobile.ps1` points at that address and saves its report under the ignored `artifacts` directory.
