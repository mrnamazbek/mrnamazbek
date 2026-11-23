# Scheduled public feeds

The Next.js site renders curated experiments in `/lab`, with source dates and methodology. Content generation is a repository maintenance task; the production frontend and API run in Next.js on Vercel.

## Monthly experiments

The monthly feature generator is run manually as a repository maintenance task. It fetches trend signals, generates a structured experiment specification, validates and synchronizes `assets/ai_monthly_feature.json` and `assets/ai_feature_history.json` into `src/content/snapshots`, and can publish those snapshots to Supabase after review.

The generator supports roadmap, capacity, and trade-off matrix widgets. Their React renderers live in `src/components/lab/experiments.tsx`. The generator still emits the original static-page test file for historical compatibility; active release tests live in `tests/e2e` and cover all supported widgets.

`OPENAI_API_KEY` enables model-assisted generation. Without it, the generator uses its deterministic trend-based fallback. Optional variables are `AI_MODEL`, `AI_BASE_URL`, and `GOOGLE_TRENDS_GEO`.

## Other feeds

| Workflow | Schedule | Published snapshot |
| --- | --- | --- |
| `update-db-ranking.yml` | Day 2, 03:15 UTC | `rankings` |
| `telegram-feed.yml` | Every six hours, at minute 17 | `telegram` |

The audience uses Wikimedia pageviews as a dated attention proxy, not active-user estimates. Telegram notes appear on `/writing` when the exported snapshot contains posts. Rankings show their saved source date. Currency and weather on `/lab` use the Next.js `/api/signals` endpoint separately from these snapshots.

## Database publication

The repository secrets `SUPABASE_URL` and `SUPABASE_SECRET_KEY` enable feed publication. Workflows scope each write to their own snapshot keys; they never replace profile, experience, books, articles, or messages. Missing credentials leave local snapshots available and report that database publication is unconfigured. Failed configured uploads fail the publication step.

Local commands:

```sh
npm run feature:monthly:offline
python scripts/update_ai_audience_weekly.py
npm run content:sync -- --only=audience
# Explicit remote publication, after reviewing the selected generated feed:
npm run content:sync:database -- --only=audience
```

A normal `npm run build` validates and copies public snapshots locally without writing to Supabase. See [DATA.md](DATA.md) for contracts and editorial content. The remaining scheduled GitHub workflows run from the repository's default branch.

The optional `.gitlab-ci.yml` cloud-agent export is retained as a separate legacy maintenance integration. It does not host the website backend and is inactive unless configured in GitLab.
