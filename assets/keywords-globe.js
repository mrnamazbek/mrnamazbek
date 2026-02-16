    (function() {
        'use strict';

        /* ── Configuration ── */
        const CONFIG = {
            MAX_TAGS: 150,
            LOW_POWER_TAGS: 30,
            ROTATION_SPEED: 0.002,
            INERTIA_DAMPING: 0.95,
            TEXT_SCALE: 1,
            SPHERE_RADIUS: 200,
            REPULSE_RADIUS: 80,
            REPULSE_STRENGTH: 15,
            KEYWORD_URL: 'assets/keywords.json'
        };

        /* ── Category Colors (match CSS vars) ── */
        const COLORS = {
            data:     { hex: '#00d4ff', r: 0,   g: 212, b: 255 },
            software: { hex: '#a78bfa', r: 167, g: 139, b: 250 },
            infra:    { hex: '#34d399', r: 52,  g: 211, b: 153 },
            tooling:  { hex: '#fbbf24', r: 251, g: 191, b: 36  }
        };

        /* ── Inline Fallback Data ── */
        const FALLBACK_KEYWORDS = [
            { keyword:"ETL", category:"data", weight:0.95 },
            { keyword:"Apache Spark", category:"data", weight:0.92 },
            { keyword:"Kafka", category:"data", weight:0.90 },
            { keyword:"Airflow", category:"data", weight:0.88 },
            { keyword:"PostgreSQL", category:"data", weight:0.90 },
            { keyword:"Python", category:"software", weight:0.95 },
            { keyword:"FastAPI", category:"software", weight:0.85 },
            { keyword:"Docker", category:"infra", weight:0.92 },
            { keyword:"Kubernetes", category:"infra", weight:0.80 },
            { keyword:"Git", category:"infra", weight:0.88 },
            { keyword:"Pandas", category:"tooling", weight:0.90 },
            { keyword:"Scikit-learn", category:"tooling", weight:0.85 },
            { keyword:"TensorFlow", category:"tooling", weight:0.82 },
            { keyword:"SQL Optimization", category:"data", weight:0.88 },
            { keyword:"Data Pipeline", category:"data", weight:0.90 },
            { keyword:"Go", category:"software", weight:0.78 },
            { keyword:"Java", category:"software", weight:0.80 },
            { keyword:"CI/CD", category:"infra", weight:0.85 },
            { keyword:"Linux", category:"infra", weight:0.85 },
            { keyword:"PyTorch", category:"tooling", weight:0.80 },
            { keyword:"Hadoop", category:"data", weight:0.82 },
            { keyword:"Redis", category:"software", weight:0.74 },
            { keyword:"Stream Processing", category:"data", weight:0.80 },
            { keyword:"REST API", category:"software", weight:0.82 },
            { keyword:"Data Warehouse", category:"data", weight:0.85 },
            { keyword:"Microservices", category:"software", weight:0.76 },
            { keyword:"NumPy", category:"tooling", weight:0.85 },
            { keyword:"dbt", category:"data", weight:0.76 },
            { keyword:"AWS", category:"infra", weight:0.78 },
            { keyword:"Bash", category:"software", weight:0.72 }
        ];

        /* ── Detect low-power / reduced-motion ── */
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const lowMemory = (navigator.deviceMemory && navigator.deviceMemory < 2);
        const isMobileLow = /Mobi|Android/i.test(navigator.userAgent) && lowMemory;
        const useFallback = prefersReduced || isMobileLow;
        const maxTags = (useFallback || lowMemory) ? CONFIG.LOW_POWER_TAGS : CONFIG.MAX_TAGS;

        /* ── State ── */
        let keywords = [];
        let tags3D = [];       // { keyword, category, weight, phi, theta, x, y, z, sx, sy, scale, canvas, opacity }
        let paused = false;
        let rotX = 0, rotY = 0;
        let dragStartX = 0, dragStartY = 0, dragging = false;
        let velX = 0, velY = 0;
        let mouseCanvasX = -9999, mouseCanvasY = -9999;
        let hoveredIndex = -1;
        let focusedIndex = -1;
        let animId = null;
        let globeCanvas, ctx, tooltip, container;

        /* ── Helpers ── */
        function fibonacciSphere(n) {
            // Returns array of {phi, theta} evenly distributed on sphere
            const pts = [];
            const goldenAngle = Math.PI * (3 - Math.sqrt(5));
            for (let i = 0; i < n; i++) {
                const y = 1 - (i / (n - 1)) * 2; // -1..1
                const radiusAtY = Math.sqrt(1 - y * y);
                const theta = goldenAngle * i;
                const phi = Math.acos(y);
                pts.push({ phi, theta });
            }
            return pts;
        }

        function catColor(cat) { return COLORS[cat] || COLORS.data; }

        /* Create a small canvas texture for a keyword label */
        const textCanvasCache = new Map();
        function makeTextCanvas(keyword, category, weight) {
            const key = keyword + '|' + category;
            if (textCanvasCache.has(key)) return textCanvasCache.get(key);

            const scale = CONFIG.TEXT_SCALE;
            const fontSize = Math.round((14 + weight * 14) * scale);
            const c = document.createElement('canvas');
            const cx = c.getContext('2d');
            cx.font = `600 ${fontSize}px Inter, sans-serif`;
            const met = cx.measureText(keyword);
            const padX = 18 * scale, padY = 10 * scale;
            c.width = Math.ceil(met.width + padX * 2);
            c.height = Math.ceil(fontSize + padY * 2);

            // Badge background
            cx.fillStyle = 'rgba(15,15,20,0.65)';
            const r = c.height / 2;
            cx.beginPath();
            cx.moveTo(r, 0);
            cx.lineTo(c.width - r, 0);
            cx.arc(c.width - r, r, r, -Math.PI/2, Math.PI/2);
            cx.lineTo(r, c.height);
            cx.arc(r, r, r, Math.PI/2, -Math.PI/2);
            cx.closePath();
            cx.fill();

            // Border
            cx.strokeStyle = catColor(category).hex + '44';
            cx.lineWidth = 1;
            cx.stroke();

            // Text
            cx.font = `600 ${fontSize}px Inter, sans-serif`;
            cx.fillStyle = catColor(category).hex;
            cx.textAlign = 'center';
            cx.textBaseline = 'middle';
            cx.fillText(keyword, c.width / 2, c.height / 2 + 1);

            textCanvasCache.set(key, c);
            return c;
        }

        /* ── Build Tags ── */
        function buildTags(data) {
            const pts = fibonacciSphere(data.length);
            tags3D = data.map((kw, i) => {
                const { phi, theta } = pts[i];
                return {
                    keyword: kw.keyword,
                    category: kw.category || 'data',
                    weight: kw.weight || 0.5,
                    link: kw.link || '#',
                    aliases: kw.aliases || [],
                    phi, theta,
                    x: 0, y: 0, z: 0,
                    sx: 0, sy: 0,
                    scale: 1,
                    opacity: 1,
                    canvas: makeTextCanvas(kw.keyword, kw.category, kw.weight)
                };
            });
        }

        /* ── Project ── */
        function project(tag, cw, ch) {
            const R = CONFIG.SPHERE_RADIUS * Math.min(cw, ch) / 600;
            const cosRx = Math.cos(rotX), sinRx = Math.sin(rotX);
            const cosRy = Math.cos(rotY), sinRy = Math.sin(rotY);

            const sp = Math.sin(tag.phi), cp = Math.cos(tag.phi);
            const st = Math.sin(tag.theta), ct = Math.cos(tag.theta);

            let x = R * sp * ct;
            let y = R * cp;
            let z = R * sp * st;

            // Rotate around Y
            let x2 = x * cosRy - z * sinRy;
            let z2 = x * sinRy + z * cosRy;
            // Rotate around X
            let y2 = y * cosRx - z2 * sinRx;
            let z3 = y * sinRx + z2 * cosRx;

            tag.x = x2; tag.y = y2; tag.z = z3;
            // Perspective
            const fov = 600;
            const s = fov / (fov + z3 + R);
            tag.sx = cw / 2 + x2 * s;
            tag.sy = ch / 2 + y2 * s;
            tag.scale = s;
            tag.opacity = 0.25 + 0.75 * ((z3 + R) / (2 * R));
        }

        /* ── Hit Test ── */
        function hitTest(mx, my) {
            // Check from front to back (highest z first since those are on top visually — but we sort back-to-front for drawing,
            // so we scan reversed sorted order for hit test)
            let best = -1, bestZ = -Infinity;
            for (let i = 0; i < tags3D.length; i++) {
                const t = tags3D[i];
                const hw = (t.canvas.width / 2) * t.scale;
                const hh = (t.canvas.height / 2) * t.scale;
                if (mx >= t.sx - hw && mx <= t.sx + hw && my >= t.sy - hh && my <= t.sy + hh) {
                    if (t.z > bestZ) { bestZ = t.z; best = i; }
                }
            }
            return best;
        }

        /* ── Draw ── */
        function draw() {
            const cw = globeCanvas.width, ch = globeCanvas.height;
            ctx.clearRect(0, 0, cw, ch);

            // Update positions
            tags3D.forEach(t => project(t, cw, ch));

            // Sort back to front (low z drawn first)
            const sorted = tags3D.map((t, i) => i).sort((a, b) => tags3D[a].z - tags3D[b].z);

            sorted.forEach(i => {
                const t = tags3D[i];
                const w = t.canvas.width * t.scale;
                const h = t.canvas.height * t.scale;

                // Repulse from cursor
                let ox = 0, oy = 0;
                const dx = t.sx - mouseCanvasX, dy = t.sy - mouseCanvasY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.REPULSE_RADIUS && dist > 0) {
                    const force = (1 - dist / CONFIG.REPULSE_RADIUS) * CONFIG.REPULSE_STRENGTH;
                    ox = (dx / dist) * force;
                    oy = (dy / dist) * force;
                }

                ctx.save();
                ctx.globalAlpha = t.opacity;

                // Highlight hovered/focused
                if (i === hoveredIndex || i === focusedIndex) {
                    ctx.globalAlpha = 1;
                    ctx.shadowColor = catColor(t.category).hex;
                    ctx.shadowBlur = 18;
                }

                ctx.drawImage(
                    t.canvas,
                    t.sx - w / 2 + ox,
                    t.sy - h / 2 + oy,
                    w, h
                );
                ctx.restore();
            });
        }

        /* ── Animation Loop ── */
        function animate() {
            if (paused) { animId = requestAnimationFrame(animate); return; }

            if (!dragging) {
                velX *= CONFIG.INERTIA_DAMPING;
                velY *= CONFIG.INERTIA_DAMPING;
                rotY += velX + CONFIG.ROTATION_SPEED;
                rotX += velY;
            } else {
                rotY += velX;
                rotX += velY;
            }
            // Clamp X rotation
            rotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotX));

            draw();
            animId = requestAnimationFrame(animate);
        }

        /* ── Resize ── */
        function resize() {
            const rect = container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            globeCanvas.width = rect.width * dpr;
            globeCanvas.height = rect.height * dpr;
            globeCanvas.style.width = rect.width + 'px';
            globeCanvas.style.height = rect.height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        /* ── Tooltip ── */
        function showTooltip(tag, x, y) {
            tooltip.querySelector('.tt-keyword').textContent = tag.keyword;
            const cat = tooltip.querySelector('.tt-category');
            cat.textContent = tag.category;
            const c = catColor(tag.category);
            cat.style.background = c.hex + '33';
            cat.style.color = c.hex;
            tooltip.style.left = (x + 16) + 'px';
            tooltip.style.top = (y - 12) + 'px';
            tooltip.classList.add('visible');
        }
        function hideTooltip() { tooltip.classList.remove('visible'); }

        /* ── Fire Keyword Click ── */
        function fireKeywordClick(tag) {
            document.dispatchEvent(new CustomEvent('keyword:click', { detail: tag.keyword }));
            // Also call global hook if it exists
            if (typeof window.filterByKeyword === 'function') {
                window.filterByKeyword(tag.keyword);
            }
        }

        /* ── Pointer Events (throttled) ── */
        let pointerThrottle = 0;
        function onPointerMove(e) {
            const now = performance.now();
            if (now - pointerThrottle < 16) return; // ~60fps
            pointerThrottle = now;

            const rect = globeCanvas.getBoundingClientRect();
            mouseCanvasX = e.clientX - rect.left;
            mouseCanvasY = e.clientY - rect.top;

            if (dragging) {
                velX = (e.clientX - dragStartX) * 0.005;
                velY = (e.clientY - dragStartY) * 0.005;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                hideTooltip();
                hoveredIndex = -1;
                return;
            }

            const hit = hitTest(mouseCanvasX, mouseCanvasY);
            if (hit !== hoveredIndex) {
                hoveredIndex = hit;
                if (hit >= 0) {
                    showTooltip(tags3D[hit], mouseCanvasX, mouseCanvasY);
                    globeCanvas.style.cursor = 'pointer';
                    document.dispatchEvent(new CustomEvent('keyword:hover', { detail: tags3D[hit].keyword }));
                } else {
                    hideTooltip();
                    globeCanvas.style.cursor = 'grab';
                }
            } else if (hit >= 0) {
                // Update tooltip position
                tooltip.style.left = (mouseCanvasX + 16) + 'px';
                tooltip.style.top = (mouseCanvasY - 12) + 'px';
            }
        }

        function onPointerDown(e) {
            dragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            globeCanvas.style.cursor = 'grabbing';
        }

        function onPointerUp(e) {
            if (!dragging) return;
            dragging = false;
            globeCanvas.style.cursor = 'grab';
            // Detect click (minimal movement)
            const moved = Math.abs(velX) + Math.abs(velY);
            if (moved < 0.005) {
                const rect = globeCanvas.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                const hit = hitTest(mx, my);
                if (hit >= 0) fireKeywordClick(tags3D[hit]);
            }
        }

        /* ── Keyboard ── */
        function onKeyDown(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                // Sort front-to-back for tabbing (highest z = most visible first)
                const sortedIndices = tags3D.map((_, i) => i).sort((a, b) => tags3D[b].z - tags3D[a].z);
                const currentPos = sortedIndices.indexOf(focusedIndex);
                const next = e.shiftKey
                    ? (currentPos <= 0 ? sortedIndices.length - 1 : currentPos - 1)
                    : (currentPos + 1) % sortedIndices.length;
                focusedIndex = sortedIndices[next];
                hoveredIndex = focusedIndex;
                const t = tags3D[focusedIndex];
                showTooltip(t, t.sx, t.sy);
            }
            if (e.key === 'Enter' && focusedIndex >= 0) {
                fireKeywordClick(tags3D[focusedIndex]);
            }
            if (e.key === 'Escape') {
                focusedIndex = -1;
                hoveredIndex = -1;
                hideTooltip();
            }
        }

        /* ── Parallax Sync (subtle scroll/mouse) ── */
        function initParallaxSync() {
            let scrollTarget = 0;
            window.addEventListener('scroll', () => {
                scrollTarget = window.scrollY * 0.0002;
            }, { passive: true });
            // Apply very subtle X rotation shift from scroll
            (function syncLoop() {
                if (!paused) {
                    rotX += (scrollTarget - rotX * 0.01) * 0.01;
                }
                requestAnimationFrame(syncLoop);
            })();
        }

        /* ── 2D Fallback Cloud ── */
        function render2DFallback(data) {
            const fb = document.createElement('div');
            fb.className = 'globe-fallback-cloud';
            fb.setAttribute('role', 'list');
            fb.setAttribute('aria-label', 'Technology keywords');
            data.forEach(kw => {
                const span = document.createElement('button');
                span.className = 'globe-fallback-tag';
                span.textContent = kw.keyword;
                span.style.fontSize = (0.7 + kw.weight * 0.6) + 'rem';
                span.style.borderColor = catColor(kw.category).hex + '55';
                span.style.color = catColor(kw.category).hex;
                span.setAttribute('role', 'listitem');
                span.setAttribute('aria-label', kw.keyword + ', category: ' + kw.category);
                span.addEventListener('click', () => fireKeywordClick(kw));
                fb.appendChild(span);
            });
            // Replace canvas with fallback
            const canvasEl = document.getElementById('globe-canvas');
            if (canvasEl) canvasEl.style.display = 'none';
            container.appendChild(fb);
        }

        /* ── Screen Reader List ── */
        function buildSRList(data) {
            const ul = document.getElementById('globe-sr-list');
            if (!ul) return;
            data.forEach(kw => {
                const li = document.createElement('li');
                li.textContent = kw.keyword + ' (' + kw.category + ')';
                ul.appendChild(li);
            });
        }

        /* ── Public API ── */
        window.keywordsGlobe = {
            filter(keyword) {
                const kw = keyword.toLowerCase();
                tags3D.forEach((t, i) => {
                    const match = t.keyword.toLowerCase().includes(kw) ||
                                  (t.aliases && t.aliases.some(a => a.toLowerCase().includes(kw)));
                    t.opacity = match ? 1 : 0.08;
                });
                // Auto-restore after 3s
                setTimeout(() => { tags3D.forEach(t => t.opacity = 1); }, 3000);
            },
            pause() { paused = true; },
            resume() { paused = false; },
            enableLowQuality() {
                CONFIG.TEXT_SCALE = 0.7;
                CONFIG.REPULSE_STRENGTH = 0;
                textCanvasCache.clear();
                tags3D.forEach(t => {
                    t.canvas = makeTextCanvas(t.keyword, t.category, t.weight);
                });
            },
            destroy() {
                paused = true;
                if (animId) cancelAnimationFrame(animId);
                globeCanvas.removeEventListener('pointermove', onPointerMove);
                globeCanvas.removeEventListener('pointerdown', onPointerDown);
                window.removeEventListener('pointerup', onPointerUp);
                globeCanvas.removeEventListener('keydown', onKeyDown);
                window.removeEventListener('resize', resize);
            }
        };

        /* ── Init ── */
        async function initGlobe() {
            container = document.getElementById('globe-container');
            globeCanvas = document.getElementById('globe-canvas');
            tooltip = document.getElementById('globe-tooltip');
            if (!container || !globeCanvas) return;
            ctx = globeCanvas.getContext('2d');

            // Load data
            try {
                const res = await fetch(CONFIG.KEYWORD_URL);
                if (!res.ok) throw new Error('HTTP ' + res.status);
                keywords = await res.json();
            } catch (e) {
                console.warn('Keywords Globe: fetch failed, using fallback.', e);
                keywords = FALLBACK_KEYWORDS;
            }

            // Trim to max
            keywords = keywords.slice(0, maxTags);

            // Build SR list regardless
            buildSRList(keywords);

            // 2D fallback path
            if (useFallback) {
                render2DFallback(keywords);
                document.dispatchEvent(new CustomEvent('globe:ready'));
                return;
            }

            // 3D path
            resize();
            window.addEventListener('resize', resize);

            buildTags(keywords);

            // Events
            globeCanvas.addEventListener('pointermove', onPointerMove);
            globeCanvas.addEventListener('pointerdown', onPointerDown);
            window.addEventListener('pointerup', onPointerUp);
            globeCanvas.addEventListener('keydown', onKeyDown);
            // Touch support
            globeCanvas.addEventListener('touchstart', (e) => {
                const t = e.touches[0];
                onPointerDown({ clientX: t.clientX, clientY: t.clientY });
            }, { passive: true });
            globeCanvas.addEventListener('touchmove', (e) => {
                const t = e.touches[0];
                onPointerMove({ clientX: t.clientX, clientY: t.clientY });
            }, { passive: true });
            globeCanvas.addEventListener('touchend', (e) => {
                const t = e.changedTouches[0];
                onPointerUp({ clientX: t.clientX, clientY: t.clientY });
            });

            globeCanvas.addEventListener('mouseleave', () => {
                mouseCanvasX = -9999;
                mouseCanvasY = -9999;
                hoveredIndex = -1;
                hideTooltip();
            });

            initParallaxSync();
            animate();
            document.dispatchEvent(new CustomEvent('globe:ready'));
        }

        // Boot when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initGlobe);
        } else {
            initGlobe();
        }
    })();
