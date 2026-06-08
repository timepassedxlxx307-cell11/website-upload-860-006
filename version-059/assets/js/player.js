(function () {
  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var button = box.querySelector('.big-play');
    var stream = box.getAttribute('data-stream');
    var started = false;

    function begin() {
      if (!video || !stream) {
        return;
      }

      if (cover) {
        cover.classList.add('hidden');
      }

      if (!started) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          box.__hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
        started = true;
      } else {
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', begin);
    }

    if (cover) {
      cover.addEventListener('click', begin);
    }
  });
})();
