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

    function applyCompactMode(enabled) {
        document.body.classList.toggle('compact-mode', !!enabled);
        const btn = document.getElementById('compact-toggle');
        if (btn) btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');

        // When compact, also disable heavy canvases immediately
        if (enabled) {
            document.body.classList.add('low-power');
        }
    }

    window.enableCompactMode = function enableCompactMode() {
        localStorage.setItem('compactMode', '1');
        applyCompactMode(true);
    };

    window.disableCompactMode = function disableCompactMode() {
        localStorage.removeItem('compactMode');
        applyCompactMode(false);
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
        if (document.body.classList.contains('compact-mode')) return;
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
        if (document.body.classList.contains('compact-mode')) return;
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
        if (document.body.classList.contains('compact-mode')) return;
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
        if (document.body.classList.contains('compact-mode')) return;
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
        if (document.body.classList.contains('compact-mode')) return;
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
                                <div class="min-w-0">
                                    <div class="font-bold text-white/90 leading-snug truncate">${title}</div>
                                    <div class="text-xs text-gray-400 truncate">${author}</div>
                                </div>
                                <span class="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full border ${badge.cls}">${badge.text}</span>
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

        const compactSaved = localStorage.getItem('compactMode') === '1';
        if (compactSaved) applyCompactMode(true);

        const compactBtn = document.getElementById('compact-toggle');
        if (compactBtn) {
            compactBtn.addEventListener('click', () => {
                const enabled = document.body.classList.contains('compact-mode');
                if (enabled) window.disableCompactMode();
                else window.enableCompactMode();
            });
        }

        initShader();
        initCustomCursor();
        initParticles();
        initAntiGravityLogos();
        initScrollAnimations();
        loadContent(); // Updated

        initMobileArsenalAccordion();

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
