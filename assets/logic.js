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

    function initShader() {
        if (window.innerWidth < 768) return;
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
        const container = document.getElementById('anti-gravity-container');
        const icons = [
            'devicon-python-plain colored', 'devicon-java-plain colored', 'devicon-javascript-plain colored',
            'devicon-docker-plain colored', 'devicon-kubernetes-plain colored', 'devicon-apachekafka-original colored',
            'devicon-postgresql-plain colored', 'devicon-react-original colored', 'devicon-linux-plain colored',
            'devicon-git-plain colored', 'devicon-bash-plain colored', 'devicon-amazonwebservices-plain-wordmark colored'
        ];

        const logos = [];
        const count = 20;

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
        gsap.registerPlugin(ScrollTrigger);

        // Animate only section cards (exclude nav)
        const cards = gsap.utils.toArray('section .glass-card, #projects-grid .glass-card');
        cards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                delay: i % 3 * 0.1
            });
        });

        // Hero text animation
        gsap.from("#about h1, #about p", {
            y: 30, opacity: 0, duration: 1, stagger: 0.2, ease: "power2.out", delay: 0.5
        });
    }

    // === 6. DATA LOADING (HARDCODED) ===
    async function loadContent() {
        // Hardcoded Books Data
        const books = [
            {
                title: "Designing Data-Intensive Applications",
                author: "Martin Kleppmann",
                cover_url: "https://m.media-amazon.com/images/I/91cwOSS4sDL._AC_UF1000,1000_QL80_.jpg",
                alt_text: "Designing Data-Intensive Applications Book Cover"
            },
            {
                title: "Clean Code",
                author: "Robert C. Martin",
                cover_url: "https://m.media-amazon.com/images/I/41-sN-mzwKL.jpg",
                alt_text: "Clean Code Book Cover"
            },
            {
                title: "Data Mesh",
                author: "Zhamak Dehghani",
                cover_url: "https://m.media-amazon.com/images/I/91V0ofr3C-L._AC_UF1000,1000_QL80_.jpg",
                alt_text: "Data Mesh Book Cover"
            },
            {
                title: "The Pragmatic Programmer",
                author: "David Thomas",
                cover_url: "https://m.media-amazon.com/images/I/71VStSjZmpL._AC_UF1000,1000_QL80_.jpg",
                alt_text: "Pragmatic Programmer Book Cover"
            },
            {
                title: "Refactoring",
                author: "Martin Fowler",
                cover_url: "https://m.media-amazon.com/images/I/81HqVRRwp3L._AC_UF1000,1000_QL80_.jpg",
                alt_text: "Refactoring Book Cover"
            }
        ];

        const container = document.getElementById('books-container');
        if (container) {
            container.innerHTML = '';
            books.forEach(book => {
                const div = document.createElement('div');
                // Ensure consistent rounding (rounded-2xl matches glass-card radius)
                div.className = "flex-none w-[200px] group cursor-pointer hover:-translate-y-2 transition duration-300";
                div.innerHTML = `
                    <div class="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 shadow-lg border border-white/10">
                         <img src="${book.cover_url}" loading="lazy" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" alt="${book.alt_text}">
                    </div>
                    <h4 class="font-bold leading-tight text-white/90 text-sm">${book.title}</h4>
                    <p class="text-xs text-gray-500">${book.author}</p>
                `;
                container.appendChild(div);
            });
        }

        // Repo Tech Mapping (Extend with logic)
        const repoTechMap = {
            'ConnectIn': ['devicon-fastapi-plain colored', 'devicon-postgresql-plain colored', 'devicon-redis-plain colored', 'devicon-docker-plain colored'],
            'Antigravity': ['devicon-python-plain colored', 'devicon-tensorflow-original colored', 'devicon-react-original colored'],
            'DataPipeline-X': ['devicon-apachespark-original colored', 'devicon-apachekafka-original colored', 'devicon-aws-plain colored'],
            'mrnamazbek': ['devicon-github-original colored', 'devicon-markdown-original colored']
        };

        function getTechIcons(repo) {
            // 1. Check direct map
            if (repoTechMap[repo.name]) return repoTechMap[repo.name];

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

        // GitHub
        const grid = document.getElementById('projects-grid');
        try {
            const res = await fetch('https://api.github.com/users/mrnamazbek/repos?sort=updated&per_page=6');
            const repos = await res.json();
            if (repos.length) document.getElementById('stats-repos').innerText = repos.length + "+";

            grid.innerHTML = '';
            repos.forEach(repo => {
                const card = document.createElement('a');
                card.href = repo.html_url; card.target = "_blank";
                // Consistent rounding (rounded-2xl defined in CSS for glass-card is 16px, matching books now)
                card.className = "glass-card p-6 flex flex-col justify-between h-[240px] group";

                const techIcons = getTechIcons(repo);
                const iconsHtml = techIcons.map(icon => `<i class="${icon} text-xl"></i>`).join('');

                card.innerHTML = `
                    <div>
                         <div class="flex items-center gap-2 text-cyan-400 mb-3 text-xs font-mono uppercase tracking-wider">
                            <span class="w-2 h-2 rounded-full bg-cyan-400"></span> ${repo.language || 'Code'}
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
        } catch (e) {
            grid.innerHTML = '<div class="text-gray-500">GitHub API Limit Reached.</div>';
        }
    }

    // INIT
    window.addEventListener('DOMContentLoaded', () => {
        initShader();
        initCustomCursor(); // New
        initParticles();
        initAntiGravityLogos(); // New
        initScrollAnimations(); // New
        loadContent(); // Updated

        // Hero Parallax
        const heroCard = document.getElementById('hero-card');
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;
            if (heroCard) heroCard.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
