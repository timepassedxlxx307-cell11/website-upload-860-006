(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupNavigation() {
    var toggle = one('[data-nav-toggle]');
    var panel = one('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupBackTop() {
    var button = one('[data-back-top]');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function setupHero() {
    var slides = all('[data-hero-slide]');
    var dots = all('[data-hero-dot]');
    if (slides.length === 0) {
      return;
    }
    var current = 0;
    function activate(index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
      });
    });
    window.setInterval(function () {
      activate((current + 1) % slides.length);
    }, 5200);
  }

  function setupFilter() {
    var filter = one('[data-filter-input]');
    var cards = all('[data-movie-card]');
    var empty = one('[data-filter-empty]');
    if (!filter || cards.length === 0) {
      return;
    }
    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }
    function run() {
      var query = normalize(filter.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type')
        ].join(' '));
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }
    filter.addEventListener('input', run);
    run();
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a href="' + escapeHtml(movie.url) + '" class="poster-link" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-glow"></span>',
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '</a>',
      '<div class="card-content">',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-tags">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      };
      return map[char];
    });
  }

  function setupSearchPage() {
    var results = one('[data-search-results]');
    if (!results || !window.MovieSearchData) {
      return;
    }
    var input = one('[data-search-page-input]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }
    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }
    function render(query) {
      var q = normalize(query);
      var list = window.MovieSearchData.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.genre,
          movie.type,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));
        return !q || text.indexOf(q) !== -1;
      });
      var sliced = q ? list.slice(0, 180) : list.slice(0, 60);
      if (sliced.length === 0) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片，可以换一个关键词再试。</div>';
        return;
      }
      results.innerHTML = sliced.map(cardTemplate).join('');
    }
    render(initial);
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  function setupPlayers() {
    all('[data-player]').forEach(function (player) {
      var video = one('video', player);
      var overlay = one('[data-player-start]', player);
      var message = one('[data-player-message]', player);
      var source = player.getAttribute('data-video-source');
      var started = false;
      var hlsInstance = null;

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add('is-visible');
      }

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            showMessage('点击播放器即可继续播放');
          });
        }
      }

      function start() {
        if (!video || !source) {
          return;
        }
        hideOverlay();
        video.controls = true;
        if (started) {
          if (video.paused) {
            playVideo();
          }
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage('视频加载失败，请稍后重试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          video.load();
        } else {
          showMessage('当前浏览器暂不支持播放');
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!started) {
            start();
          } else if (video.paused) {
            playVideo();
          } else {
            video.pause();
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupBackTop();
    setupHero();
    setupFilter();
    setupSearchPage();
    setupPlayers();
  });
})();
