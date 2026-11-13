// ── Dark / Light theme toggle ──
(function () {
    var toggle = document.querySelector('.theme-toggle');
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}

    if (stored) {
        document.documentElement.setAttribute('data-theme', stored);
    }

    toggle.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
    });
})();

// ── Blog listing logic ──
(function () {
    var allPosts = [];
    var activeCategory = 'all';
    var searchQuery = '';

    var postsList = document.getElementById('posts-list');
    var noResults = document.getElementById('no-results');
    var searchInput = document.getElementById('search-input');
    var tabButtons = document.querySelectorAll('.tab-btn');

    function formatDate(dateStr) {
        var d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function categoryLabel(cat) {
        return cat === 'tech' ? 'Tech' : 'Personal Thoughts';
    }

    function renderPosts(posts) {
        postsList.innerHTML = '';

        if (posts.length === 0) {
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';

        posts.forEach(function (post) {
            var card = document.createElement('a');
            card.href = 'blog-post.html?id=' + encodeURIComponent(post.id);
            card.className = 'post-card';

            card.innerHTML =
                '<div class="post-meta">' +
                    '<span class="post-category">' + categoryLabel(post.category) + '</span>' +
                    '<span>' + formatDate(post.date) + '</span>' +
                '</div>' +
                '<h2>' + post.title + '</h2>' +
                '<p class="excerpt">' + post.excerpt + '</p>' +
                '<div class="post-footer">' +
                    '<span>' + post.readingTime + ' min read</span>' +
                '</div>';

            postsList.appendChild(card);
        });
    }

    function filterAndRender() {
        var filtered = allPosts.filter(function (post) {
            var matchesCategory = activeCategory === 'all' || post.category === activeCategory;
            if (!matchesCategory) return false;

            if (searchQuery.length === 0) return true;

            var q = searchQuery.toLowerCase();
            return post.title.toLowerCase().indexOf(q) !== -1 ||
                   post.excerpt.toLowerCase().indexOf(q) !== -1;
        });

        renderPosts(filtered);
    }

    // Search
    searchInput.addEventListener('input', function () {
        searchQuery = this.value.trim();
        filterAndRender();
    });

    // Tabs
    tabButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            tabButtons.forEach(function (b) {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            activeCategory = btn.getAttribute('data-category');
            filterAndRender();
        });
    });

    // Fetch posts
    fetch('data/posts.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            allPosts = data.posts.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });
            filterAndRender();
        })
        .catch(function () {
            postsList.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Failed to load posts.</p>';
        });
})();
