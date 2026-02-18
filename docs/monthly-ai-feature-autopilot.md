# Monthly AI Feature Autopilot

## What is automated
1. Fetch monthly trend signals from Google Trends (US by default).
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

## Required GitHub Secrets
- `OPENAI_API_KEY`: API key for model calls.

## Optional GitHub Variables
- `AI_MODEL` (default: `gpt-4.1-mini`)
- `AI_BASE_URL` (default: `https://api.openai.com/v1`)
- `GOOGLE_TRENDS_GEO` (default: `US`)
- `AI_REVIEW_MIN_SCORE` (default: `75`)

## Local dry run (without AI API)
```bash
python scripts/monthly_ai_feature_pipeline.py --offline --force
```
