(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function setupFilters() {
        var searchInputs = document.querySelectorAll(".js-card-search");
        var filterGroups = document.querySelectorAll("[data-filter-group]");
        var query = new URLSearchParams(window.location.search).get("q") || "";
        searchInputs.forEach(function (input) {
            if (query && !input.value) {
                input.value = query;
            }
            input.addEventListener("input", applyFilters);
        });
        filterGroups.forEach(function (group) {
            group.addEventListener("click", function (event) {
                var target = event.target.closest("[data-filter-type]");
                if (!target) {
                    return;
                }
                group.querySelectorAll("[data-filter-type]").forEach(function (button) {
                    button.classList.remove("active");
                });
                target.classList.add("active");
                applyFilters();
            });
        });
        applyFilters();
    }

    function applyFilters() {
        var searchInput = document.querySelector(".js-card-search");
        var text = normalize(searchInput ? searchInput.value : "");
        var activeFilter = document.querySelector("[data-filter-type].active");
        var type = activeFilter ? activeFilter.getAttribute("data-filter-type") : "all";
        document.querySelectorAll(".filter-item").forEach(function (card) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.category,
                card.dataset.tags
            ].join(" "));
            var typeMatched = type === "all" || normalize(card.dataset.type).indexOf(normalize(type)) !== -1;
            var textMatched = !text || haystack.indexOf(text) !== -1;
            card.classList.toggle("is-hidden", !(typeMatched && textMatched));
        });
    }

    function prepareVideo(video, sourceUrl) {
        if (video.dataset.ready === "yes") {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            video.dataset.ready = "yes";
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            video.dataset.ready = "yes";
            video._hls = hls;
            return;
        }
        video.src = sourceUrl;
        video.dataset.ready = "yes";
    }

    window.initMoviePlayer = function (videoId, sourceUrl) {
        var video = document.getElementById(videoId);
        if (!video || !sourceUrl) {
            return;
        }
        var shell = video.closest(".player-shell");
        var button = shell ? shell.querySelector(".player-start") : null;
        var start = function () {
            prepareVideo(video, sourceUrl);
            if (button) {
                button.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        };
        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!video.dataset.ready) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
    };

    ready(function () {
        setupMenu();
        setupFilters();
    });
})();
