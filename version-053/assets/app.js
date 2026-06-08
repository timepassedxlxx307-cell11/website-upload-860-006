(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            var open = mobileMenu.classList.toggle('is-open');
            mobileMenu.hidden = !open;
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;
        var show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle('is-active', pos === current);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle('is-active', pos === current);
                dot.setAttribute('aria-current', pos === current ? 'true' : 'false');
            });
        };
        var start = function () {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        };
        var reset = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };
        dots.forEach(function (dot, pos) {
            dot.addEventListener('click', function () {
                show(pos);
                reset();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                reset();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                reset();
            });
        }
        show(0);
        start();
    }

    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var filterCards = function (value) {
        var words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
        var visible = 0;
        cards.forEach(function (card) {
            var target = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
            var matched = words.every(function (word) {
                return target.indexOf(word) !== -1;
            });
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.hidden = visible !== 0;
        }
    };
    if (inputs.length && cards.length) {
        inputs.forEach(function (input) {
            if (initial && !input.value) {
                input.value = initial;
            }
            input.addEventListener('input', function () {
                filterCards(input.value);
            });
        });
        filterCards(initial);
    }
})();
