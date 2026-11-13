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

// ── Seal greeting: "Hi!" bubble on every click ──
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

// ── Desktop: shrink type until the page fits one screen ──
(function () {
    var mq = window.matchMedia('(min-width: 1000px) and (min-height: 600px)');
    var root = document.documentElement;
    var cols = document.querySelector('.columns');
    if (!cols) return;
    var MIN = 12;

    function overflowing() {
        return cols.scrollHeight > cols.clientHeight + 1 ||
               cols.scrollWidth > cols.clientWidth + 1;
    }

    function fit() {
        root.style.fontSize = '';
        root.classList.remove('no-fit');
        if (!mq.matches) return;
        var size = parseFloat(getComputedStyle(root).fontSize);
        while (overflowing() && size > MIN) {
            size -= 0.5;
            root.style.fontSize = size + 'px';
        }
        if (overflowing()) {
            root.style.fontSize = '';
            root.classList.add('no-fit');
        }
    }

    var t;
    window.addEventListener('resize', function () {
        clearTimeout(t);
        t = setTimeout(fit, 100);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    fit();
})();
