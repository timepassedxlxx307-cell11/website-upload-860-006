(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
    forms.forEach(function (form) {
      var section = form.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
      var input = form.querySelector("[data-filter-input]");
      var year = form.querySelector("[data-year-filter]");
      var category = form.querySelector("[data-category-filter]");
      var clear = form.querySelector("[data-clear-filter]");
      var empty = section.querySelector("[data-empty-state]");

      function apply() {
        var query = normalize(input ? input.value : "");
        var yearValue = normalize(year ? year.value : "");
        var categoryValue = normalize(category ? category.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchYear = !yearValue || cardYear.indexOf(yearValue) !== -1;
          var matchCategory = !categoryValue || cardCategory === categoryValue;
          var show = matchQuery && matchYear && matchCategory;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });

      [input, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (category) {
            category.value = "";
          }
          apply();
        });
      }

      if (form.hasAttribute("data-query-from-url") && input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          input.value = q;
        }
      }

      apply();
    });
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = form.getAttribute("action") || "search.html";
        }
      });
    });
  }

  function setupVideoPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".video-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-overlay");
      var src = player.getAttribute("data-video-src");
      var hls = null;
      var started = false;

      if (!video || !src) {
        return;
      }

      function load() {
        if (started) {
          return;
        }
        started = true;
        if (button) {
          button.classList.add("is-hidden");
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function play() {
        load();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (!started) {
          play();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupVideoPlayers();
  });
})();
