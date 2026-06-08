const body = document.body;
const menuButton = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => {
    mobileNav.classList.toggle("is-open");
    body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
  });
}

function initHero() {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  let index = 0;

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      slide.classList.toggle("is-active", current === index);
    });
    dots.forEach((dot, current) => {
      dot.classList.toggle("is-active", current === index);
    });
  }

  dots.forEach((dot, current) => {
    dot.addEventListener("click", () => show(current));
  });

  if (slides.length > 1) {
    window.setInterval(() => show(index + 1), 5600);
  }
}

function initFilters() {
  const panel = document.querySelector("[data-filter-panel]");
  const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
  if (!panel || !cards.length) {
    return;
  }

  const search = panel.querySelector("[data-filter-search]");
  const region = panel.querySelector("[data-filter-region]");
  const type = panel.querySelector("[data-filter-type]");
  const year = panel.querySelector("[data-filter-year]");
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");

  if (q && search) {
    search.value = q;
  }

  function match(card) {
    const query = search ? search.value.trim().toLowerCase() : "";
    const regionValue = region ? region.value : "";
    const typeValue = type ? type.value : "";
    const yearValue = year ? year.value : "";
    const text = [
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.dataset.genre
    ].join(" ").toLowerCase();

    return (!query || text.includes(query)) &&
      (!regionValue || card.dataset.region === regionValue) &&
      (!typeValue || card.dataset.type === typeValue) &&
      (!yearValue || card.dataset.year === yearValue);
  }

  function apply() {
    cards.forEach((card) => {
      card.hidden = !match(card);
    });
  }

  panel.addEventListener("input", apply);
  panel.addEventListener("change", apply);
  panel.addEventListener("reset", () => {
    window.setTimeout(apply, 0);
  });

  apply();
}

async function attachStream(video, stream) {
  if (video.dataset.ready === "yes") {
    return;
  }

  video.dataset.ready = "yes";

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = stream;
    return;
  }

  const module = await import("./hls.js");
  const Hls = module.H;

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(stream);
    hls.attachMedia(video);
    video._hls = hls;
  } else {
    video.src = stream;
  }
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll("[data-player]"));

  players.forEach((player) => {
    const video = player.querySelector("video");
    const overlay = player.querySelector(".player-overlay");
    if (!video || !overlay) {
      return;
    }

    const stream = video.getAttribute("data-play");

    async function start() {
      if (!stream) {
        return;
      }
      overlay.classList.add("is-hidden");
      await attachStream(video, stream);
      try {
        await video.play();
      } catch (error) {
        overlay.classList.remove("is-hidden");
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("play", () => overlay.classList.add("is-hidden"));
    video.addEventListener("pause", () => {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });
  });
}

initHero();
initFilters();
initPlayers();
