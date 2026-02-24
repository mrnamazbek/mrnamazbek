# Monthly AI Feature Autopilot

## What is automated
1. Fetch monthly trend signals from Google Trends (KZ by default).
2. Build a feature brief and send it to AI (ChatGPT API or OpenAI-compatible endpoint).
3. Generate/update:
   - `assets/ai_monthly_feature.json`
   - `assets/ai_feature_history.json`
   - `tests/monthly-ai-feature.spec.js`
4. Run Playwright responsive tests.
5. Run Lighthouse mobile audit.
6. Capture a mobile screenshot and ask AI to review UI quality.
7. Commit and push changes from GitHub Actions.

## Workflow
- File: `.github/workflows/monthly-ai-feature.yml`
- Schedule: day 2 of each month at 04:00 UTC
- Manual run: `workflow_dispatch` with optional `force_regenerate=true`

## GitLab schedule to push feature JSON to a cloud agent
- File: `.gitlab-ci.yml`
- Job: `monthly_ai_feature_to_cloud_agent`
- Optional GitLab CI variables (required only if you want cloud-agent POST):
  - `CLOUD_AGENT_URL`: endpoint of your cloud agent intake API
  - `CLOUD_AGENT_TOKEN`: bearer token for that endpoint
- The job regenerates `assets/ai_monthly_feature.json` and POSTs it to the cloud agent.

## Live FX + Weather widget
- Rendered by `assets/ai-monthly-feature.js` into `#ai-live-signals-root`.
- Rates source: ExchangeRate-API (`USD -> RUB, GBP, EUR`).
- Weather source: Open-Meteo (`Almaty`, `Shymkent`, `Astana`).
- On network/API errors, the widget degrades gracefully and shows `N/A` without breaking the page.

## Additional Weekly Automation
- File: `.github/workflows/weekly-ai-audience.yml`
- Schedule: every Monday at 04:30 UTC
- Updates `assets/ai_audience_weekly.json` from Wikimedia Pageviews API.
- Runs `tests/ai-audience-engagement.spec.js`.
- Commits and pushes dataset updates automatically.

## Required GitHub Secrets
- `OPENAI_API_KEY`: API key for model calls.

## Optional GitHub Variables
- `AI_MODEL` (default: `gpt-5.2`)
- `AI_BASE_URL` (default: `https://api.openai.com/v1`)
- `GOOGLE_TRENDS_GEO` (default: `KZ`)
- `AI_REVIEW_MIN_SCORE` (default: `75`)

## Local dry run (without AI API)
```bash
python scripts/monthly_ai_feature_pipeline.py --offline --force
```

## Weekly audience dataset update (local)
```bash
python scripts/update_ai_audience_weekly.py
```
