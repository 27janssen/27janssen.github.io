window.addEventListener('load', function () {

    // ── Smooth scrolling (index.html only) ───────────────────────────────
    document.querySelectorAll('nav a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── Parallax (both pages) ─────────────────────────────────────────────
    var templeBg = document.querySelector('.temple-bg');
    var dotContainer = document.querySelector('.parallax-dots');
    var ticking = false;

    function updateParallax() {
        var scrolled = window.pageYOffset;
        if (templeBg) {
            templeBg.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)';
        }
        if (dotContainer) {
            dotContainer.style.setProperty('--parallax-offset', (scrolled * -0.15) + 'px');
        }
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });

    updateParallax();
});
