(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (slides.length > 0) {
      show(0);
      start();
    }
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var genre = scope.querySelector('[data-filter-genre]');
    var year = scope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var genreValue = genre ? genre.value : '';
      var yearValue = year ? year.value : '';

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cardGenre = card.getAttribute('data-genre') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var keywordMatched = !keyword || title.indexOf(keyword) > -1 || cardGenre.toLowerCase().indexOf(keyword) > -1 || cardRegion.indexOf(keyword) > -1;
        var genreMatched = !genreValue || cardGenre.indexOf(genreValue) > -1;
        var yearMatched = !yearValue || cardYear === yearValue;
        card.style.display = keywordMatched && genreMatched && yearMatched ? '' : 'none';
      });
    }

    [input, genre, year].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
  });

  var searchInput = document.querySelector('[data-global-search]');
  var searchResults = document.querySelector('[data-search-results]');

  if (searchInput && searchResults && Array.isArray(window.SEARCH_MOVIES)) {
    function renderSearch() {
      var keyword = searchInput.value.trim().toLowerCase();
      var list = window.SEARCH_MOVIES.filter(function (movie) {
        if (!keyword) {
          return false;
        }
        return movie.title.toLowerCase().indexOf(keyword) > -1 ||
          movie.genre.toLowerCase().indexOf(keyword) > -1 ||
          movie.region.toLowerCase().indexOf(keyword) > -1 ||
          movie.year.toLowerCase().indexOf(keyword) > -1;
      }).slice(0, 80);

      searchResults.innerHTML = list.map(function (movie) {
        return '<a class="search-result-row" href="' + movie.href + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
          '<span><h3>' + escapeHtml(movie.title) + '</h3><p>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</p><p>' + escapeHtml(movie.oneLine) + '</p></span>' +
          '</a>';
      }).join('');
    }

    searchInput.addEventListener('input', renderSearch);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (item) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[item];
    });
  }
})();
