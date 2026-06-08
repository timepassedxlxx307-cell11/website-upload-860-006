(function () {
    window.initMoviePlayer = function (source) {
        var video = document.querySelector('[data-player]');
        var cover = document.querySelector('[data-player-cover]');
        var loaded = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function reveal() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        }

        function playVideo() {
            reveal();
            video.controls = true;
            var playTask = video.play();

            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }

        function loadAndPlay() {
            if (!loaded) {
                loaded = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    playVideo();
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                } else {
                    video.src = source;
                    playVideo();
                }
            } else {
                playVideo();
            }
        }

        if (cover) {
            cover.addEventListener('click', loadAndPlay);
        }

        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                loadAndPlay();
            }
        });

        video.addEventListener('play', reveal);

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
