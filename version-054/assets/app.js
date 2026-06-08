(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
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

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".js-local-search"));
    var typeFilters = Array.prototype.slice.call(document.querySelectorAll(".js-local-type"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));

    function filterCards() {
      if (!cards.length) {
        return;
      }
      var query = normalize(searchInputs.map(function (input) {
        return input.value;
      }).join(" "));
      var selectedType = normalize(typeFilters.map(function (select) {
        return select.value;
      }).filter(Boolean).join(" "));
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-card-title"),
          card.getAttribute("data-card-text"),
          card.getAttribute("data-card-type"),
          card.getAttribute("data-card-year"),
          card.getAttribute("data-card-region")
        ].join(" "));
        var matchQuery = !query || haystack.indexOf(query) >= 0;
        var matchType = !selectedType || haystack.indexOf(selectedType) >= 0;
        var showCard = matchQuery && matchType;
        card.classList.toggle("is-filter-hidden", !showCard);
        if (showCard) {
          visible += 1;
        }
      });

      var grids = Array.prototype.slice.call(document.querySelectorAll("[data-card-grid]"));
      grids.forEach(function (grid) {
        var empty = grid.querySelector(".empty-state");
        if (!empty) {
          empty = document.createElement("div");
          empty.className = "empty-state";
          empty.textContent = "没有找到匹配的影片";
          grid.appendChild(empty);
        }
        empty.classList.toggle("is-filter-hidden", visible !== 0);
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", filterCards);
    });
    typeFilters.forEach(function (select) {
      select.addEventListener("change", filterCards);
    });
    filterCards();

    var searchResultBox = document.getElementById("search-results");
    if (searchResultBox && Array.isArray(window.MOVIE_INDEX)) {
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q") || "";
      var largeInput = document.getElementById("site-search-input");
      var heading = document.getElementById("search-heading");
      var subtitle = document.getElementById("search-subtitle");
      if (largeInput) {
        largeInput.value = queryValue;
      }

      function renderSearch(value) {
        var queryText = normalize(value);
        if (!queryText) {
          return;
        }
        var terms = queryText.split(/\s+/).filter(Boolean);
        var results = window.MOVIE_INDEX.filter(function (movie) {
          var haystack = normalize([
            movie.title,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            movie.tags,
            movie.oneLine,
            movie.category
          ].join(" "));
          return terms.every(function (term) {
            return haystack.indexOf(term) >= 0;
          });
        }).slice(0, 120);

        if (heading) {
          heading.textContent = "搜索结果";
        }
        if (subtitle) {
          subtitle.textContent = results.length ? "以下影片可直接进入详情页观看。" : "没有找到匹配的影片。";
        }
        if (!results.length) {
          searchResultBox.innerHTML = '<div class="empty-state">没有找到匹配的影片</div>';
          return;
        }
        searchResultBox.innerHTML = results.map(function (movie) {
          return '<article class="movie-card" data-card-title="' + escapeHtml(movie.title) + '" data-card-text="' + escapeHtml([movie.genre, movie.tags, movie.region, movie.year].join(" ")) + '">' +
            '<a class="poster-link" href="./' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
            '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-glow"></span><span class="poster-play">播放</span></a>' +
            '<div class="movie-card-body"><h3><a href="./' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p><div class="movie-tags"><span>' + escapeHtml(movie.category) + '</span></div></div></article>';
        }).join("");
      }

      function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
          }[char];
        });
      }

      renderSearch(queryValue);
    }
  });
})();
