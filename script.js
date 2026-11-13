// ── Dark / Light theme toggle ──
(function () {
    const toggle = document.querySelector('.theme-toggle');
    const stored = localStorage.getItem('theme');

    if (stored) {
        document.documentElement.setAttribute('data-theme', stored);
    }

    toggle.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
})();

// ── Mobile hamburger menu ──
(function () {
    const menuBtn = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuBtn.addEventListener('click', function () {
        const isOpen = navLinks.classList.toggle('open');
        menuBtn.classList.toggle('active');
        menuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('open');
            menuBtn.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
        });
    });
})();

// ── Smooth scroll for anchor links (fallback for older browsers) ──
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
