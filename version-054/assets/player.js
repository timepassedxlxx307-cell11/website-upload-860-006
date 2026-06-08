function initMoviePlayer(source) {
  var video = document.querySelector(".js-player-video");
  var overlay = document.querySelector(".js-player-overlay");
  var hlsInstance = null;

  if (!video || !overlay || !source) {
    return;
  }

  function bindSource() {
    if (video.dataset.ready === "1") {
      return true;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.dataset.ready = "1";
      return true;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      video.dataset.ready = "1";
      return true;
    }

    overlay.classList.add("is-error");
    var label = overlay.querySelector("strong");
    if (label) {
      label.textContent = "暂时无法播放";
    }
    return false;
  }

  function playVideo() {
    if (!bindSource()) {
      return;
    }
    overlay.classList.add("is-hidden");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", playVideo);
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });
  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
