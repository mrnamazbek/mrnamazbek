// Small site updates: computed years of experience and the Telegram feed.

(function () {
    'use strict';

    // 1. Years of experience are computed from the first job, not hardcoded.
    //    When an earlier role is added to the CV, change data-career-start.
    var years = document.getElementById('stats-years');
    if (years) {
        var parts = years.dataset.careerStart.split('-');
        var start = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
        var diff = (Date.now() - start.getTime()) / (365.25 * 24 * 3600 * 1000);
        years.textContent = Math.floor(diff) + '+';
    }

    // 2. Telegram feed.
    var root = document.getElementById('tg-feed');
    if (!root) return;

    var CHANNEL = root.dataset.channel;
    var TOPICS = [
        { icon: '🤖', title: 'AI and LLM', text: 'What changed in models, tools and APIs, without the hype.' },
        { icon: '🗄️', title: 'Data Engineering', text: 'Pipelines, warehouses, Iceberg, Trino, dbt and Airflow in practice.' },
        { icon: '🐍', title: 'Python and Backend', text: 'Performance, architecture and engineering habits that scale.' }
    ];

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function fmtDate(iso) {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function postCard(post, index) {
        var card = el('a', 'tg-card');
        card.href = post.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.style.setProperty('--i', index);
        var meta = el('div', 'tg-card-meta');
        meta.appendChild(el('span', '', fmtDate(post.date)));
        if (post.views) meta.appendChild(el('span', '', post.views + ' views'));
        card.appendChild(meta);
        card.appendChild(el('p', 'tg-card-text', post.text));
        card.appendChild(el('span', 'tg-card-link', 'Read in Telegram'));
        return card;
    }

    function topicCard(topic, index) {
        var card = el('a', 'tg-card tg-card--topic');
        card.href = 'https://t.me/' + CHANNEL;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.style.setProperty('--i', index);
        card.appendChild(el('div', 'tg-card-icon', topic.icon));
        card.appendChild(el('h3', 'font-display font-bold text-lg', topic.title));
        card.appendChild(el('p', 'tg-card-text', topic.text));
        card.appendChild(el('span', 'tg-card-link', 'Subscribe'));
        return card;
    }

    function render(items, builder) {
        root.replaceChildren.apply(root, items.map(builder));
    }

    fetch('assets/telegram_posts.json', { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : { posts: [] }; })
        .catch(function () { return { posts: [] }; })
        .then(function (data) {
            var posts = (data.posts || []).slice(0, 6);
            if (posts.length) render(posts, postCard);
            else render(TOPICS, topicCard);
        });
})();
