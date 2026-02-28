/**
 * Shared utilities for portfolio site.
 * Used by logic.js and ai-monthly-feature.js.
 */

export function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function asNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function safeText(v) {
    return String(v || '');
}

export function normalizeText(value) {
    return String(value || '').toLowerCase();
}

export function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isMobileViewport() {
    return window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
}

export function formatMonth(value) {
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
