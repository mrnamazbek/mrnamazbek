/**
 * Developer Lab Logic
 * 
 * Includes 4 interactive tools:
 * 1. Regex Playground
 * 2. Docker Compose Generator
 * 3. Live Tech Radar
 * 4. Cloud Cost Estimator
 */

document.addEventListener('DOMContentLoaded', () => {
    initRegexPlayground();
    initDockerGenerator();
    initTechRadar();
    initCostEstimator();
});

// ==========================================
// 1. REGEX PLAYGROUND
// ==========================================
function initRegexPlayground() {
    const inputPattern = document.getElementById('regex-input');
    const inputTestString = document.getElementById('regex-test-string');
    const overlay = document.getElementById('regex-highlight-overlay');
    const flagG = document.getElementById('regex-flag-g');
    const flagI = document.getElementById('regex-flag-i');
    const flagM = document.getElementById('regex-flag-m');
    const matchCount = document.getElementById('regex-match-count');
    const explanation = document.getElementById('regex-explanation');
    const presets = document.querySelectorAll('.regex-preset');

    const escapeHtml = (unsafe) => {
        return (unsafe || '').toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const updateRegex = () => {
        const patternStr = inputPattern.value;
        const testStr = inputTestString.value;

        let flags = "";
        if (flagG.checked) flags += "g";
        if (flagI.checked) flags += "i";
        if (flagM.checked) flags += "m";

        if (!patternStr) {
            overlay.innerHTML = escapeHtml(testStr);
            matchCount.textContent = "0 matches";
            explanation.innerHTML = "<span class='text-gray-400'>Enter a pattern to see explanation...</span>";
            return;
        }

        try {
            const regex = new RegExp(patternStr, flags);

            // Highlight
            if (testStr) {
                // To avoid breaking HTML, we need to carefully replace
                let highlighted = escapeHtml(testStr);

                // For proper highlighting we must match on the raw string and build HTML
                let match;
                let lastIdx = 0;
                let htmlParts = [];
                let count = 0;

                // if not global, we still want to simulate global to count and highlight all (or just 1 if user didn't select global)
                const searchRegex = new RegExp(patternStr, flags.includes('g') ? flags : flags + 'g');

                // We use replace to build the highlighted HTML safely
                let highlightedHtml = '';

                if (flags.includes('g') || true) { // We manually limit to 1 match if not global
                    const matches = [];
                    let tempMatch;
                    const r = new RegExp(patternStr, flags);
                    if (!r.global) {
                        tempMatch = r.exec(testStr);
                        if (tempMatch) matches.push(tempMatch);
                    } else {
                        while ((tempMatch = r.exec(testStr)) !== null) {
                            if (tempMatch[0] === '') {
                                r.lastIndex++; // prevent infinite loop for zero-length matches
                            }
                            matches.push(tempMatch);
                        }
                    }

                    count = matches.length;

                    let currIdx = 0;
                    matches.forEach(m => {
                        const start = m.index;
                        const end = start + m[0].length;
                        if (start >= currIdx) {
                            htmlParts.push(escapeHtml(testStr.substring(currIdx, start)));
                            htmlParts.push(`<span class="bg-cyan-500/30 text-cyan-200 rounded px-0.5 border-b border-cyan-400">${escapeHtml(m[0])}</span>`);
                            currIdx = end;
                        }
                    });
                    htmlParts.push(escapeHtml(testStr.substring(currIdx)));
                    highlightedHtml = htmlParts.join('');
                }

                overlay.innerHTML = highlightedHtml;
                matchCount.textContent = `${count} match${count !== 1 ? 'es' : ''}`;
            } else {
                overlay.innerHTML = '';
                matchCount.textContent = "0 matches";
            }

            // Explanation
            let expParts = [];
            if (patternStr.includes('^')) expParts.push("Starts with...");
            if (patternStr.includes('$')) expParts.push("Ends with...");
            if (patternStr.includes('\\d')) expParts.push("\\d: Matches digits (0-9)");
            if (patternStr.includes('\\w')) expParts.push("\\w: Matches word characters (a-z, A-Z, 0-9, _)");
            if (patternStr.includes('+')) expParts.push("+: Matches 1 or more of the preceding token");
            if (patternStr.includes('*')) expParts.push("*: Matches 0 or more of the preceding token");
            if (patternStr.includes('[')) expParts.push("[...]: Matches any character in the set");

            if (expParts.length > 0) {
                explanation.innerHTML = expParts.map(p => `<div>${p}</div>`).join('');
            } else {
                explanation.innerHTML = "<span class='text-gray-400'>Pattern is valid. Matches literal characters.</span>";
            }

            inputPattern.classList.remove('border-red-500', 'text-red-400');

        } catch (e) {
            overlay.innerHTML = escapeHtml(testStr);
            matchCount.textContent = "Invalid Regex";
            explanation.innerHTML = `<span class="text-red-400">${e.message}</span>`;
            inputPattern.classList.add('border-red-500', 'text-red-400');
        }
    };

    [inputPattern, inputTestString, flagG, flagI, flagM].forEach(el => {
        el.addEventListener('input', updateRegex);
        el.addEventListener('change', updateRegex);
    });

    // Scroll sync
    inputTestString.addEventListener('scroll', () => {
        overlay.scrollTop = inputTestString.scrollTop;
        overlay.scrollLeft = inputTestString.scrollLeft;
    });

    // Presets
    presets.forEach(btn => {
        btn.addEventListener('click', () => {
            inputPattern.value = btn.dataset.regex;
            updateRegex();
        });
    });

    // Init
    updateRegex();
}

// ==========================================
// 2. DOCKER COMPOSE GENERATOR
// ==========================================
function initDockerGenerator() {
    const dbType = document.getElementById('docker-db-type');
    const version = document.getElementById('docker-version');
    const port = document.getElementById('docker-port');
    const dbName = document.getElementById('docker-dbname');
    const user = document.getElementById('docker-user');
    const pass = document.getElementById('docker-pass');
    const output = document.getElementById('docker-output');

    const btnCopy = document.getElementById('docker-btn-copy');
    const btnDownload = document.getElementById('docker-btn-download');

    const generateYaml = () => {
        const type = dbType.value;
        const v = version.value || 'latest';
        const p = port.value || '5432';
        const d = dbName.value || 'mydb';
        const u = user.value || 'user';
        const pw = pass.value || 'password';

        let yaml = `version: '3.9'

services:
  ${type}:
    image: ${type}:${v}
    ports:
      - "${p}:${p}"
    restart: unless-stopped
    volumes:
      - ${type}_data:/var/lib/${type === 'postgres' ? 'postgresql/data' : type === 'mysql' ? 'mysql' : type === 'mongodb' ? 'mongodb' : 'redis/data'}
`;

        if (type === 'postgres') {
            yaml += `    environment:
      POSTGRES_USER: ${u}
      POSTGRES_PASSWORD: ${pw}
      POSTGRES_DB: ${d}
`;
        } else if (type === 'mysql') {
            yaml += `    environment:
      MYSQL_ROOT_PASSWORD: ${pw}
      MYSQL_USER: ${u}
      MYSQL_PASSWORD: ${pw}
      MYSQL_DATABASE: ${d}
`;
        } else if (type === 'mongodb') {
            yaml += `    environment:
      MONGO_INITDB_ROOT_USERNAME: ${u}
      MONGO_INITDB_ROOT_PASSWORD: ${pw}
      MONGO_INITDB_DATABASE: ${d}
`;
        }

        yaml += `
volumes:
  ${type}_data:`;

        output.textContent = yaml;
        return yaml;
    };

    [dbType, version, port, dbName, user, pass].forEach(el => {
        el.addEventListener('input', generateYaml);
        el.addEventListener('change', generateYaml);
    });

    btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(generateYaml()).then(() => {
            const original = btnCopy.textContent;
            btnCopy.textContent = 'Copied!';
            setTimeout(() => btnCopy.textContent = original, 2000);
        });
    });

    btnDownload.addEventListener('click', () => {
        const yaml = generateYaml();
        const blob = new Blob([yaml], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'docker-compose.yml';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Presets based on DB type
    dbType.addEventListener('change', () => {
        if (dbType.value === 'postgres') {
            version.value = '15';
            port.value = '5432';
        } else if (dbType.value === 'mysql') {
            version.value = '8.0';
            port.value = '3306';
        } else if (dbType.value === 'mongodb') {
            version.value = '6.0';
            port.value = '27017';
        } else if (dbType.value === 'redis') {
            version.value = '7.0';
            port.value = '6379';
        }
        generateYaml();
    });

    generateYaml();
}

// ==========================================
// 3. LIVE TECH RADAR
// ==========================================
async function initTechRadar() {
    const list = document.getElementById('radar-list');
    const loading = document.getElementById('radar-loading');
    const tabs = document.querySelectorAll('.radar-tab');
    const toggle = document.getElementById('radar-sort-toggle');

    let currentCategory = 'python';
    let currentSort = 'stars';
    let radarCache = {};

    const queries = {
        'python': 'language:python topic:python',
        'dataeng': 'topic:data-engineering OR topic:apache-spark OR topic:airflow',
        'devops': 'topic:devops OR topic:docker OR topic:kubernetes'
    };

    const fetchRadarData = async (category) => {
        if (radarCache[category]) return radarCache[category];

        const q = queries[category];
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=10`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Rate limit or error');
            const data = await res.json();
            const items = data.items.map(r => ({
                name: r.name,
                description: r.description,
                stars: r.stargazers_count,
                url: r.html_url,
                growth: Math.floor(Math.random() * 100) - 20 // mock growth %
            }));
            radarCache[category] = items;
            return items;
        } catch (err) {
            console.warn("Falling back to mock radar data", err);
            // Fallback mock
            return [
                { name: category + '-awesome', description: 'Awesome curation.', stars: 15000, growth: 12, url: '#' },
                { name: category + '-core', description: 'Core infrastructure library.', stars: 12400, growth: 45, url: '#' },
                { name: category + '-utils', description: 'Helpful utilities.', stars: 8000, growth: -5, url: '#' },
                { name: category + '-tools', description: 'CLI tools.', stars: 5200, growth: 8, url: '#' }
            ];
        }
    };

    const renderList = (items) => {
        let sorted = [...items];
        if (currentSort === 'stars') {
            sorted.sort((a, b) => b.stars - a.stars);
        } else {
            sorted.sort((a, b) => b.growth - a.growth);
        }

        list.innerHTML = sorted.map(item => `
            <a href="${item.url}" target="_blank" class="flex flex-col gap-1 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition group">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-cyan-50 group-hover:text-cyan-300 transition">${escapeHtmlString(item.name)}</span>
                    <div class="flex items-center gap-3 text-xs font-mono">
                        <span class="text-yellow-400 flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg> ${(item.stars / 1000).toFixed(1)}k</span>
                        <span class="${item.growth >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center gap-1">${item.growth >= 0 ? '↗' : '↘'} ${Math.abs(item.growth)}%</span>
                    </div>
                </div>
                <div class="text-xs text-gray-400 truncate">${escapeHtmlString(item.description || 'No description provided.')}</div>
            </a>
        `).join('');
    };

    const loadCategory = async (cat) => {
        list.classList.add('hidden');
        loading.classList.remove('hidden');

        const items = await fetchRadarData(cat);
        renderList(items);

        loading.classList.add('hidden');
        list.classList.remove('hidden');
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active', 'bg-white/10', 'border-white/20', 'text-white');
                t.classList.add('bg-white/5', 'text-gray-400');
            });
            tab.classList.remove('bg-white/5', 'text-gray-400');
            tab.classList.add('active', 'bg-white/10', 'border-white/20', 'text-white');

            currentCategory = tab.dataset.category;
            loadCategory(currentCategory);
        });
    });

    toggle.addEventListener('click', () => {
        if (currentSort === 'stars') {
            currentSort = 'growth';
            toggle.textContent = 'Sort: Growth';
        } else {
            currentSort = 'stars';
            toggle.textContent = 'Sort: Stars';
        }
        if (radarCache[currentCategory]) {
            renderList(radarCache[currentCategory]);
        }
    });

    // Init
    loadCategory(currentCategory);
}

const escapeHtmlString = (unsafe) => {
    return (unsafe || '').toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// ==========================================
// 4. CLOUD COST ESTIMATOR
// ==========================================
function initCostEstimator() {
    const inputCpu = document.getElementById('cost-input-cpu');
    const inputRam = document.getElementById('cost-input-ram');
    const inputStorage = document.getElementById('cost-input-storage');
    const inputRegion = document.getElementById('cost-input-region');

    const valCpu = document.getElementById('cost-val-cpu');
    const valRam = document.getElementById('cost-val-ram');
    const valStorage = document.getElementById('cost-val-storage');

    const barCpu = document.getElementById('cost-bar-cpu');
    const barRam = document.getElementById('cost-bar-ram');
    const barStorage = document.getElementById('cost-bar-storage');

    const textTotal = document.getElementById('cost-total');
    const warning = document.getElementById('cost-warning');
    const btnCurrency = document.getElementById('cost-currency-toggle');

    let isUSD = true;
    const KZT_RATE = 500;

    // Prices (approximate)
    const CPU_PRICE = 15; // per core / month
    const RAM_PRICE = 5;  // per GB / month
    const STORAGE_PRICE = 0.10; // per GB / month

    const calculate = () => {
        const cpu = parseInt(inputCpu.value);
        const ram = parseInt(inputRam.value);
        const storage = parseInt(inputStorage.value);
        const regionMultiplier = parseFloat(inputRegion.value);

        valCpu.textContent = cpu;
        valRam.textContent = ram;
        valStorage.textContent = storage;

        const costCpu = cpu * CPU_PRICE * regionMultiplier;
        const costRam = ram * RAM_PRICE * regionMultiplier;
        const costStorage = storage * STORAGE_PRICE * regionMultiplier;

        let total = costCpu + costRam + costStorage;

        // Progress bar breakdown
        const pctCpu = (costCpu / total) * 100;
        const pctRam = (costRam / total) * 100;
        const pctStorage = (costStorage / total) * 100;

        barCpu.style.width = `${pctCpu}%`;
        barRam.style.width = `${pctRam}%`;
        barStorage.style.width = `${pctStorage}%`;

        // Warnings
        if (total > 500) {
            warning.classList.remove('hidden');
        } else {
            warning.classList.add('hidden');
        }

        // Display Total
        if (!isUSD) {
            total = total * KZT_RATE;
        }

        animateValue(textTotal, total, isUSD);
    };

    let animationInitial = true;
    // Basic number animation
    const animateValue = (obj, target, usd) => {
        let current = parseFloat(obj.dataset.val || 0);
        let increment = (target - current) / 10;
        if (animationInitial) {
            obj.innerHTML = (usd ? '$' : '₸') + target.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            obj.dataset.val = target;
            animationInitial = false;
            return;
        }

        let stepTime = 20;
        let count = 0;
        let timer = setInterval(() => {
            current += increment;
            count++;
            if (count >= 10) {
                current = target;
                clearInterval(timer);
            }
            obj.innerHTML = (usd ? '$' : '₸') + current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            obj.dataset.val = current;
        }, stepTime);
    };

    [inputCpu, inputRam, inputStorage, inputRegion].forEach(el => {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
    });

    btnCurrency.addEventListener('click', () => {
        isUSD = !isUSD;
        btnCurrency.textContent = isUSD ? 'Switch to KZT' : 'Switch to USD';
        calculate();
    });

    calculate();
}
