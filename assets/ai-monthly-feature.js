(function () {
    'use strict';

    const ROOT_ID = 'ai-monthly-feature-root';
    const FEATURE_URL = 'assets/ai_monthly_feature.json';

    const FALLBACK_FEATURE = {
        id: 'fallback-agentic-workflow-checklist',
        month: '2026-02',
        title: 'Agentic Workflow Readiness Sprint',
        trend_keyword: 'agentic workflows',
        description: 'Plan a one-week rollout for an AI-assisted feature delivery loop.',
        why_now: 'Agentic systems remain one of the strongest software delivery trends in 2026.',
        mobile_review_notes: 'Designed for one-hand interaction: tap targets >= 44px and no horizontal overflow.',
        source: {
            type: 'google_trends',
            geo: 'US'
        },
        widget: {
            type: 'roadmap_planner',
            heading: '7-Day AI Delivery Plan',
            description: 'Track completion and estimate remaining effort.',
            config: {
                steps: [
                    { name: 'Trend scan', detail: 'Pick one trend keyword and target audience.', weeks: 0.2 },
                    { name: 'Feature brief', detail: 'Write acceptance criteria and mobile constraints.', weeks: 0.2 },
                    { name: 'Build + tests', detail: 'Implement with Playwright checks.', weeks: 0.3 },
                    { name: 'Visual QA', detail: 'Review mobile screenshot and fix spacing.', weeks: 0.2 },
                    { name: 'Ship', detail: 'Commit and push via workflow.', weeks: 0.1 }
                ]
            }
        }
    };

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function asNumber(value, fallback) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function formatMonth(value) {
        const m = String(value || '').trim();
        if (!/^\d{4}-\d{2}$/.test(m)) return m || 'Latest';
        const parts = m.split('-');
        const year = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const d = new Date(Date.UTC(year, month, 1));
        try {
            return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(d);
        } catch (e) {
            return m;
        }
    }

    function normalizeFeature(raw) {
        if (!raw || typeof raw !== 'object') return FALLBACK_FEATURE;

        const feature = {
            id: String(raw.id || FALLBACK_FEATURE.id),
            month: String(raw.month || FALLBACK_FEATURE.month),
            title: String(raw.title || FALLBACK_FEATURE.title),
            trend_keyword: String(raw.trend_keyword || FALLBACK_FEATURE.trend_keyword),
            description: String(raw.description || FALLBACK_FEATURE.description),
            why_now: String(raw.why_now || FALLBACK_FEATURE.why_now),
            mobile_review_notes: String(raw.mobile_review_notes || FALLBACK_FEATURE.mobile_review_notes),
            source: raw.source && typeof raw.source === 'object' ? raw.source : FALLBACK_FEATURE.source,
            widget: raw.widget && typeof raw.widget === 'object' ? raw.widget : FALLBACK_FEATURE.widget
        };

        if (!feature.widget.type || !feature.widget.config) {
            feature.widget = FALLBACK_FEATURE.widget;
        }

        return feature;
    }

    function renderImpactEstimator(widget) {
        const cfg = widget.config || {};
        const min = asNumber(cfg.min, 0);
        const max = asNumber(cfg.max, 100);
        const step = asNumber(cfg.step, 5);
        const initialValue = clamp(asNumber(cfg.default, 40), min, max);
        const baselineHours = Math.max(1, asNumber(cfg.baseline_hours, 40));
        const efficiency = clamp(asNumber(cfg.efficiency_factor, 0.55), 0.05, 1);

        return `
            <div class="ai-widget ai-widget--impact" data-widget="impact-estimator">
                <div class="ai-widget__head">
                    <h4 class="ai-widget__title">${escapeHtml(widget.heading || 'Impact Estimator')}</h4>
                    <p class="ai-widget__desc">${escapeHtml(widget.description || 'Estimate how much team capacity automation can unlock each month.')}</p>
                </div>
                <label class="ai-widget__label" for="ai-impact-slider">${escapeHtml(cfg.input_label || 'Automation coverage')}</label>
                <input id="ai-impact-slider" class="ai-widget__range" type="range" min="${min}" max="${max}" step="${step}" value="${initialValue}" />
                <div class="ai-widget__range-row">
                    <span>${min}%</span>
                    <span class="ai-widget__range-value" id="ai-impact-value">${initialValue}%</span>
                    <span>${max}%</span>
                </div>
                <div class="ai-widget__stats" id="ai-impact-stats"></div>
            </div>
        `;
    }

    function attachImpactEstimator(root, widget) {
        const cfg = widget.config || {};
        const slider = root.querySelector('#ai-impact-slider');
        const valueEl = root.querySelector('#ai-impact-value');
        const statsEl = root.querySelector('#ai-impact-stats');
        if (!slider || !valueEl || !statsEl) return;

        const baselineHours = Math.max(1, asNumber(cfg.baseline_hours, 40));
        const efficiency = clamp(asNumber(cfg.efficiency_factor, 0.55), 0.05, 1);

        function render() {
            const coverage = clamp(asNumber(slider.value, 0), asNumber(slider.min, 0), asNumber(slider.max, 100));
            const savedHours = baselineHours * (coverage / 100) * efficiency;
            const savedDays = savedHours / 8;
            valueEl.textContent = `${Math.round(coverage)}%`;
            statsEl.innerHTML = `
                <div class="ai-widget__stat">
                    <div class="ai-widget__stat-label">Saved Hours / Month</div>
                    <div class="ai-widget__stat-value">${savedHours.toFixed(1)}</div>
                </div>
                <div class="ai-widget__stat">
                    <div class="ai-widget__stat-label">Equivalent Workdays</div>
                    <div class="ai-widget__stat-value">${savedDays.toFixed(1)}</div>
                </div>
            `;
        }

        slider.addEventListener('input', render);
        render();
    }

    function renderTradeoffMatrix(widget) {
        const cfg = widget.config || {};
        const options = Array.isArray(cfg.options) ? cfg.options : [];

        const optionsHtml = options.map((option, idx) => {
            return `
                <button type="button" class="ai-widget__option" data-tradeoff-index="${idx}">
                    <span class="ai-widget__option-label">${escapeHtml(option.label || `Option ${idx + 1}`)}</span>
                    <span class="ai-widget__option-hint">${escapeHtml(option.hint || '')}</span>
                </button>
            `;
        }).join('');

        return `
            <div class="ai-widget ai-widget--tradeoff" data-widget="tradeoff-matrix">
                <div class="ai-widget__head">
                    <h4 class="ai-widget__title">${escapeHtml(widget.heading || 'Trade-off Matrix')}</h4>
                    <p class="ai-widget__desc">${escapeHtml(widget.description || '')}</p>
                </div>
                <div class="ai-widget__question">${escapeHtml(cfg.question || 'Choose your priority for this month')}</div>
                <div class="ai-widget__options">${optionsHtml}</div>
                <div class="ai-widget__result" id="ai-tradeoff-result" role="status" aria-live="polite"></div>
            </div>
        `;
    }

    function getBestOutcome(option, outcomes) {
        const scores = option && option.scores && typeof option.scores === 'object' ? option.scores : {};
        let best = null;
        Object.keys(scores).forEach((outcomeId) => {
            const score = asNumber(scores[outcomeId], 0);
            if (!best || score > best.score) {
                best = { id: outcomeId, score };
            }
        });

        if (!best) return outcomes[0] || null;
        return outcomes.find((item) => item.id === best.id) || outcomes[0] || null;
    }

    function attachTradeoffMatrix(root, widget) {
        const cfg = widget.config || {};
        const options = Array.isArray(cfg.options) ? cfg.options : [];
        const outcomes = Array.isArray(cfg.outcomes) ? cfg.outcomes : [];
        const buttons = Array.from(root.querySelectorAll('[data-tradeoff-index]'));
        const result = root.querySelector('#ai-tradeoff-result');
        if (!buttons.length || !result) return;

        function renderResult(index) {
            const option = options[index] || {};
            const outcome = getBestOutcome(option, outcomes);
            const title = outcome ? outcome.title : 'Recommendation unavailable';
            const description = outcome ? outcome.description : 'Try another option.';

            result.innerHTML = `
                <div class="ai-widget__result-title">${escapeHtml(title)}</div>
                <div class="ai-widget__result-body">${escapeHtml(description)}</div>
            `;

            buttons.forEach((button, buttonIndex) => {
                button.classList.toggle('is-active', buttonIndex === index);
            });
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const idx = asNumber(button.getAttribute('data-tradeoff-index'), 0);
                renderResult(idx);
            });
        });

        renderResult(0);
    }

    function renderRoadmapPlanner(widget) {
        const cfg = widget.config || {};
        const steps = Array.isArray(cfg.steps) ? cfg.steps : [];
        const stepsHtml = steps.map((step, idx) => {
            return `
                <label class="ai-widget__step" for="ai-step-${idx}">
                    <input id="ai-step-${idx}" type="checkbox" data-roadmap-step="${idx}" />
                    <span class="ai-widget__step-copy">
                        <span class="ai-widget__step-name">${escapeHtml(step.name || `Step ${idx + 1}`)}</span>
                        <span class="ai-widget__step-detail">${escapeHtml(step.detail || '')}</span>
                    </span>
                    <span class="ai-widget__step-weeks">${asNumber(step.weeks, 0.1).toFixed(1)}w</span>
                </label>
            `;
        }).join('');

        return `
            <div class="ai-widget ai-widget--roadmap" data-widget="roadmap-planner">
                <div class="ai-widget__head">
                    <h4 class="ai-widget__title">${escapeHtml(widget.heading || 'Roadmap Planner')}</h4>
                    <p class="ai-widget__desc">${escapeHtml(widget.description || '')}</p>
                </div>
                <div class="ai-widget__progress-wrap">
                    <div class="ai-widget__progress-bar"><span id="ai-roadmap-progress" style="width:0%"></span></div>
                    <div class="ai-widget__progress-meta" id="ai-roadmap-meta">0% complete</div>
                </div>
                <div class="ai-widget__steps">${stepsHtml}</div>
            </div>
        `;
    }

    function attachRoadmapPlanner(root) {
        const checks = Array.from(root.querySelectorAll('[data-roadmap-step]'));
        const progressEl = root.querySelector('#ai-roadmap-progress');
        const metaEl = root.querySelector('#ai-roadmap-meta');
        if (!checks.length || !progressEl || !metaEl) return;

        function render() {
            const total = checks.length;
            const done = checks.filter((c) => c.checked).length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            progressEl.style.width = `${pct}%`;
            metaEl.textContent = `${pct}% complete (${done}/${total})`;
        }

        checks.forEach((check) => check.addEventListener('change', render));
        render();
    }

    function renderWidget(feature) {
        const widget = feature.widget || {};
        const type = widget.type;

        if (type === 'impact_estimator') return renderImpactEstimator(widget);
        if (type === 'tradeoff_matrix') return renderTradeoffMatrix(widget);
        return renderRoadmapPlanner(widget);
    }

    function attachWidgetHandlers(root, feature) {
        const widget = feature.widget || {};
        const type = widget.type;

        if (type === 'impact_estimator') {
            attachImpactEstimator(root, widget);
            return;
        }

        if (type === 'tradeoff_matrix') {
            attachTradeoffMatrix(root, widget);
            return;
        }

        attachRoadmapPlanner(root, widget);
    }

    function renderFeature(root, feature) {
        root.innerHTML = `
            <div class="ai-feature" data-ai-feature-id="${escapeHtml(feature.id)}" data-widget-type="${escapeHtml(feature.widget.type || 'roadmap_planner')}">
                <div class="ai-feature__meta">
                    <span class="ai-feature__pill">${escapeHtml(formatMonth(feature.month))}</span>
                    <span class="ai-feature__pill ai-feature__pill--ghost">Trend: ${escapeHtml(feature.trend_keyword)}</span>
                </div>
                <h4 class="ai-feature__title">${escapeHtml(feature.title)}</h4>
                <p class="ai-feature__desc">${escapeHtml(feature.description)}</p>
                <p class="ai-feature__why">${escapeHtml(feature.why_now)}</p>
                <div class="ai-feature__widget">${renderWidget(feature)}</div>
                <div class="ai-feature__note">Mobile QA: ${escapeHtml(feature.mobile_review_notes || 'Validated in automated checks.')}</div>
            </div>
        `;

        attachWidgetHandlers(root, feature);
    }

    async function loadFeature() {
        try {
            const response = await fetch(FEATURE_URL, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Feature JSON request failed with ${response.status}`);
            const data = await response.json();
            return normalizeFeature(data);
        } catch (error) {
            console.warn('Falling back to local AI feature payload.', error);
            return FALLBACK_FEATURE;
        }
    }

    async function initAIMonthlyFeature() {
        const root = document.getElementById(ROOT_ID);
        if (!root) return;

        const feature = await loadFeature();
        renderFeature(root, feature);
    }

    document.addEventListener('DOMContentLoaded', initAIMonthlyFeature);
})();
