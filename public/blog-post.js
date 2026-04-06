// ── Dark / Light theme toggle ──
(function () {
    var toggle = document.querySelector('.theme-toggle');
    var stored = localStorage.getItem('theme');

    if (stored) {
        document.documentElement.setAttribute('data-theme', stored);
    }

    toggle.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
})();

// ── Mobile hamburger menu ──
(function () {
    var menuBtn = document.querySelector('.menu-toggle');
    var navLinks = document.querySelector('.nav-links');

    menuBtn.addEventListener('click', function () {
        var isOpen = navLinks.classList.toggle('open');
        menuBtn.classList.toggle('active');
        menuBtn.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('open');
            menuBtn.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
        });
    });
})();

// ── Blog post rendering ──
(function () {
    var params = new URLSearchParams(window.location.search);
    var postId = params.get('id');

    var headerContainer = document.querySelector('#post-header .container');
    var bodyContainer = document.querySelector('#post-body .container');

    function formatDate(dateStr) {
        var d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function categoryLabel(cat) {
        return cat === 'tech' ? 'Tech' : 'Personal Thoughts';
    }

    function renderContent(contentArr) {
        var html = '';
        contentArr.forEach(function (block) {
            if (block.charAt(0) === '<') {
                html += block;
            } else {
                html += '<p>' + block + '</p>';
            }
        });
        return html;
    }

    function showNotFound() {
        headerContainer.innerHTML = '';
        bodyContainer.innerHTML =
            '<div class="post-not-found">' +
                '<h2>Post not found</h2>' +
                '<p>The post you are looking for does not exist.</p>' +
                '<a href="blog.html">Back to Blog</a>' +
            '</div>';
    }

    function renderPost(post, allPosts) {
        document.title = post.title + ' - Duje Vukovac';

        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', post.excerpt);

        var ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', post.title + ' - Duje Vukovac');

        var ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', post.excerpt);

        // Header
        headerContainer.innerHTML =
            '<div class="post-page-meta">' +
                '<span class="post-category">' + categoryLabel(post.category) + '</span>' +
                '<span>' + formatDate(post.date) + '</span>' +
                '<span>' + post.readingTime + ' min read</span>' +
            '</div>' +
            '<h1>' + post.title + '</h1>' +
            '<div class="post-actions">' +
                '<button class="share-btn" id="share-btn">Share</button>' +
                '<span class="post-upvotes">' + post.upvotes + '</span>' +
            '</div>';

        // Body
        var bodyHTML = '<div class="post-body-content">' + renderContent(post.content) + '</div>';

        // Prev / Next navigation
        var sorted = allPosts.slice().sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        var currentIndex = -1;
        for (var i = 0; i < sorted.length; i++) {
            if (sorted[i].id === post.id) {
                currentIndex = i;
                break;
            }
        }

        var navHTML = '';
        var prevPost = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;
        var nextPost = currentIndex > 0 ? sorted[currentIndex - 1] : null;

        if (prevPost || nextPost) {
            navHTML = '<nav class="post-nav" aria-label="Post navigation">';
            if (prevPost) {
                navHTML +=
                    '<a href="blog-post.html?id=' + encodeURIComponent(prevPost.id) + '">' +
                        '<span class="nav-label">Previous</span>' +
                        '<span class="nav-title">' + prevPost.title + '</span>' +
                    '</a>';
            } else {
                navHTML += '<span></span>';
            }
            if (nextPost) {
                navHTML +=
                    '<a href="blog-post.html?id=' + encodeURIComponent(nextPost.id) + '" class="next-post">' +
                        '<span class="nav-label">Next</span>' +
                        '<span class="nav-title">' + nextPost.title + '</span>' +
                    '</a>';
            }
            navHTML += '</nav>';
        }

        var backHTML = '<a href="blog.html" class="back-link back-link-bottom">&larr; Back to Blog</a>';
        bodyContainer.innerHTML = bodyHTML + navHTML + backHTML;

        // Share button
        var shareBtn = document.getElementById('share-btn');
        shareBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(window.location.href).then(function () {
                shareBtn.textContent = 'Copied!';
                setTimeout(function () {
                    shareBtn.textContent = 'Share';
                }, 2000);
            });
        });
    }

    if (!postId) {
        showNotFound();
        return;
    }

    fetch('data/posts.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            var post = null;
            for (var i = 0; i < data.posts.length; i++) {
                if (data.posts[i].id === postId) {
                    post = data.posts[i];
                    break;
                }
            }

            if (!post) {
                showNotFound();
                return;
            }

            renderPost(post, data.posts);
        })
        .catch(function () {
            showNotFound();
        });
})();
