// ── Dark / Light theme toggle ──
(function () {
    var toggle = document.querySelector('.theme-toggle');
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    if (stored) document.documentElement.setAttribute('data-theme', stored);
    if (!toggle) return;

    toggle.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
    });
})();

// ── Seal greeting: smile + "Hi!" on every click ──
(function () {
    var seal = document.querySelector('.seal-button');
    if (!seal) return;
    var timer;

    seal.addEventListener('click', function () {
        seal.classList.remove('is-happy');
        void seal.offsetWidth; // restart the animation on repeat clicks
        seal.classList.add('is-happy');
        clearTimeout(timer);
        timer = setTimeout(function () {
            seal.classList.remove('is-happy');
        }, 1800);
    });
})();
