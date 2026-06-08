
const Hls = window.Hls;

const menuButton = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let current = 0;

  const showSlide = (next) => {
    if (!slides.length) return;
    current = (next + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === current);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });

  window.setInterval(() => showSlide(current + 1), 5000);
}

document.querySelectorAll('[data-rail]').forEach((section) => {
  const rail = section.querySelector('.movie-rail');
  const left = section.querySelector('[data-scroll-left]');
  const right = section.querySelector('[data-scroll-right]');

  if (!rail) return;

  if (left) {
    left.addEventListener('click', () => {
      rail.scrollBy({ left: -420, behavior: 'smooth' });
    });
  }

  if (right) {
    right.addEventListener('click', () => {
      rail.scrollBy({ left: 420, behavior: 'smooth' });
    });
  }
});

const siteSearch = document.querySelector('[data-site-search]');

if (siteSearch) {
  siteSearch.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = siteSearch.querySelector('input[name="q"]');
    const query = input ? input.value.trim() : '';
    const target = query ? `./movies.html?q=${encodeURIComponent(query)}` : './movies.html';
    window.location.href = target;
  });
}

const normalize = (value) => (value || '').toString().trim().toLowerCase();

const applyFilters = (root) => {
  const searchInput = root.querySelector('[data-search-input]');
  const filters = Array.from(root.querySelectorAll('[data-filter]'));
  const cards = Array.from(root.querySelectorAll('[data-card]'));
  const empty = root.querySelector('[data-empty]');
  const query = normalize(searchInput ? searchInput.value : '');
  const values = Object.fromEntries(filters.map((filter) => [filter.dataset.filter, normalize(filter.value)]));
  let visible = 0;

  cards.forEach((card) => {
    const haystack = normalize(`${card.dataset.title} ${card.dataset.tags} ${card.dataset.region} ${card.dataset.type} ${card.dataset.year}`);
    const matchesQuery = !query || haystack.includes(query);
    const matchesType = !values.type || normalize(card.dataset.type) === values.type;
    const matchesRegion = !values.region || normalize(card.dataset.region) === values.region;
    const matchesYear = !values.year || normalize(card.dataset.year) === values.year;
    const show = matchesQuery && matchesType && matchesRegion && matchesYear;
    card.style.display = show ? '' : 'none';
    if (show) visible += 1;
  });

  if (empty) {
    empty.classList.toggle('is-visible', visible === 0);
  }
};

document.querySelectorAll('[data-filter-root]').forEach((root) => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const searchInput = root.querySelector('[data-search-input]');

  if (q && searchInput) {
    searchInput.value = q;
  }

  root.querySelectorAll('[data-search-input], [data-filter]').forEach((control) => {
    control.addEventListener('input', () => applyFilters(root));
    control.addEventListener('change', () => applyFilters(root));
  });

  applyFilters(root);
});

const bindPlayer = () => {
  const player = document.querySelector('[data-player]');

  if (!player) return;

  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const stream = player.dataset.stream;
  let prepared = false;

  const prepare = () => {
    if (prepared || !video || !stream) return;
    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  };

  const start = () => {
    prepare();
    player.classList.add('is-playing');
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        player.classList.remove('is-playing');
      });
    }
  };

  if (button) {
    button.addEventListener('click', start);
  }

  player.addEventListener('click', (event) => {
    if (event.target === video) return;
    if (!player.classList.contains('is-playing')) {
      start();
    }
  });

  video.addEventListener('play', () => {
    player.classList.add('is-playing');
  });

  video.addEventListener('pause', () => {
    if (video.currentTime === 0 || video.ended) {
      player.classList.remove('is-playing');
    }
  });
};

bindPlayer();
