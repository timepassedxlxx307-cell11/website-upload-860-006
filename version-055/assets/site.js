(() => {
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initializeMobileMenu() {
        const button = $('[data-menu-toggle]');
        const menu = $('[data-mobile-nav]');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', () => {
            menu.classList.toggle('is-open');
        });
    }

    function initializeHeroSlider() {
        const slider = $('[data-hero-slider]');

        if (!slider) {
            return;
        }

        const slides = $$('[data-hero-slide]', slider);
        const dots = $$('[data-hero-dot]', slider);
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(() => show(index + 1), 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                show(Number(dot.dataset.heroDot || '0'));
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);

        if (slides.length > 1) {
            start();
        }
    }

    function initializeImageFallbacks() {
        $$('img').forEach((image) => {
            image.addEventListener('error', () => {
                image.classList.add('is-missing');
                image.setAttribute('aria-hidden', 'true');
            }, { once: true });
        });
    }

    function initializeFilters() {
        const panel = $('[data-filter-panel]');
        const list = $('[data-card-list]');

        if (!panel || !list) {
            return;
        }

        const cards = $$('[data-movie-card]', list);
        const searchInput = $('[data-filter-search]', panel);
        const typeSelect = $('[data-filter-type]', panel);
        const yearSelect = $('[data-filter-year]', panel);
        const categorySelect = $('[data-filter-category]', panel);
        const clearButton = $('[data-clear-filter]', panel);
        const count = $('[data-filter-count]', panel);
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';

        if (searchInput && query) {
            searchInput.value = query;
        }

        function matchYear(cardYear, selectedYear) {
            if (!selectedYear) {
                return true;
            }

            const numericYear = Number(cardYear.replace(/\D/g, '').slice(0, 4));

            if (selectedYear === '2021') {
                return numericYear > 0 && numericYear <= 2021;
            }

            return cardYear.includes(selectedYear);
        }

        function applyFilters() {
            const term = normalize(searchInput ? searchInput.value : '');
            const type = normalize(typeSelect ? typeSelect.value : '');
            const year = normalize(yearSelect ? yearSelect.value : '');
            const category = normalize(categorySelect ? categorySelect.value : '');
            let visible = 0;

            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.category,
                    card.dataset.tags,
                    card.textContent
                ].join(' '));

                const matchesTerm = !term || haystack.includes(term);
                const matchesType = !type || normalize(card.dataset.type).includes(type);
                const matchesYear = matchYear(normalize(card.dataset.year), year);
                const matchesCategory = !category || normalize(card.dataset.category) === category;
                const isVisible = matchesTerm && matchesType && matchesYear && matchesCategory;

                card.hidden = !isVisible;

                if (isVisible) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = `显示 ${visible} / ${cards.length}`;
            }
        }

        [searchInput, typeSelect, yearSelect, categorySelect].forEach((control) => {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                [searchInput, typeSelect, yearSelect, categorySelect].forEach((control) => {
                    if (control) {
                        control.value = '';
                    }
                });
                applyFilters();
            });
        }

        applyFilters();
    }

    document.addEventListener('DOMContentLoaded', () => {
        initializeMobileMenu();
        initializeHeroSlider();
        initializeImageFallbacks();
        initializeFilters();
    });
})();
