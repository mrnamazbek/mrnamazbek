(function () {
    'use strict';

    var AUDIENCE_URL = 'assets/ai_audience_weekly.json';
    var AUDIENCE_ROOT_ID = 'ai-audience-root';
    var ENGAGEMENT_ROOT_ID = 'site-engagement-root';

    var COUNTER_BASE = 'https://api.counterapi.dev/v1';
    var COUNTER_NAMESPACE = 'mrnamazbek-site';
    var COUNTER_VIEWS_KEY = 'portfolio_views';
    var COUNTER_LIKES_KEY = 'portfolio_likes';

    var STORAGE_VIEWS = 'engagement.views.last';
    var STORAGE_LIKES = 'engagement.likes.last';
    var STORAGE_VIEW_DAY = 'engagement.view.day';

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function toNumber(value, fallback) {
        var n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function compactNumber(value) {
        try {
            return new Intl.NumberFormat(undefined, {
                notation: 'compact',
                maximumFractionDigits: 1
            }).format(value);
        } catch (e) {
            return String(Math.round(value));
        }
    }

    function formatWeekLabel(isoDate) {
        var d = new Date(String(isoDate || ''));
        if (Number.isNaN(d.getTime())) return String(isoDate || '');
        try {
            return new Intl.DateTimeFormat(undefined, { month: 'short', day: '2-digit' }).format(d);
        } catch (e) {
            return isoDate;
        }
    }

    async function fetchJson(url, timeoutMs) {
        var timeout = typeof timeoutMs === 'number' ? timeoutMs : 9000;
        var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timer = null;
        if (controller) {
            timer = window.setTimeout(function () {
                controller.abort();
            }, timeout);
        }

        try {
            var response = await fetch(url, {
                cache: 'no-cache',
                signal: controller ? controller.signal : undefined
            });
            if (!response.ok) {
                throw new Error('Request failed: ' + response.status);
            }
            return await response.json();
        } finally {
            if (timer) {
                window.clearTimeout(timer);
            }
        }
    }

    function normalizeSeries(rawSeries) {
        var series = Array.isArray(rawSeries) ? rawSeries : [];
        return series
            .map(function (item, idx) {
                var points = Array.isArray(item && item.points) ? item.points : [];
                var cleanPoints = points
                    .map(function (p) {
                        return {
                            week: String((p && p.week) || ''),
                            views: toNumber(p && p.views, 0)
                        };
                    })
                    .filter(function (p) { return p.week; });

                return {
                    id: String((item && item.id) || ('series-' + (idx + 1))),
                    label: String((item && item.label) || ('Series ' + (idx + 1))),
                    color: String((item && item.color) || '#22d3ee'),
                    article: String((item && item.article) || ''),
                    points: cleanPoints
                };
            })
            .filter(function (s) { return s.points.length > 0; });
    }

    function buildAudienceFallback() {
        var baseWeeks = [
            '2025-12-01', '2025-12-08', '2025-12-15', '2025-12-22',
            '2025-12-29', '2026-01-05', '2026-01-12', '2026-01-19',
            '2026-01-26', '2026-02-02', '2026-02-09', '2026-02-16'
        ];

        function points(values) {
            return baseWeeks.map(function (w, i) {
                return { week: w, views: values[i] || 0 };
            });
        }

        return {
            as_of: '2026-02-16',
            methodology: 'Fallback demo data. Weekly audience proxy is based on Wikipedia pageviews.',
            source_url: 'https://wikimedia.org/api/rest_v1/',
            series: [
                { id: 'chatgpt', label: 'ChatGPT', color: '#22d3ee', article: 'ChatGPT', points: points([210000, 220000, 225000, 230000, 245000, 255000, 268000, 270000, 282000, 291000, 298000, 305000]) },
                { id: 'claude', label: 'Claude', color: '#60a5fa', article: 'Claude_(language_model)', points: points([88000, 92000, 96000, 101000, 107000, 111000, 120000, 127000, 131000, 136000, 145000, 149000]) },
                { id: 'copilot', label: 'Copilot', color: '#a78bfa', article: 'Microsoft_Copilot', points: points([76000, 79000, 81000, 85000, 91000, 95000, 99000, 103000, 109000, 113000, 118000, 124000]) }
            ]
        };
    }

    function latestValue(points) {
        if (!points.length) return 0;
        return toNumber(points[points.length - 1].views, 0);
    }

    function wowChange(points) {
        if (points.length < 2) return 0;
        var latest = toNumber(points[points.length - 1].views, 0);
        var prev = toNumber(points[points.length - 2].views, 0);
        if (!prev) return 0;
        return ((latest - prev) / prev) * 100;
    }

    function average(points) {
        if (!points.length) return 0;
        var total = points.reduce(function (acc, p) {
            return acc + toNumber(p.views, 0);
        }, 0);
        return total / points.length;
    }

    function renderAudiencePulse(root, data) {
        var series = normalizeSeries(data && data.series);
        if (!series.length) {
            root.innerHTML = '<div class="text-sm font-mono text-gray-400">Audience data is not available right now.</div>';
            return;
        }

        series.sort(function (a, b) {
            return latestValue(b.points) - latestValue(a.points);
        });

        var selectedId = series[0].id;

        root.innerHTML = [
            '<div class="audience-pulse">',
            '  <div class="audience-pulse__head">',
            '    <div>',
            '      <div class="audience-pulse__eyebrow">Weekly Audience Proxy</div>',
            '      <h4 class="audience-pulse__title">AI Platform Momentum</h4>',
            '    </div>',
            '    <div class="audience-pulse__meta">As of ' + escapeHtml(String((data && data.as_of) || 'latest')) + '</div>',
            '  </div>',
            '  <div class="audience-pulse__chips" id="audience-pulse-chips"></div>',
            '  <div class="audience-pulse__stats">',
            '    <div class="audience-pulse__stat"><div class="audience-pulse__stat-label">Latest Week</div><div class="audience-pulse__stat-value" id="audience-latest">-</div></div>',
            '    <div class="audience-pulse__stat"><div class="audience-pulse__stat-label">WoW</div><div class="audience-pulse__stat-value" id="audience-wow">-</div></div>',
            '    <div class="audience-pulse__stat"><div class="audience-pulse__stat-label">12-Week Avg</div><div class="audience-pulse__stat-value" id="audience-avg">-</div></div>',
            '  </div>',
            '  <div class="audience-pulse__chart" id="audience-bars"></div>',
            '  <div class="audience-pulse__foot">' + escapeHtml(String((data && data.methodology) || 'Proxy metric based on Wikipedia pageviews. Not unique active users.')) + '</div>',
            '</div>'
        ].join('');

        var chipsRoot = root.querySelector('#audience-pulse-chips');
        var barsRoot = root.querySelector('#audience-bars');
        var latestEl = root.querySelector('#audience-latest');
        var wowEl = root.querySelector('#audience-wow');
        var avgEl = root.querySelector('#audience-avg');

        function renderChips() {
            chipsRoot.innerHTML = series.map(function (s) {
                var active = s.id === selectedId;
                return '<button type="button" class="audience-chip ' + (active ? 'is-active' : '') + '" data-series-id="' + escapeHtml(s.id) + '">' + escapeHtml(s.label) + '</button>';
            }).join('');
        }

        function renderSelected() {
            var selected = series.find(function (s) { return s.id === selectedId; }) || series[0];
            if (!selected) return;

            var points = selected.points.slice(-12);
            var max = points.reduce(function (m, p) { return Math.max(m, toNumber(p.views, 0)); }, 1);

            barsRoot.innerHTML = points.map(function (p) {
                var views = toNumber(p.views, 0);
                var h = Math.max(6, Math.round((views / max) * 100));
                return [
                    '<div class="audience-bar-wrap">',
                    '  <div class="audience-bar" style="--audience-bar-height:' + h + '%; --audience-bar-color:' + escapeHtml(selected.color) + '" title="' + escapeHtml(formatWeekLabel(p.week) + ': ' + compactNumber(views)) + '"></div>',
                    '  <div class="audience-bar-label">' + escapeHtml(formatWeekLabel(p.week)) + '</div>',
                    '</div>'
                ].join('');
            }).join('');

            var latest = latestValue(points);
            var wow = wowChange(points);
            var avg = average(points);
            latestEl.textContent = compactNumber(latest);
            wowEl.textContent = (wow >= 0 ? '+' : '') + wow.toFixed(1) + '%';
            wowEl.classList.toggle('is-up', wow >= 0);
            wowEl.classList.toggle('is-down', wow < 0);
            avgEl.textContent = compactNumber(avg);
        }

        chipsRoot.addEventListener('click', function (event) {
            var button = event.target.closest('[data-series-id]');
            if (!button) return;
            selectedId = String(button.getAttribute('data-series-id') || selectedId);
            renderChips();
            renderSelected();
        });

        renderChips();
        renderSelected();
    }

    function parseCounterCount(payload) {
        if (!payload || typeof payload !== 'object') return null;
        var data = payload.data && typeof payload.data === 'object' ? payload.data : {};
        var candidates = [data.up_count, data.count, payload.count, payload.up_count];
        for (var i = 0; i < candidates.length; i++) {
            var n = Number(candidates[i]);
            if (Number.isFinite(n)) return n;
        }
        return null;
    }

    async function counterRequest(path) {
        var url = COUNTER_BASE + '/' + COUNTER_NAMESPACE + '/' + path;
        return fetchJson(url, 8000);
    }

    function getIsoDay() {
        return new Date().toISOString().slice(0, 10);
    }

    function readLocalNumber(key, fallback) {
        var raw = localStorage.getItem(key);
        var n = Number(raw);
        return Number.isFinite(n) ? n : fallback;
    }

    function renderEngagementShell(root) {
        root.innerHTML = [
            '<div class="engagement-card">',
            '  <div class="engagement-card__head">',
            '    <div class="audience-pulse__eyebrow">Live Counters</div>',
            '    <h4 class="audience-pulse__title">Site Engagement</h4>',
            '  </div>',
            '  <div class="engagement-card__grid">',
            '    <div class="engagement-metric">',
            '      <div class="engagement-metric__label">Visitors</div>',
            '      <div class="engagement-metric__value" id="engagement-views">-</div>',
            '    </div>',
            '    <div class="engagement-metric">',
            '      <div class="engagement-metric__label">Likes</div>',
            '      <div class="engagement-metric__value" id="engagement-likes">-</div>',
            '    </div>',
            '  </div>',
            '  <button type="button" id="engagement-like-btn" class="engagement-like-btn">',
            '    <span class="engagement-like-btn__icon" aria-hidden="true">+</span>',
            '    <span>Like this page</span>',
            '  </button>',
            '  <div class="engagement-card__status" id="engagement-status">CounterAPI sync active.</div>',
            '</div>'
        ].join('');
    }

    async function initEngagement(root) {
        renderEngagementShell(root);

        var viewsEl = root.querySelector('#engagement-views');
        var likesEl = root.querySelector('#engagement-likes');
        var likeBtn = root.querySelector('#engagement-like-btn');
        var statusEl = root.querySelector('#engagement-status');

        var localViews = readLocalNumber(STORAGE_VIEWS, 0);
        var localLikes = readLocalNumber(STORAGE_LIKES, 0);
        viewsEl.textContent = compactNumber(localViews);
        likesEl.textContent = compactNumber(localLikes);

        var today = getIsoDay();
        var shouldIncrementView = sessionStorage.getItem(STORAGE_VIEW_DAY) !== today;

        try {
            var viewsPayload;
            if (shouldIncrementView) {
                viewsPayload = await counterRequest(COUNTER_VIEWS_KEY + '/up');
                sessionStorage.setItem(STORAGE_VIEW_DAY, today);
            } else {
                viewsPayload = await counterRequest(COUNTER_VIEWS_KEY + '/');
            }
            var liveViews = parseCounterCount(viewsPayload);
            if (Number.isFinite(liveViews)) {
                viewsEl.textContent = compactNumber(liveViews);
                localStorage.setItem(STORAGE_VIEWS, String(Math.round(liveViews)));
            }
        } catch (error) {
            if (shouldIncrementView) {
                localViews += 1;
                localStorage.setItem(STORAGE_VIEWS, String(localViews));
                sessionStorage.setItem(STORAGE_VIEW_DAY, today);
                viewsEl.textContent = compactNumber(localViews);
            }
            statusEl.textContent = 'Live counter unavailable. Showing local fallback values.';
        }

        try {
            var likesPayload = await counterRequest(COUNTER_LIKES_KEY + '/');
            var liveLikes = parseCounterCount(likesPayload);
            if (Number.isFinite(liveLikes)) {
                likesEl.textContent = compactNumber(liveLikes);
                localStorage.setItem(STORAGE_LIKES, String(Math.round(liveLikes)));
            }
        } catch (error2) {
            statusEl.textContent = 'Live counter unavailable. Showing local fallback values.';
        }

        likeBtn.addEventListener('click', async function () {
            likeBtn.disabled = true;
            likeBtn.classList.add('is-burst');
            window.setTimeout(function () {
                likeBtn.classList.remove('is-burst');
            }, 380);

            var current = readLocalNumber(STORAGE_LIKES, 0);
            var nextLocal = current + 1;
            likesEl.textContent = compactNumber(nextLocal);
            localStorage.setItem(STORAGE_LIKES, String(nextLocal));

            try {
                var upPayload = await counterRequest(COUNTER_LIKES_KEY + '/up');
                var liveLikes = parseCounterCount(upPayload);
                if (Number.isFinite(liveLikes)) {
                    likesEl.textContent = compactNumber(liveLikes);
                    localStorage.setItem(STORAGE_LIKES, String(Math.round(liveLikes)));
                }
            } catch (error3) {
                statusEl.textContent = 'Like saved locally. CounterAPI sync failed for this click.';
            } finally {
                likeBtn.disabled = false;
            }
        });
    }

    async function initAudiencePulse() {
        var root = document.getElementById(AUDIENCE_ROOT_ID);
        if (!root) return;

        try {
            var data = await fetchJson(AUDIENCE_URL, 9000);
            renderAudiencePulse(root, data);
        } catch (error) {
            renderAudiencePulse(root, buildAudienceFallback());
        }
    }

    async function initAudienceAndEngagement() {
        await initAudiencePulse();

        var engagementRoot = document.getElementById(ENGAGEMENT_ROOT_ID);
        if (engagementRoot) {
            initEngagement(engagementRoot);
        }
    }

    document.addEventListener('DOMContentLoaded', initAudienceAndEngagement);
})();
