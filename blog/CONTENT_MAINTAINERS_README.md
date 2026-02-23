# Content Maintainers README

## What this folder contains

```
blog/
├── trends-tldr-2026-02.md              # Monthly trends TL;DR (Feb 2026)
├── post-a-postgres-query-optimization.md
├── post-b-etl-ai-feature-pipelines.md
├── post-c-python-performance-data-pipelines.md
├── demos/
│   ├── post-a-postgres/                # Runnable demo for Post A
│   ├── post-b-feature-pipeline/        # Runnable demo for Post B
│   └── post-c-python-perf/             # Runnable demo for Post C
└── CONTENT_MAINTAINERS_README.md       # This file
```

## How to regenerate posts monthly

### Step 1: Gather fresh sources (5 minutes)

Run these searches to find sources published in the last 30 days:

```
1. "data engineering trends [YEAR]" site:joereis.net OR site:substack.com
2. "data engineering python" site:kdnuggets.com OR site:opensourceforU.com
3. "databricks [MONTH] [YEAR]" blog roundup
4. "python release" site:docs.python.org
5. "feature store [YEAR]" OR "duckdb [YEAR]" engineering blog
```

Copy the 5–8 most relevant URLs. Update `trends-tldr-[YEAR]-[MM].md` with the new sources.

### Step 2: Use the AI prompt template

Copy the prompt below and paste it into your AI assistant (Claude, GPT-4o, or similar).
Fill in the placeholders marked `[LIKE THIS]`.

```
ROLE: You are an expert technical writer and senior Data Engineer.
Write in simple English (B1 level). Target audience: strong-junior → middle Data Engineer.

TASK: Update the following blog post for [MONTH YEAR].

CURRENT POST TOPIC: [PASTE TOPIC HERE, e.g. "Postgres query optimization"]

FRESH SOURCES TO CITE (published in last 30 days):
[PASTE URLs HERE]

REQUIREMENTS:
- Update the date field in YAML front-matter to [YYYY-MM-DD].
- Update the trends/motivation section to reference the new sources.
- Keep all code blocks unchanged unless a library version has changed.
- Keep word count between 900 and 1600 words (excluding code).
- Keep the same COMMON OUTPUT FORMAT:
  1. YAML front-matter
  2. TL;DR
  3. Audience line
  4. Motivation
  5. Learning goals (3 bullets)
  6. Background theory
  7. Practical example (Python, Docker, tests)
  8. How to run locally
  9. Complexity & performance notes
  10. Real-world tips
  11. SEO features
  12. Cross-post snippet (Medium + Dev.to)
  13. Final checklist
  14. Convert to other formats
  15. Sources list

OUTPUT: A single markdown code block containing the full updated post.
```

### Step 3: Validate the updated post

After the AI generates the updated post:

1. **Run unit tests:**
   ```bash
   cd blog/demos/post-[a|b|c]-*/
   pip install -r requirements.txt
   pytest tests/test_unit.py -v
   ```

2. **Run smoke tests** (with Docker):
   ```bash
   docker compose up --build
   pytest tests/test_smoke.py -v -m integration
   ```

3. **Lint the Python code:**
   ```bash
   pip install ruff
   ruff check blog/demos/
   ```

4. **Check the CI workflow:**
   The `.github/workflows/blog-ci.yml` runs automatically on push.
   All jobs must be green before publishing.

5. **Verify the markdown renders correctly:**
   Open the file in VS Code with the Markdown Preview extension,
   or push to a GitHub branch and view it there.

### Step 4: Commit and push

```bash
git add blog/
git commit -m "content: update blog posts for [MONTH YEAR]"
git push
```

---

## File naming conventions

| File type | Pattern | Example |
|-----------|---------|---------|
| Monthly TL;DR | `trends-tldr-YYYY-MM.md` | `trends-tldr-2026-03.md` |
| Blog post | `post-[letter]-[slug].md` | `post-a-postgres-query-optimization.md` |
| Demo folder | `demos/post-[letter]-[slug]/` | `demos/post-a-postgres/` |

## YAML front-matter fields

All posts must have these fields:

```yaml
---
title: "..."
description: "..."          # max 160 chars for SEO
date: YYYY-MM-DD
tags:
  - tag1
  - tag2
canonical_url: "https://..."
image: "assets/images/..."
reading_time: "X min"
---
```

## Adding a new post

1. Create `blog/post-[next-letter]-[slug].md` using an existing post as a template.
2. Create `blog/demos/post-[next-letter]-[slug]/` with the full demo structure:
   - `app.py` or equivalent entry point
   - `requirements.txt`
   - `Dockerfile`
   - `docker-compose.yml`
   - `tests/test_unit.py`
   - `tests/test_smoke.py`
3. Add a new job to `.github/workflows/blog-ci.yml` following the existing pattern.
4. Run all tests locally before pushing.

## Required GitHub secrets and variables

None are required for the blog CI workflow.
The `OPENAI_API_KEY` secret is only needed for the monthly-ai-feature autopilot workflow
(see `docs/monthly-ai-feature-autopilot.md`).

## Demo dependencies versioning policy

- Pin all Python dependencies to exact versions in `requirements.txt`.
- Update versions once per quarter, or when a security advisory is issued.
- After updating versions, re-run all unit and smoke tests.

## Publishing to external platforms

### Medium

1. Copy the **Cross-post snippet → Medium** section from the blog post.
2. Paste into a new Medium story.
3. Add the canonical link: Story Settings → SEO → Canonical URL → paste the `canonical_url` from the front-matter.

### Dev.to

1. Create a new post on Dev.to.
2. In the front matter, add:
   ```
   canonical_url: https://mrnamazbek.github.io/blog/[slug]
   ```
3. Copy the **Cross-post snippet → Dev.to** section and expand it to full length.

---

*Last updated: 2026-02-23*
