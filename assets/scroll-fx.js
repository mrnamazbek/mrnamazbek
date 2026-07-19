import { prefersReducedMotion } from './utils.js';

// === Connector thread: scroll-scrubbed SVG path weaving behind section content ===
// Technique adapted from an Awwwards scroll-storytelling reference (stroke-dashoffset
// scrubbed via ScrollTrigger); generalized here to a full dynamic page height instead
// of one fixed section, since content (projects, books) is injected asynchronously.
function buildThreadPath(width, height) {
    const amp = Math.min(width * 0.28, 160);
    const cx = width / 2;
    const seg = 480;
    let d = `M ${cx} 0`;
    let y = 0;
    let dir = 1;
    while (y < height) {
        const yMid = y + seg / 2;
        const yEnd = Math.min(y + seg, height);
        const x = cx + amp * dir;
        d += ` C ${cx} ${yMid}, ${x} ${yMid}, ${x} ${yEnd}`;
        y = yEnd;
        dir *= -1;
    }
    return d;
}

function initConnectorThread() {
    const main = document.querySelector('main.site-main');
    if (!main || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'connector-thread');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    const defs = document.createElementNS(svgNS, 'defs');
    const gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', 'connector-thread-gradient');
    gradient.setAttribute('x1', '0');
    gradient.setAttribute('y1', '0');
    gradient.setAttribute('x2', '0');
    gradient.setAttribute('y2', '1');
    [['0%', '#3b82f6'], ['50%', '#22d3ee'], ['100%', '#a78bfa']].forEach(([offset, color]) => {
        const stop = document.createElementNS(svgNS, 'stop');
        stop.setAttribute('offset', offset);
        stop.setAttribute('stop-color', color);
        gradient.appendChild(stop);
    });
    defs.appendChild(gradient);

    const path = document.createElementNS(svgNS, 'path');

    svg.appendChild(defs);
    svg.appendChild(path);
    main.insertBefore(svg, main.firstChild);

    let scrollTween = null;
    let resizeTimer = null;

    const rebuild = () => {
        const width = main.clientWidth;
        const height = main.scrollHeight;
        if (!width || !height) return;

        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        path.setAttribute('d', buildThreadPath(width, height));

        const length = path.getTotalLength();
        path.style.strokeDasharray = String(length);
        path.style.strokeDashoffset = String(length);

        if (scrollTween && scrollTween.scrollTrigger) scrollTween.scrollTrigger.kill();
        scrollTween = gsap.to(path, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: main,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.6
            }
        });
    };

    rebuild();

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(rebuild, 200);
    });

    // Injected content (projects grid, books list, etc.) changes main's height after load.
    const ro = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(rebuild, 200);
    });
    ro.observe(main);
}

// === Contact section: interactive dot-grid accent ===
// Adapted from an Awwwards canvas background reference (proximity-based color
// shift), recolored to the site palette and contained to a single section instead
// of a full-page canvas to keep it a subtle closing flourish, not a competing effect.
function initContactDotGrid() {
    const host = document.getElementById('contact-fx');
    if (!host) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'contact-fx__canvas';
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dotSize = 3;
    const gap = 26;
    const proximity = 110;
    const proxSq = proximity * proximity;
    const baseRgb = { r: 255, g: 255, b: 255 };
    const activeRgb = { r: 34, g: 211, b: 238 };

    let dots = [];
    let w = 0;
    let h = 0;

    const pointer = { x: -9999, y: -9999 };

    const build = () => {
        const rect = host.getBoundingClientRect();
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        w = rect.width;
        h = rect.height;
        if (!w || !h) return;

        canvas.width = Math.max(1, Math.floor(w * dpr));
        canvas.height = Math.max(1, Math.floor(h * dpr));
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const cols = Math.max(1, Math.floor((w + gap) / (dotSize + gap)));
        const rows = Math.max(1, Math.floor((h + gap) / (dotSize + gap)));
        const cell = dotSize + gap;
        const startX = (w - (cell * cols - gap)) / 2 + dotSize / 2;
        const startY = (h - (cell * rows - gap)) / 2 + dotSize / 2;

        dots = [];
        for (let yy = 0; yy < rows; yy++) {
            for (let xx = 0; xx < cols; xx++) {
                dots.push({ cx: startX + xx * cell, cy: startY + yy * cell });
            }
        }
    };

    let raf = 0;
    const draw = () => {
        raf = requestAnimationFrame(draw);
        if (!w || !h) return;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];
            const dx = dot.cx - pointer.x;
            const dy = dot.cy - pointer.y;
            const dsq = dx * dx + dy * dy;
            let style = 'rgba(255,255,255,0.16)';
            if (dsq <= proxSq) {
                const t = 1 - Math.sqrt(dsq) / proximity;
                const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
                const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
                const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
                style = `rgba(${r},${g},${b},${0.16 + 0.5 * t})`;
            }
            ctx.fillStyle = style;
            ctx.beginPath();
            ctx.arc(dot.cx, dot.cy, dotSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    build();
    draw();

    const ro = new ResizeObserver(build);
    ro.observe(host);

    host.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
    });
    host.addEventListener('mouseleave', () => {
        pointer.x = -9999;
        pointer.y = -9999;
    });

    host._fxCleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
    };
}

// === Cursor-spotlight hover glow for Arsenal + Project cards ===
// Delegated to the stable section containers since #projects-grid cards are
// injected asynchronously after this script runs.
function initCardSpotlight() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const zones = [document.getElementById('arsenal'), document.getElementById('projects-grid')];
    zones.forEach((zone) => {
        if (!zone) return;
        zone.addEventListener('mousemove', (e) => {
            const card = e.target.closest('[data-arsenal-card], .glass-card');
            if (!card || !zone.contains(card)) return;
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
        });
    });
}

function boot() {
    if (document.body.classList.contains('low-power')) return;
    if (document.body.classList.contains('compact-mobile')) return;
    if (prefersReducedMotion()) return;

    try { initConnectorThread(); } catch (e) { /* decorative only */ }
    try { initContactDotGrid(); } catch (e) { /* decorative only */ }
    try { initCardSpotlight(); } catch (e) { /* decorative only */ }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
