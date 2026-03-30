// Theme toggle (same logic as main site)
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

// Mobile hamburger menu
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
