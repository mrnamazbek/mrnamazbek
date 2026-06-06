<!-- ═══════════════════════════════════════════════════════════════════════
     NAMAZBEK BEKZHANOV · github.com/mrnamazbek
     This repository is BOTH my GitHub profile README *and* the source of my
     live, self-updating personal website → https://mrnamazbek.github.io/mrnamazbek/
     ═══════════════════════════════════════════════════════════════════════ -->

<!-- Dynamic Gradient Wave Header -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,3,5,6&height=200&section=header&text=NAMAZBEK%20BEKZHANOV&fontSize=50&fontColor=fff&animation=fadeIn&fontAlignY=35&desc=Data%20Engineering%20%E2%80%A2%20Backend%20%E2%80%A2%20Self-Updating%20Systems&descSize=16&descAlignY=53" />

<div align="center">

<!-- Multi-line Terminal Simulation -->
<a href="https://github.com/mrnamazbek">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3200&pause=900&color=00F7F7&center=true&vCenter=true&multiline=true&repeat=true&width=760&height=130&lines=Middle+Data+Engineer+%40+National+Bank+of+Kazakhstan;I+build+self-updating+data+systems;This+profile+IS+a+live%2C+self-deploying+website;Spark+%E2%80%A2+Airflow+%E2%80%A2+Python+%E2%80%A2+SQL+%E2%80%A2+ML" alt="Typing SVG" />
</a>

<!-- Quick Links (clickable) -->
<p>
<a href="https://mrnamazbek.github.io/mrnamazbek/"><img src="https://img.shields.io/badge/🌐_Live_Site-Visit-00F7F7?style=for-the-badge&labelColor=0D1117" /></a>
<a href="assets/Namazbek_s_Resume_INT.pdf"><img src="https://img.shields.io/badge/📄_Résumé-PDF-e74c3c?style=for-the-badge&labelColor=0D1117" /></a>
<a href="https://www.linkedin.com/in/namazbek-bekzhanov/"><img src="https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white&labelColor=0D1117" /></a>
<a href="mailto:namazbekzhan@gmail.com"><img src="https://img.shields.io/badge/Email-Contact-D14836?style=for-the-badge&logo=gmail&logoColor=white&labelColor=0D1117" /></a>
</p>

<!-- Status Badges Row 1 -->
<p>
<img src="https://img.shields.io/badge/📍_Location-Almaty,_Kazakhstan-e74c3c?style=for-the-badge&labelColor=2c3e50" />
<img src="https://img.shields.io/badge/💼_Role-Middle_Data_Engineer-3498db?style=for-the-badge&labelColor=2c3e50" />
<img src="https://img.shields.io/badge/🎓_MSc-KBTU_(2025–2027)-27ae60?style=for-the-badge&labelColor=2c3e50" />
</p>

<!-- Status Badges Row 2 (concurrent roles) -->
<p>
<img src="https://img.shields.io/badge/🏦_National_Bank_of_Kazakhstan-Digital_Dev_Center-9b59b6?style=for-the-badge&labelColor=2c3e50" />
<img src="https://img.shields.io/badge/🛡️_Freedom_Insurance-Data_Engineer-f39c12?style=for-the-badge&labelColor=2c3e50" />
<img src="https://img.shields.io/badge/⚽_Football-Team_Captain-2ecc71?style=for-the-badge&labelColor=2c3e50" />
</p>

</div>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

<br/>

## 🛰️ This Repo Is Alive

> **`mrnamazbek/mrnamazbek` is not a static profile — it's a self-driving website.**
> Scheduled GitHub Actions wake up every week, pull fresh signals from public APIs
> (Google Trends, Wikimedia, DB-Engines, exchange rates, weather), regenerate
> versioned JSON datasets, run an **AI-authored "feature of the month,"** gate
> everything behind **Playwright + Lighthouse**, and redeploy — all with **zero
> manual edits**. The README you're reading and the live site share the same repo.

<div align="center">

[![🌐 Open the live site](https://img.shields.io/badge/▶_Open_the_Live_Site-mrnamazbek.github.io-00F7F7?style=for-the-badge&labelColor=0D1117)](https://mrnamazbek.github.io/mrnamazbek/)

</div>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 🧬 `$ python3 profile.py --execute`

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════╗
║  PROFESSIONAL PROFILE: Namazbek Bekzhanov                         ║
║  Role: Data Engineer & Backend Developer | SQL Optimizer         ║
║  Now: Middle Data Engineer @ The National Bank of Kazakhstan      ║
╚══════════════════════════════════════════════════════════════════╝
"""

from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class Engineer:
    """Data-driven engineer focused on scalable, self-updating systems."""

    name: str = "Namazbek Bekzhanov"
    role: str = "Data Engineer & Backend Developer"
    location: str = "Almaty, Kazakhstan 🇰🇿"

    # Several concurrent roles — finance & data at the core
    roles: Dict[str, str] = field(default_factory=lambda: {
        "🏦 Now":      "Middle Data Engineer · National Bank of KZ (Digital Dev Center)",
        "🛡️ Also":     "Data Engineer · Freedom Insurance",
        "🎓 Teaching": "Teaching Assistant · KBTU",
        "🌐 Trainee":  "Data Software Engineering · EPAM Systems",
    })

    education: Dict[str, str] = field(default_factory=lambda: {
        "🎓 MSc": "Data Science @ KBTU (2025–2027)",
        "🎓 BSc": "Computer Science @ SDU (2021–2025)",
    })

    languages: List[str] = field(default_factory=lambda: ["Python", "Go", "Java", "SQL", "Bash"])

    stack: Dict[str, List[str]] = field(default_factory=lambda: {
        "big_data":  ["Spark", "Hadoop", "Airflow", "Kafka"],
        "databases": ["PostgreSQL", "Oracle", "MS SQL Server", "MySQL", "MongoDB", "Redis"],
        "ml_ai":     ["scikit-learn", "PyTorch", "TensorFlow", "pandas", "NumPy"],
        "backend":   ["FastAPI", "REST", "Docker", "Linux", "CI/CD"],
    })

    def current_mission(self) -> List[str]:
        """What I'm shipping these days."""
        return [
            "🏦 Data modeling for secure, fast financial reporting & analytics",
            "🛡️ Hardening data governance, resiliency & cold-data management",
            "🤖 Researching ML fraud detection (Master's thesis)",
            "🛰️ Running this site's self-updating AI + data pipelines",
            "⚽ Captaining the team — on the pitch and in the repo",
        ]

    def philosophy(self) -> str:
        return "Code is poetry. Data tells stories. I automate both."


if __name__ == "__main__":
    me = Engineer()
    print(f"👋 Hi, I'm {me.name} — {me.role}, based in {me.location}")
    for goal in me.current_mission():
        print(f"   {goal}")
    print(f"💡 {me.philosophy()}")
```

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 🏗️ How This Site Builds & Updates Itself

<div align="center">

```mermaid
flowchart LR
    subgraph EXT["🌐 External Signals · free, key-light APIs"]
        G["Google Trends"]
        LLM["OpenAI-compatible LLM"]
        WM["Wikimedia Pageviews"]
        DBE["DB-Engines"]
        FXW["ExchangeRate + Open-Meteo"]
    end

    subgraph CI["⏱️ Scheduled CI · GitHub Actions"]
        M["monthly-ai-feature · day 2"]
        A["weekly-ai-audience · Mon"]
        R["update-db-ranking"]
        B["blog-ci · on push"]
    end

    subgraph PY["🐍 Python Pipelines · stdlib only"]
        P1["monthly_ai_feature_pipeline"]
        P2["update_ai_audience_weekly"]
        P3["update_db_ranking"]
        V["validate_site_data"]
    end

    subgraph DS["📦 Versioned JSON Datasets"]
        J1["ai_monthly_feature"]
        J2["ai_audience_weekly"]
        J3["db_ranking"]
    end

    subgraph GATE["✅ Quality Gates"]
        PW["Playwright e2e + visual regression"]
        LH["Lighthouse mobile"]
        VR["AI mobile-screenshot review"]
    end

    SITE["🎨 Vanilla-JS Site · Three.js · GSAP · Tailwind"]
    PAGES[("🚀 GitHub Pages")]

    G --> P1
    LLM --> P1
    WM --> P2
    DBE --> P3
    M --> P1
    A --> P2
    R --> P3
    P1 --> J1
    P2 --> J2
    P3 --> J3
    J1 --> V
    J2 --> V
    J3 --> V
    V --> SITE
    FXW -. live fetch in browser .-> SITE
    P1 --> PW --> LH --> VR
    B --> GATE
    SITE --> PAGES
```

</div>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 🤖 Self-Driving Automation

> Five Python pipelines (**standard library only — no `requests`, no SDKs**) feed the site,
> orchestrated by **4 GitHub Actions workflows** + a **GitLab CI** cloud-agent push.

| ⚙️ Workflow | ⏰ Schedule | 🔌 Source | 📤 Produces |
|---|---|---|---|
| `monthly-ai-feature` | Day 2 · 04:00 UTC | Google Trends → LLM | `ai_monthly_feature.json` + a fresh Playwright spec, Lighthouse audit & AI mobile review |
| `weekly-ai-audience` | Mondays · 04:30 UTC | Wikimedia Pageviews | `ai_audience_weekly.json` (tech-topic engagement pulse) |
| `update-db-ranking` | Scheduled | DB-Engines ranking | `db_ranking.json` (live database popularity) |
| `blog-ci` | On push | — | Lints + tests all runnable blog demos |
| `monthly_ai_feature_to_cloud_agent` *(GitLab)* | Scheduled | — | POSTs the monthly feature JSON to a cloud agent |

**In the browser, live:** USD→RUB/GBP/EUR exchange rates and Almaty/Shymkent/Astana
weather, fetched client-side and **degrading gracefully to `N/A`** on any API hiccup.

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 🎮 Interactive Engineering Toys

The site is hand-built in **vanilla JS** — no framework — yet ships a full **Developer Lab**:

<div align="center">
<table>
<tr>
<td width="50%" valign="top">

### 🧪 Developer Lab
- **🐳 Docker Compose Generator** — pick a DB, get a copy/download-ready `compose` file
- **💰 Cloud Cost Estimator** — CPU/RAM/storage × provider × region, with currency toggle
- **🔣 Regex Playground** — test patterns live
- **📡 Live Tech Radar** — adoption signals at a glance

</td>
<td width="50%" valign="top">

### ✨ Visual & Spatial
- **🔀 Data-Pipeline (DAG) Visualizer** — drag, connect & delete source→transform→sink nodes
- **🌐 3D Keyword Globe** — Three.js, up to 150 tech tags, **fully keyboard-accessible**
- **🌊 Custom WebGL shader** background (hand-written GLSL simplex noise)
- **🪐 Anti-gravity particles**, custom cursor & GSAP scroll-triggered motion

</td>
</tr>
</table>
</div>

Plus: 🌗 light/dark theme, an accessible focus-trapped résumé modal, a live **DB-Engines
ranking** table (mobile cards / desktop sticky-header), an **AI feature of the month**,
and a **weekly audience pulse** chart.

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## ⚡ Technology Arsenal

<details open>
<summary><b>🧠 Machine Learning & AI</b></summary>
<br/>
<div align="center">

![scikit-learn](https://img.shields.io/badge/Scikit--Learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?style=for-the-badge&logo=TensorFlow&logoColor=white)
![Keras](https://img.shields.io/badge/Keras-%23D00000.svg?style=for-the-badge&logo=Keras&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/Numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white)

</div>
</details>

<details open>
<summary><b>🐘 Big Data & Orchestration</b></summary>
<br/>
<div align="center">

![Apache Spark](https://img.shields.io/badge/Apache%20Spark-E25A1C?style=for-the-badge&logo=apachespark&logoColor=white)
![Hadoop](https://img.shields.io/badge/Apache%20Hadoop-66CCFF?style=for-the-badge&logo=apachehadoop&logoColor=black)
![Airflow](https://img.shields.io/badge/Apache%20Airflow-017CEE?style=for-the-badge&logo=Apache%20Airflow&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)

</div>
</details>

<details open>
<summary><b>💻 Programming Languages</b></summary>
<br/>
<div align="center">

![Python](https://img.shields.io/badge/Python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Go](https://img.shields.io/badge/Go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white)
![Java](https://img.shields.io/badge/Java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-025E8C?style=for-the-badge&logo=postgresql&logoColor=white)
![Bash](https://img.shields.io/badge/Bash-%23121011.svg?style=for-the-badge&logo=gnu-bash&logoColor=white)

</div>
</details>

<details open>
<summary><b>🗄️ Databases</b></summary>
<br/>
<div align="center">

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoft%20sql%20server&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%2347A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Snowflake](https://img.shields.io/badge/Snowflake-%2329B5E8.svg?style=for-the-badge&logo=snowflake&logoColor=white)
![Databricks](https://img.shields.io/badge/Databricks-%23FF3621.svg?style=for-the-badge&logo=databricks&logoColor=white)

</div>
</details>

<details open>
<summary><b>🛠️ DevOps, Backend & Tools</b></summary>
<br/>
<div align="center">

![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![GitLab CI](https://img.shields.io/badge/GitLab%20CI-FC6D26?style=for-the-badge&logo=gitlab&logoColor=white)

</div>
</details>

<details>
<summary><b>🌐 This Site Is Built With</b></summary>
<br/>
<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla%20JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Lighthouse](https://img.shields.io/badge/Lighthouse-F44B21?style=for-the-badge&logo=lighthouse&logoColor=white)

</div>
</details>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 🚀 Signature Projects

<div align="center">
<table>
<tr>
<td width="50%" valign="top">

### 🛡️ Fraud Detection (Master's Thesis)
<i>ML on financial transaction data</i>

**Focus:**
```
Imbalanced data → Features → Model → Eval
```

**Tech Stack:**
![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white)
![scikit-learn](https://img.shields.io/badge/-scikit--learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)
![PyTorch](https://img.shields.io/badge/-PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)

**Highlights:**
✅ Graduate research project
✅ Imbalanced-class techniques
✅ Finance-grade evaluation

[📂 **Explore Repository** →](https://github.com/mrnamazbek/fraud-detection-thesis)

</td>
<td width="50%" valign="top">

### 🤖 Gmail + Drive AI Suite
<i>AI inbox & file automation</i>

**Flow:**
```
Apps Script → Gemini → Auto-actions
```

**Tech Stack:**
![Apps Script](https://img.shields.io/badge/-Apps_Script-4285F4?style=flat-square&logo=google&logoColor=white)
![Gemini](https://img.shields.io/badge/-Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

**Highlights:**
✅ Auto-categorize & clean inbox
✅ Track job applications & deadlines
✅ Daily AI briefings

[📂 **Explore Repository** →](https://github.com/mrnamazbek/gmail-drive-ai-suite)

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🏭 EPAM Data Engineering
<i>DWH / data-lake patterns</i>

**Pipeline Flow:**
```
Sources → Kafka → Airflow → DWH
```

**Tech Stack:**
![Kafka](https://img.shields.io/badge/-Kafka-000?style=flat-square&logo=apachekafka)
![Airflow](https://img.shields.io/badge/-Airflow-017CEE?style=flat-square&logo=apacheairflow&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

**Highlights:**
✅ ETL & ELT workflows
✅ Modern DWH / lake patterns
✅ Dockerized & reproducible

[📂 **Explore Repository** →](https://github.com/mrnamazbek/EPAM-Data-Engineering)

</td>
<td width="50%" valign="top">

### 📚 KBTU ML Assignments
<i>Graduate ML portfolio</i>

**Topics Covered:**
```
Regression · KNN · Random Forest · SVM
Feature Engineering · Custom Transformers
```

**Tech Stack:**
![scikit-learn](https://img.shields.io/badge/-Scikit_Learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)
![Jupyter](https://img.shields.io/badge/-Jupyter-F37626?style=flat-square&logo=jupyter&logoColor=white)
![Pandas](https://img.shields.io/badge/-Pandas-150458?style=flat-square&logo=pandas&logoColor=white)

**Highlights:**
✅ Full code + documentation
✅ Real-world datasets
✅ Hands-on with TF & PyTorch

[📂 **Explore Repository** →](https://github.com/mrnamazbek/KBTU_ML_Assignments)

</td>
</tr>
</table>

<sub>…and more — including <a href="https://github.com/mrnamazbek/ultimate_data_engineering_projects">ultimate_data_engineering_projects</a> · <a href="https://github.com/mrnamazbek?tab=repositories">browse all repos →</a></sub>

</div>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## ✍️ Technical Blog (with runnable demos)

Three deep-dive posts — each paired with a **fully Dockerized, unit + smoke-tested demo**:

| Post | Topic | Runnable Demo |
|---|---|---|
| **A** | [Postgres query optimization](blog/post-a-postgres-query-optimization.md) | [`demos/post-a-postgres/`](blog/demos/post-a-postgres) — Docker + pytest |
| **B** | [ETL & AI feature pipelines](blog/post-b-etl-ai-feature-pipelines.md) | [`demos/post-b-feature-pipeline/`](blog/demos/post-b-feature-pipeline) — Docker + pytest |
| **C** | [Python performance for data pipelines](blog/post-c-python-performance-data-pipelines.md) | [`demos/post-c-python-perf/`](blog/demos/post-c-python-perf) — Docker + pytest |

A monthly **[Trends TL;DR](blog/trends-tldr-2026-02.md)** distills fresh data-engineering sources, and the
[maintainer playbook](blog/CONTENT_MAINTAINERS_README.md) documents the AI-assisted regeneration workflow.

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 🧪 Quality & Testing

> Shipping a personal site like production: every change is gated.

- **🎭 Playwright** — 5 specs: responsive smoke (320→1440px), **visual regression**, live-signals resilience, monthly-feature render, audience-pulse render
- **🚦 Lighthouse** — automated mobile performance/accessibility audits
- **🐍 pytest** — unit + smoke tests for all 3 blog demos (Docker integration)
- **🔍 `validate_site_data.py`** — schema/sanity checks across the JSON datasets
- **🤳 AI mobile review** — captures a mobile screenshot and asks an LLM to score the UI
- **📋 [QA checklist](qa-checklist.md)** — manual sign-off for modals, overflow, contrast & focus

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## ⚙️ Run It Locally

```bash
# 1 · Clone
git clone https://github.com/mrnamazbek/mrnamazbek.git
cd mrnamazbek

# 2 · Serve the static site — there is NO build step
python -m http.server 4173
#     → open http://127.0.0.1:4173

# 3 · Install test tooling
npm install
npx playwright install --with-deps chromium

# 4 · Run the end-to-end suite
npm run test:e2e        # core specs
npm run test:e2e:all    # everything, incl. visual regression

# 5 · Regenerate the monthly AI feature — offline, no API key needed
npm run feature:monthly:offline

# 6 · Validate the datasets
python scripts/validate_site_data.py
```

<details>
<summary><b>📁 Repository structure</b></summary>

```
mrnamazbek/
├── index.html                 # Single-page site (sections, modals, canvases)
├── assets/
│   ├── logic.js               # Shaders, globe glue, scroll FX, core UI
│   ├── developer-lab.js       # Docker gen · cost estimator · regex · tech radar
│   ├── keywords-globe.js      # Accessible 3D keyword globe (Three.js)
│   ├── ai-monthly-feature.js  # Monthly feature + live FX/weather widget
│   ├── audience-pulse.js      # Weekly audience engagement viz
│   ├── *.json                 # Versioned datasets (auto-updated by CI)
│   └── styles.css · logos/
├── scripts/                   # 5 stdlib-only Python pipelines
├── tests/                     # 5 Playwright specs (e2e + visual regression)
├── blog/                      # 3 posts + Dockerized, tested demos
├── docs/                      # Automation runbooks
├── .github/workflows/         # 4 scheduled GitHub Actions
└── .gitlab-ci.yml             # Cloud-agent push
```

</details>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 🏆 Achievement Showcase

<div align="center">

<img src="https://github-profile-trophy.vercel.app/?username=mrnamazbek&theme=algolia&no-frame=true&no-bg=true&margin-w=4&row=1&column=8" width="100%" />

</div>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 📊 GitHub Analytics

<div align="center">

<img height="180em" src="https://github-readme-stats.vercel.app/api?username=mrnamazbek&show_icons=true&theme=tokyonight&hide_border=true&include_all_commits=true&count_private=true&bg_color=0D1117&title_color=00F7F7&icon_color=00F7F7" />
<img height="180em" src="https://github-readme-stats.vercel.app/api/top-langs/?username=mrnamazbek&layout=compact&theme=tokyonight&hide_border=true&langs_count=8&bg_color=0D1117&title_color=00F7F7" />

<br/>

<img src="https://github-readme-streak-stats.herokuapp.com/?user=mrnamazbek&theme=tokyonight&hide_border=true&background=0D1117&ring=00F7F7&fire=00F7F7&currStreakLabel=00F7F7" />

<br/>

<img src="https://github-readme-activity-graph.vercel.app/graph?username=mrnamazbek&theme=react-dark&hide_border=true&area=true&bg_color=0D1117&color=00F7F7&line=00F7F7&point=FFFFFF" width="95%"/>

</div>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 🤝 Connect With Me

<div align="center">

[![Live Site](https://img.shields.io/badge/🌐_Portfolio-mrnamazbek.github.io-00F7F7?style=for-the-badge&labelColor=0D1117)](https://mrnamazbek.github.io/mrnamazbek/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/namazbek-bekzhanov/)
[![Email](https://img.shields.io/badge/Gmail-Contact_Me-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:namazbekzhan@gmail.com)
[![Instagram](https://img.shields.io/badge/Instagram-Follow-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/namazbekzhan)

<br/>

### 💭 Quote of the Moment
<img src="https://quotes-github-readme.vercel.app/api?type=horizontal&theme=tokyonight" />

<br/>

<img src="https://komarev.com/ghpvc/?username=mrnamazbek&label=Profile%20Views&color=00F7F7&style=flat" alt="Profile views" />

</div>

<sub align="center">Engineer of my own destiny. Built different. Automating greatness. ⚡</sub>

<br/><br/>

<!-- Wave Footer -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,3,5,6&height=120&section=footer" />
