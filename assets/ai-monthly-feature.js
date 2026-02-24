(function () {
    'use strict';

    const ROOT_ID = 'ai-monthly-feature-root';
    const LIVE_SIGNALS_ROOT_ID = 'ai-live-signals-root';
    const FEATURE_URL = 'assets/ai_monthly_feature.json';
    const FX_URL = 'https://open.er-api.com/v6/latest/USD';
    const API_TIMEOUT_MS = 9000;
    const WEATHER_CITIES = [
        { id: 'almaty', label: 'Almaty', latitude: 43.238949, longitude: 76.889709 },
        { id: 'shymkent', label: 'Shymkent', latitude: 42.3417, longitude: 69.5901 },
        { id: 'astana', label: 'Astana', latitude: 51.1694, longitude: 71.4491 }
    ];

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

    function formatRate(value) {
        const n = asNumber(value, NaN);
        return Number.isFinite(n) ? n.toFixed(4) : 'N/A';
    }

    function extractFxUpdateTimestamp(fxData) {
        if (!fxData || typeof fxData !== 'object') return new Date().toISOString().slice(0, 10);
        if (fxData.time_last_update_utc) return String(fxData.time_last_update_utc);
        if (fxData.time_last_update_unix) {
            const unix = asNumber(fxData.time_last_update_unix, 0);
            return new Date(unix * 1000).toISOString().slice(0, 10);
        }
        return new Date().toISOString().slice(0, 10);
    }

    function describeWeatherCode(code) {
        const map = {
            0: 'Clear',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Snow',
            75: 'Heavy snow',
            80: 'Rain showers',
            81: 'Showers',
            82: 'Violent showers',
            95: 'Thunderstorm'
        };
        return map[asNumber(code, -1)] || 'Unknown';
    }

    async function fetchJsonWithTimeout(url, timeoutMs) {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
        try {
            const response = await fetch(url, controller ? { signal: controller.signal, cache: 'no-cache' } : { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Request failed with ${response.status}`);
            return await response.json();
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    async function loadLiveSignals() {
        const fallbackRates = { RUB: null, GBP: null, EUR: null };
        const fallbackWeather = WEATHER_CITIES.map((city) => ({
            city: city.label,
            temperature: null,
            feelsLike: null,
            wind: null,
            weatherCode: null
        }));

        try {
            const fxPromise = fetchJsonWithTimeout(FX_URL, API_TIMEOUT_MS);
            const weatherPromises = WEATHER_CITIES.map((city) => {
                const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(city.latitude)}&longitude=${encodeURIComponent(city.longitude)}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
                return fetchJsonWithTimeout(weatherUrl, API_TIMEOUT_MS)
                    .then((payload) => ({
                        city: city.label,
                        temperature: payload && payload.current ? asNumber(payload.current.temperature_2m, NaN) : NaN,
                        feelsLike: payload && payload.current ? asNumber(payload.current.apparent_temperature, NaN) : NaN,
                        wind: payload && payload.current ? asNumber(payload.current.wind_speed_10m, NaN) : NaN,
                        weatherCode: payload && payload.current ? asNumber(payload.current.weather_code, NaN) : NaN
                    }))
                    .catch(() => ({
                        city: city.label,
                        temperature: NaN,
                        feelsLike: NaN,
                        wind: NaN,
                        weatherCode: NaN
                    }));
            });

            const [fxData, weatherRows] = await Promise.all([fxPromise, Promise.all(weatherPromises)]);
            const rates = fxData && fxData.rates ? fxData.rates : fallbackRates;
            return {
                updatedAt: extractFxUpdateTimestamp(fxData),
                rates: {
                    RUB: asNumber(rates.RUB, NaN),
                    GBP: asNumber(rates.GBP, NaN),
                    EUR: asNumber(rates.EUR, NaN)
                },
                weather: weatherRows
            };
        } catch (error) {
            console.warn('Falling back to unavailable live signals.', error);
            return {
                updatedAt: new Date().toISOString().slice(0, 10),
                rates: fallbackRates,
                weather: fallbackWeather
            };
        }
    }

    function renderLiveSignals(root, payload) {
        const rates = payload && payload.rates ? payload.rates : {};
        const weatherRows = payload && Array.isArray(payload.weather) ? payload.weather : [];
        const weatherHtml = weatherRows.map((row) => {
            const temp = Number.isFinite(row.temperature) ? `${row.temperature.toFixed(1)}°C` : 'N/A';
            const feels = Number.isFinite(row.feelsLike) ? `${row.feelsLike.toFixed(1)}°C` : 'N/A';
            const wind = Number.isFinite(row.wind) ? `${row.wind.toFixed(1)} km/h` : 'N/A';
            return `
                <div class="ai-live-signals__weather-card">
                    <div class="ai-live-signals__weather-city">${escapeHtml(row.city)}</div>
                    <div class="ai-live-signals__weather-main">${escapeHtml(temp)} · ${escapeHtml(describeWeatherCode(row.weatherCode))}</div>
                    <div class="ai-live-signals__weather-meta">Feels like: ${escapeHtml(feels)} · Wind: ${escapeHtml(wind)}</div>
                </div>
            `;
        }).join('');

        root.innerHTML = `
            <div class="ai-live-signals">
                <div class="ai-live-signals__head">
                    <h4 class="ai-widget__title">Live Signals: FX + Weather</h4>
                    <p class="ai-widget__desc">USD exchange rates for RUB, GBP, EUR and real-time weather for Almaty, Shymkent, Astana.</p>
                </div>
                <div class="ai-live-signals__rates">
                    <div class="ai-live-signals__rate"><span>USD → RUB</span><strong>${escapeHtml(formatRate(rates.RUB))}</strong></div>
                    <div class="ai-live-signals__rate"><span>USD → GBP</span><strong>${escapeHtml(formatRate(rates.GBP))}</strong></div>
                    <div class="ai-live-signals__rate"><span>USD → EUR</span><strong>${escapeHtml(formatRate(rates.EUR))}</strong></div>
                </div>
                <div class="ai-live-signals__weather">${weatherHtml}</div>
                <div class="ai-feature__note">Updated: ${escapeHtml(String(payload.updatedAt || 'N/A'))}</div>
            </div>
        `;
    }

    async function initLiveSignals() {
        const root = document.getElementById(LIVE_SIGNALS_ROOT_ID);
        if (!root) return;
        const payload = await loadLiveSignals();
        renderLiveSignals(root, payload);
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

    document.addEventListener('DOMContentLoaded', () => {
        initAIMonthlyFeature();
        initLiveSignals();
    });
})();
