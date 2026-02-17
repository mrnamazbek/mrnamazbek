    // === 1. SHADER BACKGROUND ===
    const vertexShader = `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `;
    const fragmentShader = `
        uniform float time;
        varying vec2 vUv;
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            return 42.0 * dot( m*m, vec3( dot(p.x,x0), dot(p.y,x12.xy), dot(p.z,x12.zw) ) );
        }
        void main() {
            vec2 uv = vUv;
            float t = time * 0.15;
            float noise1 = snoise(uv * 1.5 + vec2(t, t * 0.5));
            float noise2 = snoise(uv * 2.0 - vec2(t * 0.3, t));
            vec3 color1 = vec3(0.05, 0.05, 0.15); // Deep Dark
            vec3 color2 = vec3(0.1, 0.1, 0.3); // Purple Tint
            vec3 color3 = vec3(0.0, 0.2, 0.3); // Cyan Tint
            vec3 finalColor = mix(color1, color2, noise1 * 0.5 + 0.5);
            finalColor = mix(finalColor, color3, noise2 * 0.5 + 0.5);
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    // === 7. MOBILE UX / COMPACT MODE ===
    function detectLowPowerDevice() {
        const reduceMotion = prefersReducedMotion();
        const mem = navigator.deviceMemory || 0;
        const cores = navigator.hardwareConcurrency || 0;
        const isSmall = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
        const isTouch = navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
        return reduceMotion || (isSmall && isTouch) || (mem && mem <= 4) || (cores && cores <= 4);
    }

    const COMPACT_PREF_KEY = 'compactMobile';

    function isCompactMobileViewport() {
        return window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
    }

    function getCompactPref() {
        return localStorage.getItem(COMPACT_PREF_KEY) === '1';
    }

    function setCompactPref(enabled) {
        if (enabled) localStorage.setItem(COMPACT_PREF_KEY, '1');
        else localStorage.removeItem(COMPACT_PREF_KEY);
    }

    function applyCompactMobileClass() {
        const enabled = getCompactPref();
        const isMobile = isCompactMobileViewport();
        document.body.classList.toggle('compact-mobile', !!(enabled && isMobile));

        // Compact is a mobile-only UX mode. Never force low-power on desktop.
        if (enabled && isMobile) {
            document.body.classList.add('low-power');
        }
    }

    window.enableCompactMode = function enableCompactMode() {
        setCompactPref(true);
        applyCompactMobileClass();
    };

    window.disableCompactMode = function disableCompactMode() {
        setCompactPref(false);
        applyCompactMobileClass();
    };

    window.loadMoreProjects = function loadMoreProjects() {
        projectsVisibleCount = Infinity;
        renderProjects(cachedRepos);
    };

    window.showAllBooks = function showAllBooks() {
        booksShowAll = !booksShowAll;
        const statusEl = document.getElementById('library-status');
        fetchBooksWithFallback(statusEl).then((result) => {
            renderVerticalLibrary(result.books, { offline: result.offline });
        });
    };

    function initResumeModal() {
        const openBtn = document.getElementById('resume-open');
        const modal = document.getElementById('resume-modal');
        const frame = document.getElementById('resume-frame');
        if (!openBtn || !modal || !frame) return;

        const RESUME_URL = 'assets/Namazbek_s_Resume_INT.pdf';

        function openModal() {
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');

            if (!frame.getAttribute('src')) {
                frame.setAttribute('src', RESUME_URL);
            }

            const panel = modal.querySelector('.vl-modal__panel');
            if (panel) window.setTimeout(() => panel.focus(), 0);
        }

        function closeModal() {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            try { openBtn.focus(); } catch (e) { /* ignore */ }
        }

        openBtn.addEventListener('click', openModal);

        modal.addEventListener('click', (e) => {
            const t = e.target;
            if (!t || !t.getAttribute) return;
            if (t.getAttribute('data-close') === '1') {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (modal.classList.contains('hidden')) return;
            closeModal();
        });
    }

    function initWorldClock() {
        const root = document.getElementById('world-clock');
        if (!root) return;

        const tzPicker = document.getElementById('tz-picker');
        const timeZones = [
            { label: 'Local', tz: null },
            { label: 'Almaty', tz: 'Asia/Almaty' },
            { label: 'UTC', tz: 'UTC' },
            { label: 'San Francisco', tz: 'America/Los_Angeles' },
            { label: 'London', tz: 'Europe/London' }
        ];

        function formatTime(tz) {
            const opts = {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                year: 'numeric',
                month: 'short',
                day: '2-digit'
            };
            if (tz) opts.timeZone = tz;
            return new Intl.DateTimeFormat(undefined, opts).format(new Date());
        }

        function render() {
            const selectedTz = tzPicker && tzPicker.value ? tzPicker.value : 'Asia/Almaty';
            const rows = timeZones.map(({ label, tz }) => {
                const useTz = label === 'Local' ? null : tz;
                const isSelected = useTz === selectedTz;
                const tzLabel = label === 'Local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : useTz;
                return {
                    label,
                    tz: tzLabel,
                    time: formatTime(useTz),
                    selected: isSelected
                };
            });

            root.innerHTML = rows.map(r => {
                return `
                    <div class="mini-row ${r.selected ? 'is-selected' : ''}">
                        <div class="mini-row__left">
                            <div class="mini-row__title">${r.label}</div>
                            <div class="mini-row__sub">${r.tz || ''}</div>
                        </div>
                        <div class="mini-row__right">${r.time}</div>
                    </div>
                `;
            }).join('');
        }

        if (tzPicker) tzPicker.addEventListener('change', render);
        render();
        window.setInterval(render, 1000);
    }

    function initDbRankingWidget() {
        const root = document.getElementById('db-ranking');
        if (!root) return;

        const sortSel = document.getElementById('db-sort');

        const fallback = [
            { rank: 1, name: 'Oracle', model: 'Relational, Multi-model', score_feb_2026: 1203.51, score_jan_2026: 1237.33, score_feb_2025: 1254.82, delta_mom: -33.82, delta_yoy: -51.31, icon: 'devicon-oracle-original colored' },
            { rank: 2, name: 'MySQL', model: 'Relational, Multi-model', score_feb_2026: 868.22, score_jan_2026: 867.52, score_feb_2025: 999.99, delta_mom: 0.70, delta_yoy: -131.77, icon: 'devicon-mysql-plain colored' },
            { rank: 3, name: 'Microsoft SQL Server', model: 'Relational, Multi-model', score_feb_2026: 708.14, score_jan_2026: 706.26, score_feb_2025: 786.87, delta_mom: 1.88, delta_yoy: -78.73, icon: 'devicon-microsoftsqlserver-plain colored' },
            { rank: 4, name: 'PostgreSQL', model: 'Relational, Multi-model', score_feb_2026: 672.03, score_jan_2026: 666.26, score_feb_2025: 659.61, delta_mom: 5.77, delta_yoy: 12.42, icon: 'devicon-postgresql-plain colored' },
            { rank: 5, name: 'MongoDB', model: 'Document, Multi-model', score_feb_2026: 378.73, score_jan_2026: 376.74, score_feb_2025: 396.63, delta_mom: 1.99, delta_yoy: -17.90, icon: 'devicon-mongodb-plain colored' },
            { rank: 6, name: 'Snowflake', model: 'Relational', score_feb_2026: 208.14, score_jan_2026: 207.80, score_feb_2025: 155.58, delta_mom: 0.34, delta_yoy: 52.56, icon: '' },
            { rank: 7, name: 'Redis', model: 'Key-value, Multi-model', score_feb_2026: 147.04, score_jan_2026: 144.16, score_feb_2025: 157.91, delta_mom: 2.88, delta_yoy: -10.87, icon: 'devicon-redis-plain colored' },
            { rank: 8, name: 'Databricks', model: 'Multi-model', score_feb_2026: 144.51, score_jan_2026: 141.54, score_feb_2025: 90.03, delta_mom: 2.97, delta_yoy: 54.48, icon: '' },
            { rank: 9, name: 'IBM Db2', model: 'Relational, Multi-model', score_feb_2026: 111.22, score_jan_2026: 112.72, score_feb_2025: 125.43, delta_mom: -1.50, delta_yoy: -14.21, icon: '' },
            { rank: 10, name: 'Elasticsearch', model: 'Multi-model', score_feb_2026: 106.46, score_jan_2026: 107.15, score_feb_2025: 134.63, delta_mom: -0.69, delta_yoy: -28.17, icon: 'devicon-elasticsearch-plain colored' }
        ];

        let data = [];

        function normalize(items) {
            if (!Array.isArray(items)) return [];

            return items
                .map(it => {
                    const name = String(it.name || '').trim() || 'Unknown';
                    const legacyScore = Number(it.score);

                    // Support two schemas:
                    // A) Explicit month keys (score_feb_2026, score_jan_2026, score_feb_2025)
                    // B) Updater keys (score_current, score_prev_month, score_prev_year)
                    const hasUpdaterSchema = Number.isFinite(Number(it.score_current)) || Number.isFinite(Number(it.score_prev_month)) || Number.isFinite(Number(it.score_prev_year));

                    const scoreFeb = Number.isFinite(Number(it.score_feb_2026)) ? Number(it.score_feb_2026)
                        : (Number.isFinite(Number(it.score_current)) ? Number(it.score_current)
                            : (Number.isFinite(legacyScore) ? legacyScore : 0));

                    const scoreJan = Number.isFinite(Number(it.score_jan_2026)) ? Number(it.score_jan_2026)
                        : (Number.isFinite(Number(it.score_prev_month)) ? Number(it.score_prev_month)
                            : (Number.isFinite(Number(it.delta_mom)) ? (scoreFeb - Number(it.delta_mom)) : scoreFeb));

                    const scorePrevYear = Number.isFinite(Number(it.score_feb_2025)) ? Number(it.score_feb_2025)
                        : (Number.isFinite(Number(it.score_prev_year)) ? Number(it.score_prev_year)
                            : (Number.isFinite(Number(it.delta_yoy)) ? (scoreFeb - Number(it.delta_yoy)) : scoreFeb));

                    const deltaMoM = Number.isFinite(Number(it.delta_mom)) ? Number(it.delta_mom) : (scoreFeb - scoreJan);
                    const deltaYoY = Number.isFinite(Number(it.delta_yoy)) ? Number(it.delta_yoy) : (scoreFeb - scorePrevYear);

                    return {
                        rank: Number(it.rank) || 999,
                        name,
                        model: String(it.model || it.category || '').trim() || 'other',
                        scoreFeb,
                        scoreJan,
                        scorePrevYear,
                        deltaMoM,
                        deltaYoY,
                        asOf: String(it.as_of || it.asOf || '').trim(),
                        icon: it.icon ? String(it.icon) : ''
                    };
                })
                .filter(it => it.name !== 'Unknown');
        }

        function fmtDelta(v) {
            const n = Number(v) || 0;
            const sign = n > 0 ? '+' : '';
            return sign + n.toFixed(2);
        }

        function deltaClass(v) {
            const n = Number(v) || 0;
            if (n > 0) return 'delta delta--up';
            if (n < 0) return 'delta delta--down';
            return 'delta';
        }

        function sparklineSvg(values) {
            const pts = values.map(v => (Number.isFinite(v) ? v : 0));
            const min = Math.min(...pts);
            const max = Math.max(...pts);
            const w = 54;
            const h = 18;
            const pad = 2;
            const span = Math.max(1e-9, max - min);

            const xy = pts.map((v, i) => {
                const x = pad + (i * (w - pad * 2) / (pts.length - 1));
                const y = pad + ((max - v) * (h - pad * 2) / span);
                return [x, y];
            });

            const d = xy.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' ');
            return `
                <svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" focusable="false">
                    <path d="${d}" fill="none" stroke="rgba(0,212,255,0.85)" stroke-width="1.6" />
                </svg>
            `;
        }

        function sortItems(items) {
            const key = sortSel && sortSel.value ? sortSel.value : 'rank';
            const list = [...items];
            if (key === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
            else if (key === 'score') list.sort((a, b) => (b.scoreFeb - a.scoreFeb) || (a.rank - b.rank));
            else list.sort((a, b) => a.rank - b.rank);
            return list;
        }

        function render() {
            const items = sortItems(data).slice(0, 12);
            root.innerHTML = `
                <div class="mini-table" role="table" aria-label="DB rankings">
                    ${items.map(it => {
                        const icon = it.icon ? `<i class="${it.icon}"></i>` : '';
                        const trend = sparklineSvg([it.scorePrevYear, it.scoreJan, it.scoreFeb]);
                        return `
                            <div class="mini-table__row" role="row">
                                <div class="mini-table__cell mono" role="cell">#${it.rank}</div>
                                <div class="mini-table__cell" role="cell">
                                    <div class="mini-db">
                                        <span class="mini-db__icon" aria-hidden="true">${icon}</span>
                                        <span class="mini-db__name">${it.name}</span>
                                    </div>
                                    <div class="mini-db__meta">${it.model}</div>
                                    <div class="mini-db__trend">
                                        ${trend}
                                        <span class="${deltaClass(it.deltaMoM)}" title="Month over month change">MoM ${fmtDelta(it.deltaMoM)}</span>
                                        <span class="${deltaClass(it.deltaYoY)}" title="Year over year change">YoY ${fmtDelta(it.deltaYoY)}</span>
                                    </div>
                                </div>
                                <div class="mini-table__cell mono" role="cell">${it.scoreFeb.toFixed(2)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        async function load() {
            try {
                const res = await fetch('assets/db_ranking.json', { cache: 'no-cache' });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const json = await res.json();
                data = normalize(json);
                if (!data.length) data = normalize(fallback);
            } catch (e) {
                data = normalize(fallback);
            }
            render();
        }

        if (sortSel) sortSel.addEventListener('change', render);
        load();
    }

    function initMobileArsenalAccordion() {
        if (!isMobileViewport()) return;
        const cards = document.querySelectorAll('[data-arsenal-card]');
        cards.forEach((card) => {
            const headerRow = card.querySelector('.flex.items-center.gap-3');
            const content = card.querySelector('.flex.flex-wrap.gap-2');
            if (!headerRow || !content) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'w-full text-left min-h-[44px]';
            btn.setAttribute('aria-expanded', 'false');

            // Move existing header into button
            btn.appendChild(headerRow);
            card.insertBefore(btn, card.firstChild);

            const wrapper = document.createElement('div');
            wrapper.className = 'vl-accordion';
            wrapper.hidden = true;
            content.parentNode.insertBefore(wrapper, content);
            wrapper.appendChild(content);

            const open = () => {
                btn.setAttribute('aria-expanded', 'true');
                wrapper.hidden = false;
                wrapper.classList.add('is-open');
                wrapper.style.maxHeight = prefersReducedMotion() ? 'none' : (wrapper.scrollHeight + 'px');
            };
            const close = () => {
                btn.setAttribute('aria-expanded', 'false');
                if (prefersReducedMotion()) {
                    wrapper.hidden = true;
                    wrapper.classList.remove('is-open');
                    wrapper.style.maxHeight = '0px';
                } else {
                    wrapper.style.maxHeight = '0px';
                    wrapper.classList.remove('is-open');
                    setTimeout(() => { wrapper.hidden = true; }, 220);
                }
            };
            btn.addEventListener('click', () => {
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                expanded ? close() : open();
            });
        });
    }

    function initShader() {
        if (window.innerWidth < 768) return;
        if (document.body.classList.contains('low-power')) return;
        if (document.body.classList.contains('compact-mobile')) return;
        const canvas = document.getElementById('webgl-canvas');
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        const material = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader, fragmentShader
        });
        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            material.uniforms.time.value = clock.getElapsedTime();
            renderer.render(scene, camera);
        }
        animate();
        window.addEventListener('resize', () => renderer.setSize(window.innerWidth, window.innerHeight));
    }

    // === 2. PARTICLE CURSOR EFFECTS ===
    function initParticles() {
        if (document.body.classList.contains('low-power')) return;
        if (document.body.classList.contains('compact-mobile')) return;
        const canvas = document.getElementById('fx-canvas');
        const ctx = canvas.getContext('2d');
        let w, h;
        function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
        resize(); window.addEventListener('resize', resize);
        const particles = [];
        document.addEventListener('mousemove', (e) => {
            for (let i = 0; i < 2; i++) {
                particles.push({
                    x: e.clientX, y: e.clientY,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 1.0,
                    color: Math.random() > 0.5 ? '#00d4ff' : '#00e6a0',
                    size: Math.random() * 3 + 1
                });
            }
        });
        function loop() {
            ctx.clearRect(0, 0, w, h);
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx; p.y += p.vy;
                p.life -= 0.02;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            requestAnimationFrame(loop);
        }
        loop();
    }

    // === 3. CUSTOM MOUSE CURSOR (WITH LERP) ===
    function initCustomCursor() {
        if (window.innerWidth < 768) return;
        if (document.body.classList.contains('low-power')) return;
        if (document.body.classList.contains('compact-mobile')) return;
        const cursor = document.getElementById('custom-cursor');
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Make cursor stick/grow on hoverable elements
        const hoverables = document.querySelectorAll('a, button, .glass-card, .tech-chip');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });

        function animateCursor() {
            // Lerp formula: current + (target - current) * factor
            const factor = 0.15;
            cursorX += (mouseX - cursorX) * factor;
            cursorY += (mouseY - cursorY) * factor;

            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    // === 4. ANTI-GRAVITY LOGOS (PHYSICS + PARALLAX) ===
    function initAntiGravityLogos() {
        if (window.innerWidth < 768) return;
        if (document.body.classList.contains('low-power')) return;
        if (document.body.classList.contains('compact-mobile')) return;
        const container = document.getElementById('anti-gravity-container');
        const icons = [
            'devicon-python-plain colored', 'devicon-java-plain colored', 'devicon-javascript-plain colored',
            'devicon-docker-plain colored', 'devicon-kubernetes-plain colored', 'devicon-apachekafka-original colored',
            'devicon-postgresql-plain colored', 'devicon-react-original colored', 'devicon-linux-plain colored',
            'devicon-git-plain colored', 'devicon-bash-plain colored', 'devicon-amazonwebservices-plain-wordmark colored'
        ];

        const logos = [];
        const count = window.innerWidth < 1024 ? 6 : 14;

        // Spawn Logos
        for (let i = 0; i < count; i++) {
            const el = document.createElement('i');
            const iconClass = icons[Math.floor(Math.random() * icons.length)];
            el.className = `floating-logo ${iconClass}`;

            // Random Props
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const scale = 0.5 + Math.random() * 1.5; // 0.5x to 2.0x
            const opacity = 0.05 + Math.random() * 0.15; // faint

            el.style.left = '0px';
            el.style.top = '0px';
            el.style.opacity = opacity;
            el.style.fontSize = `${2 * scale}rem`; // Scale size directly

            container.appendChild(el);

            logos.push({
                el,
                x, y,
                vx: (Math.random() - 0.5) * 0.5, // Slow drift
                vy: (Math.random() - 0.5) * 0.5,
                parallaxFactor: (Math.random() + 0.5) * 0.05 // Different depth perception
            });
        }

        // Mouse parallax target
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateLogos() {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Parallax push (opposite to mouse)
            const pushX = (centerX - mouseX);
            const pushY = (centerY - mouseY);

            logos.forEach(logo => {
                // Update physics
                logo.x += logo.vx;
                logo.y += logo.vy;

                // Wrap around screen
                if (logo.x < -50) logo.x = window.innerWidth + 50;
                if (logo.x > window.innerWidth + 50) logo.x = -50;
                if (logo.y < -50) logo.y = window.innerHeight + 50;
                if (logo.y > window.innerHeight + 50) logo.y = -50;

                // Apply layout + parallax
                const finalX = logo.x + (pushX * logo.parallaxFactor);
                const finalY = logo.y + (pushY * logo.parallaxFactor);

                logo.el.style.transform = `translate(${finalX}px, ${finalY}px)`;
            });

            requestAnimationFrame(animateLogos);
        }
        animateLogos();
    }

    // === 5. SCROLL ANIMATIONS (GSAP) ===
    function initScrollAnimations() {
        if (document.body.classList.contains('low-power')) return;
        if (document.body.classList.contains('compact-mobile')) return;
        gsap.registerPlugin(ScrollTrigger);

        // Animate only section cards (exclude nav)
        const cards = gsap.utils.toArray('section:not(#journey) .glass-card, #projects-grid .glass-card');
        cards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none none",
                    once: true
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                delay: i % 3 * 0.1,
                immediateRender: false
            });
        });

        // Hero text animation
        gsap.from("#about h1, #about p", {
            y: 30, opacity: 0, duration: 1, stagger: 0.2, ease: "power2.out", delay: 0.5
        });

        // Journey section reveal
        const journeyCards = gsap.utils.toArray('#journey .journey-card, #journey .edu-card, #journey .journey-insight');
        journeyCards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 92%",
                    toggleActions: "play none none none"
                },
                y: 30,
                opacity: 0,
                duration: 0.7,
                ease: "power2.out",
                delay: Math.min(i * 0.03, 0.25),
                immediateRender: false
            });
        });

        // Ensure ScrollTrigger measurements are accurate after layout settles
        setTimeout(() => {
            try {
                ScrollTrigger.refresh();
            } catch (e) {
                // ignore
            }
        }, 0);
    }

    // === 6. DATA LOADING (HARDCODED) ===
    let cachedRepos = [];

    let projectsVisibleCount = Infinity;
    let booksShowAll = false;

    // Repo Tech Mapping (Extend with logic)
    const repoTechMap = {
        'ConnectIn': ['devicon-fastapi-plain colored', 'devicon-postgresql-plain colored', 'devicon-redis-plain colored', 'devicon-docker-plain colored'],
        'Antigravity': ['devicon-python-plain colored', 'devicon-tensorflow-original colored', 'devicon-react-original colored'],
        'DataPipeline-X': ['devicon-apachespark-original colored', 'devicon-apachekafka-original colored', 'devicon-aws-plain colored'],
        'mrnamazbek': ['devicon-github-original colored', 'devicon-markdown-original colored']
    };

    function getTechIcons(repo) {
        if (!repo) return ['devicon-git-plain colored', 'devicon-vscode-plain colored'];
        // 1. Check direct map
        if (repo.name && repoTechMap[repo.name]) return repoTechMap[repo.name];

        // 2. Infer from Language
        const lang = (repo.language || '').toLowerCase();
        if (lang === 'python') return ['devicon-python-plain colored', 'devicon-pandas-plain colored', 'devicon-numpy-plain colored'];
        if (lang === 'java') return ['devicon-java-plain colored', 'devicon-spring-plain colored'];
        if (lang === 'javascript') return ['devicon-javascript-plain colored', 'devicon-nodejs-plain colored'];
        if (lang === 'typescript') return ['devicon-typescript-plain colored', 'devicon-react-original colored'];
        if (lang === 'go') return ['devicon-go-original-wordmark colored', 'devicon-kubernetes-plain colored'];
        if (lang === 'jupyter notebook') return ['devicon-jupyter-plain colored', 'devicon-python-plain colored'];
        if (lang === 'html') return ['devicon-html5-plain colored', 'devicon-css3-plain colored'];

        // 3. Default
        return ['devicon-git-plain colored', 'devicon-vscode-plain colored'];
    }

    function normalizeText(value) {
        return String(value || '').toLowerCase();
    }

    function renderProjects(repos, keyword) {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        const list = Array.isArray(repos) ? repos : [];

        const kw = normalizeText(keyword).trim();
        const filtered = kw
            ? list.filter(repo => {
                if (!repo) return false;
                const hay = [repo.name, repo.description, repo.language].map(normalizeText).join(' ');
                return hay.includes(kw);
            })
            : list;

        const showMoreBtn = document.getElementById('projects-show-more');
        const limited = Number.isFinite(projectsVisibleCount) ? filtered.slice(0, projectsVisibleCount) : filtered;

        if (showMoreBtn) {
            const hasMore = limited.length < filtered.length;
            showMoreBtn.classList.toggle('hidden', !hasMore);
            showMoreBtn.textContent = hasMore ? 'Show more' : 'Show more';
        }

        if (!limited.length) {
            grid.innerHTML = '<div class="text-gray-500">No matching projects found for: <span class="text-cyan-300">' + keyword + '</span></div>';
            return;
        }

        grid.innerHTML = '';
        limited.forEach(repo => {
            if (!repo) return;
            const card = document.createElement('a');
            card.href = repo.html_url || '#';
            card.target = "_blank";
            card.className = "glass-card p-6 flex flex-col justify-between h-[240px] group";

            const techIcons = getTechIcons(repo);
            const iconsHtml = techIcons.map(icon => `<i class="${icon} text-xl"></i>`).join('');

            const badge = kw
                ? `<div class="text-[10px] font-mono uppercase tracking-widest text-cyan-300/80">Filtered by: ${keyword}</div>`
                : '';

            card.innerHTML = `
                    <div>
                         <div class="flex items-center justify-between gap-2 text-cyan-400 mb-3 text-xs font-mono uppercase tracking-wider">
                            <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-cyan-400"></span> ${repo.language || 'Code'}</div>
                            ${badge}
                        </div>
                        <h3 class="text-xl font-bold group-hover:text-cyan-200 transition">${repo.name}</h3>
                        <p class="text-gray-400 text-sm mt-3 line-clamp-3">${repo.description || 'No description.'}</p>
                    </div>

                    <!-- Dynamic Tech Icons -->
                    <div class="mt-auto pt-4 border-t border-white/10 flex items-center gap-4 opacity-80 group-hover:opacity-100 transition">
                         ${iconsHtml}
                    </div>
                `;
            grid.appendChild(card);
        });
    }

    // === 6.1 VERTICAL LIBRARY (BOOKS) ===
    const LIBRARY_CONFIG = {
        BOOKS_URL: 'assets/books.json',
        USE_MODAL_ON_MOBILE: false
    };

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function isMobileViewport() {
        return window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    }

    function makeBookCoverFallback(title, author) {
        const t = String(title || '').slice(0, 38);
        const a = String(author || '').slice(0, 38);
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="480" viewBox="0 0 320 480">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0ea5e9" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#a78bfa" stop-opacity="0.22"/>
    </linearGradient>
  </defs>
  <rect width="320" height="480" rx="22" fill="#0a0a0a"/>
  <rect x="14" y="14" width="292" height="452" rx="18" fill="url(#g)" stroke="rgba(255,255,255,0.16)"/>
  <text x="28" y="215" fill="rgba(255,255,255,0.92)" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700">${t}</text>
  <text x="28" y="250" fill="rgba(229,231,235,0.78)" font-family="Inter, Arial, sans-serif" font-size="14">${a}</text>
</svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    async function fetchBooksWithFallback(statusEl) {
        const inlineFallback = [
            {
                id: 'kleppmann-ddia',
                title: 'Designing Data-Intensive Applications',
                author: 'Martin Kleppmann',
                cover_url: 'https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg',
                isbn: '9781449373320',
                short_blurb: 'A practical guide to designing scalable, reliable, maintainable systems.',
                long_summary: 'A deep, practical tour of replication, partitioning, transactions, streams, and the real trade-offs behind modern data systems. It helps you reason about correctness, latency, throughput, and failure modes — the exact things that make pipelines trustworthy in production.',
                tags: ['architecture', 'consistency', 'replication'],
                read_status: 'reading',
                alt_text: 'Cover — Designing Data-Intensive Applications'
            },
            {
                id: 'reis-fundamentals-de',
                title: 'Fundamentals of Data Engineering',
                author: 'Joe Reis & Matt Housley',
                cover_url: 'https://covers.openlibrary.org/b/isbn/9781098108304-L.jpg',
                isbn: '9781098108304',
                short_blurb: 'Modern map of the data engineering lifecycle: from sources to serving.',
                long_summary: 'Clarifies what “good” looks like in real data engineering: ownership, quality, observability, governance, and cost. Useful when you’re moving from building pipelines to building reliable data products.',
                tags: ['lifecycle', 'governance', 'quality'],
                read_status: 'to-read',
                alt_text: 'Cover — Fundamentals of Data Engineering'
            },
            {
                id: 'martin-clean-code',
                title: 'Clean Code',
                author: 'Robert C. Martin',
                cover_url: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
                isbn: '9780132350884',
                short_blurb: 'Write code that is readable, maintainable, and boring-in-a-good-way.',
                long_summary: 'Even in data engineering, the fastest way to create outages is unreadable code. This book pushes naming, structure, testing discipline, and refactoring habits that keep pipelines and services easy to evolve.',
                tags: ['craftsmanship', 'refactoring', 'testing'],
                read_status: 'completed',
                alt_text: 'Cover — Clean Code'
            },
            {
                id: 'kimball-dw-toolkit',
                title: 'The Data Warehouse Toolkit',
                author: 'Ralph Kimball',
                cover_url: 'https://covers.openlibrary.org/b/isbn/9781118530801-L.jpg',
                isbn: '9781118530801',
                short_blurb: 'Dimensional modeling patterns that still power modern analytics.',
                long_summary: 'Explains facts, dimensions, slowly changing dimensions, and how to design models that stay understandable as requirements change. Great for building data marts and BI-friendly layers.',
                tags: ['modeling', 'analytics', 'dimensional'],
                read_status: 'to-read',
                alt_text: 'Cover — The Data Warehouse Toolkit'
            },
            {
                id: 'densmore-data-pipelines',
                title: 'Data Pipelines Pocket Reference',
                author: 'James Densmore',
                cover_url: 'https://covers.openlibrary.org/b/isbn/9781492087830-L.jpg',
                isbn: '9781492087830',
                short_blurb: 'A compact guide to moving data from raw sources to analytics.',
                long_summary: 'Covers patterns, trade-offs, and common failure points in pipeline design — useful as a quick reference when you’re building ingestion, transformations, and data delivery workflows.',
                tags: ['etl', 'patterns', 'operations'],
                read_status: 'to-read',
                alt_text: 'Cover — Data Pipelines Pocket Reference'
            },
            {
                id: 'shapira-kafka',
                title: 'Kafka: The Definitive Guide',
                author: 'Gwen Shapira',
                cover_url: 'https://covers.openlibrary.org/b/isbn/9781491936160-L.jpg',
                isbn: '9781491936160',
                short_blurb: 'Event streaming patterns for real-time, decoupled systems.',
                long_summary: 'A practical look at Kafka architecture, producer/consumer design, delivery guarantees, and operations. Helpful for anyone building CDC, streaming ingestion, or event-driven microservices.',
                tags: ['streaming', 'events', 'kafka'],
                read_status: 'to-read',
                alt_text: 'Cover — Kafka: The Definitive Guide'
            }
        ];

        try {
            const res = await fetch(LIBRARY_CONFIG.BOOKS_URL, { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            if (!Array.isArray(data)) throw new Error('Invalid books.json format');
            return { books: data, offline: false };
        } catch (e) {
            if (statusEl) statusEl.textContent = 'Library offline — showing cached list';
            return { books: inlineFallback, offline: true };
        }
    }

    function getStatusBadge(status) {
        const s = String(status || '').toLowerCase();
        if (s === 'reading') return { text: 'Reading', cls: 'bg-cyan-500/15 text-cyan-200 border-cyan-300/20' };
        if (s === 'completed') return { text: 'Completed', cls: 'bg-emerald-500/15 text-emerald-200 border-emerald-300/20' };
        return { text: 'To read', cls: 'bg-white/5 text-gray-200 border-white/10' };
    }

    function safeText(v) {
        return String(v || '');
    }

    function renderVerticalLibrary(books, options) {
        const listEl = document.getElementById('vertical-books-list');
        if (!listEl) return;

        const statusEl = document.getElementById('library-status');
        if (statusEl && options && options.offline) {
            statusEl.textContent = 'Library offline — showing cached list';
        }

        const reduceMotion = prefersReducedMotion();

        listEl.innerHTML = '';
        const domIndex = {};

        const isMobile = isMobileViewport();
        const visibleBooks = (isMobile && !booksShowAll) ? books.slice(0, 4) : books;

        const seeAllBtn = document.getElementById('books-see-all');
        if (seeAllBtn) {
            const shouldShow = isMobile && books.length > 4;
            seeAllBtn.classList.toggle('hidden', !shouldShow);
            seeAllBtn.textContent = booksShowAll ? 'Collapse' : 'See all';
        }

        visibleBooks.forEach((b) => {
            const id = safeText(b.id || (b.title || '').toLowerCase().replace(/\s+/g, '-'));
            const title = safeText(b.title);
            const author = safeText(b.author);
            const cover = safeText(b.cover_url);
            const alt = safeText(b.alt_text || ('Cover — ' + title));
            const shortBlurb = safeText(b.short_blurb);
            const tags = Array.isArray(b.tags) ? b.tags : [];
            const badge = getStatusBadge(b.read_status);
            const panelId = `book-panel-${id}`;

            const fallbackCover = makeBookCoverFallback(title, author);
            const item = document.createElement('div');
            item.className = 'glass-card p-4 rounded-2xl';

            item.innerHTML = `
                <div class="vl-book" role="button" tabindex="0" aria-expanded="false" aria-controls="${panelId}" aria-label="${title} by ${author}">
                    <div class="flex gap-4">
                        <div class="vl-cover w-[56px] h-[84px] rounded-xl overflow-hidden border border-white/10 flex-none">
                            <img src="${cover}" alt="${alt}" loading="lazy" decoding="async"
                                 srcset="${cover} 1x, ${cover} 2x"
                                 onload="this.classList.add('is-loaded')"
                                 onerror="this.onerror=null;this.src='${fallbackCover}';this.classList.add('is-loaded')" />
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0 flex-1">
                                    <div class="font-bold text-white/90 leading-snug truncate">${title}</div>
                                    <div class="text-xs text-gray-400 truncate">${author}</div>
                                </div>
                                <span class="flex-shrink-0 text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full border ${badge.cls}">${badge.text}</span>
                            </div>
                            <div class="text-[11px] text-gray-500 mt-2 truncate">${tags.slice(0, 3).join(' · ')}</div>
                        </div>
                    </div>
                </div>

                <div id="${panelId}" class="vl-accordion" hidden>
                    <div class="mt-3 pt-3 border-t border-white/10">
                        <div class="text-gray-300 text-sm leading-relaxed">${shortBlurb}</div>
                        <div class="flex flex-wrap gap-2 mt-3">
                            <button type="button" class="px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm" data-action="readmore" data-book-id="${id}">Read more</button>
                            <button type="button" class="px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm" data-action="collapse" data-book-id="${id}">Collapse</button>
                        </div>
                    </div>
                </div>
            `;

            item.dataset.bookId = id;
            listEl.appendChild(item);

            const header = item.querySelector('.vl-book');
            const accordion = item.querySelector('#' + CSS.escape(panelId));

            const openAccordion = () => {
                if (!accordion || !header) return;
                const expanded = header.getAttribute('aria-expanded') === 'true';
                if (expanded) return;

                header.setAttribute('aria-expanded', 'true');
                accordion.hidden = false;
                accordion.classList.add('is-open');

                if (reduceMotion) {
                    accordion.style.maxHeight = 'none';
                } else {
                    accordion.style.maxHeight = accordion.scrollHeight + 'px';
                }

                document.dispatchEvent(new CustomEvent('book:open', { detail: id }));
            };

            const closeAccordion = () => {
                if (!accordion || !header) return;
                const expanded = header.getAttribute('aria-expanded') === 'true';
                if (!expanded) return;

                header.setAttribute('aria-expanded', 'false');
                if (reduceMotion) {
                    accordion.classList.remove('is-open');
                    accordion.hidden = true;
                    accordion.style.maxHeight = '0px';
                } else {
                    accordion.style.maxHeight = '0px';
                    accordion.classList.remove('is-open');
                    window.setTimeout(() => {
                        accordion.hidden = true;
                    }, 220);
                }
                document.dispatchEvent(new CustomEvent('book:close', { detail: id }));
            };

            const toggleAccordion = () => {
                const expanded = header.getAttribute('aria-expanded') === 'true';
                if (expanded) closeAccordion();
                else openAccordion();
            };

            domIndex[id] = { item, header, accordion, openAccordion, closeAccordion };

            header.addEventListener('click', (e) => {
                // Ignore clicks that originate from nested buttons
                const t = e.target;
                if (t && t.closest && t.closest('button')) return;
                toggleAccordion();
            });

            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAccordion();
                }
            });

            item.addEventListener('click', (e) => {
                const btn = e.target && e.target.closest ? e.target.closest('button[data-action]') : null;
                if (!btn) return;

                const action = btn.getAttribute('data-action');
                if (action === 'collapse') closeAccordion();
                if (action === 'readmore') {
                    openBookInModal(id);
                }
            });
        });

        // Expose API after render
        window.library = window.library || {};
        window.library.openBook = (id) => {
            const key = String(id || '');
            const entry = window.library._domIndex ? window.library._domIndex[key] : null;
            if (entry && entry.openAccordion) entry.openAccordion();
            openBookInModal(key);
        };
        window.library.closeModal = () => closeLibraryModal();

        // Keep data accessible for modal
        window.library._booksIndex = Object.fromEntries(books.map((b) => {
            const id = safeText(b.id || (b.title || '').toLowerCase().replace(/\s+/g, '-'));
            return [id, b];
        }));

        window.library._domIndex = domIndex;
    }

    function openBookInModal(id) {
        const reduceMotion = prefersReducedMotion();
        const modal = document.getElementById('library-modal');
        const panel = modal ? modal.querySelector('.vl-modal__panel') : null;
        if (!modal || !panel) return;

        const booksIndex = window.library && window.library._booksIndex ? window.library._booksIndex : {};
        const book = booksIndex[id];
        if (!book) return;

        const useModal = !isMobileViewport() || LIBRARY_CONFIG.USE_MODAL_ON_MOBILE;
        if (!useModal) {
            const url = book.isbn ? `https://openlibrary.org/isbn/${book.isbn}` : '#';
            if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }

        const titleEl = document.getElementById('library-modal-title');
        const authorEl = document.getElementById('library-modal-author');
        const tagsEl = document.getElementById('library-modal-tags');
        const bodyEl = document.getElementById('library-modal-body');
        const readMoreEl = document.getElementById('library-modal-readmore');

        if (titleEl) titleEl.textContent = safeText(book.title);
        if (authorEl) authorEl.textContent = safeText(book.author);
        if (bodyEl) bodyEl.textContent = safeText(book.long_summary || book.short_blurb || '');
        if (tagsEl) {
            tagsEl.innerHTML = '';
            const tags = Array.isArray(book.tags) ? book.tags : [];
            tags.slice(0, 8).forEach((t) => {
                const span = document.createElement('span');
                span.className = 'journey-skill';
                span.textContent = String(t);
                tagsEl.appendChild(span);
            });
        }

        if (readMoreEl) {
            const url = book.isbn ? `https://openlibrary.org/isbn/${book.isbn}` : '#';
            readMoreEl.href = url;
            readMoreEl.classList.toggle('hidden', url === '#');
        }

        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');

        document.dispatchEvent(new CustomEvent('book:open', { detail: id }));

        // Focus trap
        const lastFocus = document.activeElement;
        modal._lastFocus = lastFocus;

        const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const getFocusable = () => Array.from(panel.querySelectorAll(focusableSelector)).filter((el) => el.offsetParent !== null);

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeLibraryModal();
                return;
            }
            if (e.key === 'Tab') {
                const focusables = getFocusable();
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        modal._onKeyDown = onKeyDown;
        document.addEventListener('keydown', onKeyDown);

        // Backdrop + close buttons
        const onClick = (e) => {
            const close = e.target && e.target.getAttribute ? e.target.getAttribute('data-close') : null;
            if (close) closeLibraryModal();
        };
        modal._onClick = onClick;
        modal.addEventListener('click', onClick);

        // Focus dialog
        if (reduceMotion) {
            panel.focus();
        } else {
            window.setTimeout(() => panel.focus(), 0);
        }
    }

    function closeLibraryModal() {
        const modal = document.getElementById('library-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');

        document.dispatchEvent(new CustomEvent('book:close', { detail: 'modal' }));

        if (modal._onKeyDown) document.removeEventListener('keydown', modal._onKeyDown);
        if (modal._onClick) modal.removeEventListener('click', modal._onClick);

        const last = modal._lastFocus;
        if (last && last.focus) {
            try { last.focus(); } catch (e) { /* ignore */ }
        }
    }

    async function loadContent() {
        const statusEl = document.getElementById('library-status');
        const result = await fetchBooksWithFallback(statusEl);
        renderVerticalLibrary(result.books, { offline: result.offline });

        // GitHub
        const grid = document.getElementById('projects-grid');
        try {
            const res = await fetch('https://api.github.com/users/mrnamazbek/repos?sort=updated&per_page=6');
            const repos = await res.json();
            if (Array.isArray(repos) && repos.length) {
                const statsEl = document.getElementById('stats-repos');
                if (statsEl) statsEl.innerText = repos.length + "+";
            }

            cachedRepos = Array.isArray(repos) ? repos : [];
            renderProjects(cachedRepos);
        } catch (e) {
            grid.innerHTML = '<div class="text-gray-500">GitHub API Limit Reached.</div>';
        }
    }

    // INIT
    window.addEventListener('DOMContentLoaded', () => {
        // Low-power detection first
        if (detectLowPowerDevice()) {
            document.body.classList.add('low-power');
        }

        // Default compact-mobile to ON for first-time mobile visitors (can be disabled via toggle)
        if (isCompactMobileViewport() && localStorage.getItem(COMPACT_PREF_KEY) === null) {
            setCompactPref(true);
        }

        applyCompactMobileClass();

        // Re-apply compact-mobile class on viewport changes.
        window.addEventListener('resize', () => {
            applyCompactMobileClass();
        });

        initShader();
        initCustomCursor();
        initParticles();
        initAntiGravityLogos();
        initScrollAnimations();
        loadContent(); // Updated

        initMobileArsenalAccordion();

        initResumeModal();
        initWorldClock();
        initDbRankingWidget();

        // Initialize new features
        initThemeToggle();
        initTerminalSimulation();
        initDagVisualizer();

        const projectsBtn = document.getElementById('projects-show-more');
        if (projectsBtn) {
            projectsBtn.addEventListener('click', () => window.loadMoreProjects());
        }

        const booksBtn = document.getElementById('books-see-all');
        if (booksBtn) {
            booksBtn.addEventListener('click', () => window.showAllBooks());
        }

        // Mobile defaults: reduce visible items
        if (isMobileViewport()) {
            projectsVisibleCount = 3;
        }

        window.filterByKeyword = (keyword) => {
            renderProjects(cachedRepos, keyword);
            const el = document.getElementById('projects');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        document.addEventListener('keyword:click', (e) => {
            if (!e || !e.detail) return;
            window.filterByKeyword(e.detail);
        });

        // Hero Parallax
        const heroCard = document.getElementById('hero-card');
        document.addEventListener('mousemove', (e) => {
            if (document.body.classList.contains('low-power')) return;
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;
            if (heroCard) heroCard.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    // === THEME TOGGLE ===
    const THEME_KEY = 'portfolio-theme';

    function getStoredTheme() {
        return localStorage.getItem(THEME_KEY) || 'dark';
    }

    function setStoredTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const moonIcon = document.getElementById('theme-icon-moon');
        const sunIcon = document.getElementById('theme-icon-sun');
        if (moonIcon && sunIcon) {
            moonIcon.classList.toggle('hidden', theme === 'light');
            sunIcon.classList.toggle('hidden', theme === 'dark');
        }
    }

    function initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        // Apply stored theme on load
        const storedTheme = getStoredTheme();
        applyTheme(storedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            setStoredTheme(newTheme);
        });
    }

    // === TERMINAL SIMULATION ===
    function initTerminalSimulation() {
        const terminalContent = document.getElementById('terminal-content');
        const terminalInput = document.getElementById('terminal-input');
        const replayBtn = document.getElementById('terminal-replay');
        const pauseBtn = document.getElementById('terminal-pause');

        if (!terminalContent || !terminalInput) return;

        const sequences = [
            { text: "⚡ user@kbtu:~$ ./init.sh", delay: 500, class: "cyan" },
            { text: "🔥 Initializing Data Engineer...", delay: 800, class: "warning" },
            { text: "🧠 Loading ML Models...", delay: 600, class: "info" },
            { text: "✅ Spark cluster connected (3 nodes)", delay: 400, class: "success" },
            { text: "✅ Airflow DAGs loaded (12 pipelines)", delay: 300, class: "success" },
            { text: "✅ PostgreSQL pool ready (20 connections)", delay: 300, class: "success" },
            { text: "🐘 Kafka brokers: 3/3 healthy", delay: 500, class: "info" },
            { text: "📊 Data quality checks: PASSED", delay: 400, class: "success" },
            { text: "🚀 Deploying FastAPI services...", delay: 600, class: "warning" },
            { text: "✅ All systems operational", delay: 300, class: "success" },
            { text: "💻 System Ready! Welcome.", delay: 500, class: "purple" },
            { text: "", delay: 200 },
            { text: "💡 Tip: Data systems are like banking systems:", delay: 300, class: "info" },
            { text: "    correctness first, fast second.", delay: 200, class: "info" }
        ];

        let isPaused = false;
        let currentSequence = 0;
        let typingTimeout = null;
        let isTyping = false;

        function clearTerminal() {
            terminalContent.innerHTML = '';
            terminalInput.textContent = '';
            currentSequence = 0;
        }

        function addLine(text, className = '') {
            const line = document.createElement('span');
            line.className = `line ${className}`;
            line.textContent = text;
            terminalContent.appendChild(line);
            terminalContent.scrollTop = terminalContent.scrollHeight;
        }

        function typeText(text, callback, charDelay = 30) {
            isTyping = true;
            let charIndex = 0;
            terminalInput.textContent = '';

            function typeChar() {
                if (isPaused) {
                    typingTimeout = setTimeout(typeChar, 100);
                    return;
                }

                if (charIndex < text.length) {
                    terminalInput.textContent += text[charIndex];
                    charIndex++;
                    typingTimeout = setTimeout(typeChar, charDelay);
                } else {
                    isTyping = false;
                    if (callback) callback();
                }
            }

            typeChar();
        }

        function runSequence() {
            if (currentSequence >= sequences.length) {
                terminalInput.textContent = '';
                return;
            }

            if (isPaused) {
                typingTimeout = setTimeout(runSequence, 100);
                return;
            }

            const seq = sequences[currentSequence];
            currentSequence++;

            if (seq.text === "") {
                addLine("");
                typingTimeout = setTimeout(runSequence, seq.delay);
            } else {
                typeText(seq.text, () => {
                    addLine(seq.text, seq.class);
                    terminalInput.textContent = '';
                    typingTimeout = setTimeout(runSequence, seq.delay);
                });
            }
        }

        function startSequence() {
            clearTerminal();
            currentSequence = 0;
            isPaused = false;
            if (pauseBtn) pauseBtn.textContent = 'Pause';
            runSequence();
        }

        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                clearTimeout(typingTimeout);
                startSequence();
            });
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                isPaused = !isPaused;
                pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
            });
        }

        // Auto-start on load
        startSequence();
    }

    // === DATA PIPELINE VISUALIZER (DAG) ===
    function initDagVisualizer() {
        const container = document.getElementById('dag-canvas-container');
        const svg = document.getElementById('dag-svg');
        const nodesGroup = document.getElementById('dag-nodes');
        const edgesGroup = document.getElementById('dag-edges');
        const tooltip = document.getElementById('dag-tooltip');
        const modeSelect = document.getElementById('dag-mode-select');
        const modeConnect = document.getElementById('dag-mode-connect');
        const modeDelete = document.getElementById('dag-mode-delete');
        const btnAddSource = document.getElementById('dag-add-source');
        const btnAddTransform = document.getElementById('dag-add-transform');
        const btnAddDestination = document.getElementById('dag-add-destination');
        const btnClear = document.getElementById('dag-clear');

        if (!container || !svg || !nodesGroup || !edgesGroup) return;

        let mode = 'select'; // select, connect, delete
        let nodes = [];
        let edges = [];
        let selectedNode = null;
        let connectSource = null;
        let isDragging = false;
        let dragNode = null;
        let dragOffset = { x: 0, y: 0 };
        let nodeIdCounter = 1;

        // Initialize with sample pipeline
        function initSamplePipeline() {
            nodes = [
                { id: 1, x: 80, y: 225, type: 'source', label: 'Kafka', icon: '⬡', iconType: 'symbol' },
                { id: 2, x: 280, y: 150, type: 'transform', label: 'Spark', icon: 'S', iconType: 'letter' },
                { id: 3, x: 280, y: 300, type: 'transform', label: 'Cleanse', icon: 'C', iconType: 'letter' },
                { id: 4, x: 480, y: 225, type: 'destination', label: 'Postgres', icon: '🐘', iconType: 'symbol' }
            ];
            edges = [
                { from: 1, to: 2 },
                { from: 1, to: 3 },
                { from: 2, to: 4 },
                { from: 3, to: 4 }
            ];
            nodeIdCounter = 5;
            render();
        }

        function setMode(newMode) {
            mode = newMode;
            selectedNode = null;
            connectSource = null;
            
            // Update button styles - remove active from all, add to current
            [modeSelect, modeConnect, modeDelete].forEach(btn => {
                if (btn) {
                    btn.classList.remove('active', 'bg-white/20', 'text-cyan-300');
                    btn.classList.add('text-gray-300');
                }
            });
            
            const activeBtn = mode === 'select' ? modeSelect : mode === 'connect' ? modeConnect : modeDelete;
            if (activeBtn) {
                activeBtn.classList.add('active', 'bg-white/20', 'text-cyan-300');
                activeBtn.classList.remove('text-gray-300');
            }
            
            // Update cursor based on mode
            if (svg) {
                svg.classList.remove('cursor-crosshair', 'cursor-not-allowed');
                if (mode === 'connect') svg.classList.add('cursor-crosshair');
                else if (mode === 'delete') svg.classList.add('cursor-not-allowed');
            }
            
            render();
        }

        if (modeSelect) modeSelect.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); setMode('select'); });
        if (modeConnect) modeConnect.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); setMode('connect'); });
        if (modeDelete) modeDelete.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); setMode('delete'); });

        function getSVGPoint(evt) {
            const pt = svg.createSVGPoint();
            pt.x = evt.clientX;
            pt.y = evt.clientY;
            return pt.matrixTransform(svg.getScreenCTM().inverse());
        }

        function createNode(type, x, y) {
            const id = nodeIdCounter++;
            
            // Expanded tool library with icons/symbols
            const tools = {
                source: [
                    { label: 'Kafka', icon: '⬡', iconType: 'symbol' },
                    { label: 'Kinesis', icon: '≈', iconType: 'symbol' },
                    { label: 'Pub/Sub', icon: '◎', iconType: 'symbol' },
                    { label: 'Event Hubs', icon: '⎈', iconType: 'symbol' },
                    { label: 'RabbitMQ', icon: '🐇', iconType: 'symbol' },
                    { label: 'API', icon: 'A', iconType: 'letter' },
                    { label: 'S3', icon: '☁', iconType: 'symbol' },
                    { label: 'GCS', icon: '☁', iconType: 'symbol' },
                    { label: 'Azure Blob', icon: '⬢', iconType: 'symbol' },
                    { label: 'MySQL', icon: '🐬', iconType: 'symbol' },
                    { label: 'SQL Server', icon: '🟦', iconType: 'symbol' },
                    { label: 'MongoDB', icon: '🍃', iconType: 'symbol' },
                    { label: 'Redis', icon: '🟥', iconType: 'symbol' },
                    { label: 'Logs', icon: '📄', iconType: 'symbol' },
                    { label: 'CDC', icon: '⏱', iconType: 'symbol' },
                    { label: 'Files', icon: '📁', iconType: 'symbol' },
                    { label: 'FTP/SFTP', icon: '⇄', iconType: 'symbol' },
                    { label: 'Sensor', icon: '📡', iconType: 'symbol' },
                    { label: 'ClickHouse', icon: '⚡', iconType: 'symbol' },
                    { label: 'IoT', icon: '🔗', iconType: 'symbol' }
                ],
                transform: [
                    { label: 'Spark', icon: 'S', iconType: 'letter' },
                    { label: 'ETL', icon: 'E', iconType: 'letter' },
                    { label: 'Cleanse', icon: 'C', iconType: 'letter' },
                    { label: 'Validate', icon: 'V', iconType: 'letter' },
                    { label: 'Enrich', icon: 'N', iconType: 'letter' },
                    { label: 'Join', icon: 'J', iconType: 'letter' },
                    { label: 'Filter', icon: 'F', iconType: 'letter' },
                    { label: 'Sort', icon: '⇅', iconType: 'symbol' },
                    { label: 'Group', icon: 'G', iconType: 'letter' },
                    { label: 'Window', icon: 'W', iconType: 'letter' },
                    { label: 'dbt', icon: '△', iconType: 'symbol' },
                    { label: 'Airflow', icon: '⟲', iconType: 'symbol' }
                ],
                destination: [
                    { label: 'Postgres', icon: '🐘', iconType: 'symbol' },
                    { label: 'Snowflake', icon: '❄', iconType: 'symbol' },
                    { label: 'BigQuery', icon: '🔍', iconType: 'symbol' },
                    { label: 'Redshift', icon: '▲', iconType: 'symbol' },
                    { label: 'Databricks', icon: '🧱', iconType: 'symbol' },
                    { label: 'Delta Lake', icon: 'Δ', iconType: 'symbol' },
                    { label: 'DWH', icon: 'D', iconType: 'letter' },
                    { label: 'Lake', icon: 'L', iconType: 'letter' },
                    { label: 'BI', icon: '📊', iconType: 'symbol' },
                    { label: 'Power BI', icon: '🟨', iconType: 'symbol' },
                    { label: 'Tableau', icon: '✶', iconType: 'symbol' },
                    { label: 'Looker', icon: '◔', iconType: 'symbol' },
                    { label: 'API', icon: '🔌', iconType: 'symbol' },
                    { label: 'Cache', icon: '⚡', iconType: 'symbol' },
                    { label: 'MinIO', icon: '🪣', iconType: 'symbol' },
                    { label: 'ClickHouse', icon: '⚡', iconType: 'symbol' },
                    { label: 'DuckDB', icon: '🦆', iconType: 'symbol' },
                    { label: 'Elasticsearch', icon: '🧲', iconType: 'symbol' },
                    { label: 'Grafana', icon: '📈', iconType: 'symbol' }
                ]
            };
            
            const typeTools = tools[type];
            const idx = Math.floor(Math.random() * typeTools.length);
            const tool = typeTools[idx];
            
            nodes.push({
                id,
                x,
                y,
                type,
                label: tool.label,
                icon: tool.icon,
                iconType: tool.iconType
            });
            render();
        }

        if (btnAddSource) btnAddSource.addEventListener('click', () => createNode('source', 100, 225));
        if (btnAddTransform) btnAddTransform.addEventListener('click', () => createNode('transform', 300, 225));
        if (btnAddDestination) btnAddDestination.addEventListener('click', () => createNode('destination', 500, 225));
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                nodes = [];
                edges = [];
                nodeIdCounter = 1;
                render();
            });
        }

        function deleteNode(nodeId) {
            nodes = nodes.filter(n => n.id !== nodeId);
            edges = edges.filter(e => e.from !== nodeId && e.to !== nodeId);
            render();
        }

        function render() {
            // Render nodes
            nodesGroup.innerHTML = '';
            nodes.forEach(node => {
                const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                g.classList.add('dag-node', `dag-node-${node.type}`);
                if (selectedNode === node.id) g.classList.add('selected');
                g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
                g.dataset.nodeId = node.id;

                // Node shape
                const shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                shape.setAttribute('x', -35);
                shape.setAttribute('y', -25);
                shape.setAttribute('width', 70);
                shape.setAttribute('height', 50);
                shape.setAttribute('rx', 8);
                shape.classList.add('dag-node-shape');
                g.appendChild(shape);

                // Icon
                const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                icon.textContent = node.icon;
                icon.setAttribute('y', -2);
                icon.classList.add('dag-node-icon');
                // Adjust font size for emoji vs letter icons
                if (node.iconType === 'symbol') {
                    icon.setAttribute('font-size', '16');
                } else {
                    icon.setAttribute('font-size', '14');
                }
                g.appendChild(icon);

                // Label
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.textContent = node.label;
                label.setAttribute('y', 16);
                label.classList.add('dag-node-label');
                g.appendChild(label);

                // Event handlers
                g.addEventListener('mousedown', (e) => handleNodeMouseDown(e, node));
                g.addEventListener('mouseenter', () => showTooltip(node));
                g.addEventListener('mouseleave', hideTooltip);

                nodesGroup.appendChild(g);
            });

            // Render edges
            edgesGroup.innerHTML = '';
            edges.forEach((edge, idx) => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const d = calculateEdgePath(fromNode, toNode);
                path.setAttribute('d', d);
                path.classList.add('dag-edge');
                path.addEventListener('click', () => {
                    if (mode === 'delete') {
                        edges.splice(idx, 1);
                        render();
                    }
                });
                edgesGroup.appendChild(path);
            });
        }

        function calculateEdgePath(from, to) {
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const midX = (from.x + to.x) / 2;
            return `M ${from.x + 35} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x - 35} ${to.y}`;
        }

        function handleNodeMouseDown(e, node) {
            e.stopPropagation();
            e.preventDefault();

            if (mode === 'delete') {
                deleteNode(node.id);
                return;
            }

            if (mode === 'connect') {
                if (!connectSource) {
                    connectSource = node.id;
                    selectedNode = node.id;
                    render();
                } else if (connectSource !== node.id) {
                    // Check if edge already exists
                    const exists = edges.some(e => e.from === connectSource && e.to === node.id);
                    if (!exists) {
                        edges.push({ from: connectSource, to: node.id });
                    }
                    connectSource = null;
                    selectedNode = null;
                    render();
                }
                return;
            }

            // Select mode - start drag
            isDragging = true;
            dragNode = node;
            selectedNode = node.id;
            const pt = getSVGPoint(e);
            dragOffset.x = pt.x - node.x;
            dragOffset.y = pt.y - node.y;
            render();
        }

        function showTooltip(node) {
            if (!tooltip) return;
            tooltip.textContent = `${node.type.toUpperCase()}: ${node.label}`;
            tooltip.classList.add('visible');
            const rect = container.getBoundingClientRect();
            tooltip.style.left = `${node.x}px`;
            tooltip.style.top = `${node.y - 40}px`;
        }

        function hideTooltip() {
            if (tooltip) tooltip.classList.remove('visible');
        }

        // Global mouse events
        svg.addEventListener('mousemove', (e) => {
            if (isDragging && dragNode) {
                const pt = getSVGPoint(e);
                dragNode.x = pt.x - dragOffset.x;
                dragNode.y = pt.y - dragOffset.y;
                // Constrain to current SVG viewport bounds (responsive)
                const halfW = 35;
                const halfH = 25;
                const maxX = Math.max(halfW, (svg.clientWidth || 600) - halfW);
                const maxY = Math.max(halfH, (svg.clientHeight || 450) - halfH);
                dragNode.x = Math.max(halfW, Math.min(maxX, dragNode.x));
                dragNode.y = Math.max(halfH, Math.min(maxY, dragNode.y));
                render();
            }
        });

        svg.addEventListener('mouseup', () => {
            isDragging = false;
            dragNode = null;
        });

        svg.addEventListener('mouseleave', () => {
            isDragging = false;
            dragNode = null;
        });

        svg.addEventListener('click', (e) => {
            if (e.target === svg) {
                selectedNode = null;
                connectSource = null;
                render();
            }
        });

        // Initialize
        setMode('select');
        initSamplePipeline();
    }
