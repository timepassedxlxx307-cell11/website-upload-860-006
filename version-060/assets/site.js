(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var sliders = document.querySelectorAll('[data-slider]');

    sliders.forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
        var prev = slider.querySelector('[data-slide-prev]');
        var next = slider.querySelector('[data-slide-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide-dot')) || 0);
                restart();
            });
        });

        show(0);
        restart();
    });

    var searchInput = document.querySelector('[data-role="site-search"]');
    var yearFilter = document.querySelector('[data-role="year-filter"]');
    var regionFilter = document.querySelector('[data-role="region-filter"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        var query = normalize(searchInput ? searchInput.value : '');
        var year = yearFilter ? yearFilter.value : '';
        var region = regionFilter ? regionFilter.value : '';
        var shown = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardYear = card.getAttribute('data-year') || '';
            var cardRegion = card.getAttribute('data-region') || '';
            var matched = true;

            if (query && text.indexOf(query) === -1) {
                matched = false;
            }

            if (year && cardYear !== year) {
                matched = false;
            }

            if (region && cardRegion !== region) {
                matched = false;
            }

            card.style.display = matched ? '' : 'none';

            if (matched) {
                shown += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', shown === 0);
        }
    }

    if (searchInput) {
        var initialQuery = getQueryValue('q');

        if (initialQuery) {
            searchInput.value = initialQuery;
        }

        searchInput.addEventListener('input', applyFilters);
        applyFilters();
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }

    if (regionFilter) {
        regionFilter.addEventListener('change', applyFilters);
    }
})();
