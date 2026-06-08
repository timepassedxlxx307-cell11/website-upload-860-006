import { H as Hls } from './hls.js';

const players = Array.from(document.querySelectorAll('[data-player]'));

function canPlayNativeHls(video) {
    return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
}

function initializePlayer(player) {
    const video = player.querySelector('video');
    const startButton = player.querySelector('[data-player-start]');
    const status = player.querySelector('[data-player-status]');

    if (!video || !startButton) {
        return;
    }

    let hlsInstance = null;
    let isAttached = false;
    let usedFallback = false;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function attachSource() {
        if (isAttached) {
            return;
        }

        const hlsSource = video.dataset.hls;
        const mp4Source = video.dataset.mp4;
        const isLocalFile = window.location.protocol === 'file:';

        if (isLocalFile && mp4Source) {
            video.src = mp4Source;
            isAttached = true;
            usedFallback = true;
            setStatus('本地文件模式已启用兼容播放。');
            return;
        }

        if (hlsSource && canPlayNativeHls(video)) {
            video.src = hlsSource;
            isAttached = true;
            setStatus('正在使用浏览器原生播放能力。');
            return;
        }

        if (hlsSource && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });

            hlsInstance.loadSource(hlsSource);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                setStatus('高清播放源已加载，可以开始播放。');
            });
            hlsInstance.on(Hls.Events.ERROR, (_, data) => {
                if (data && data.fatal && mp4Source && !usedFallback) {
                    usedFallback = true;
                    hlsInstance.destroy();
                    hlsInstance = null;
                    video.src = mp4Source;
                    setStatus('播放源加载异常，已切换到兼容播放。');
                    video.play().catch(() => {});
                }
            });

            isAttached = true;
            setStatus('正在初始化播放器。');
            return;
        }

        if (mp4Source) {
            video.src = mp4Source;
            isAttached = true;
            usedFallback = true;
            setStatus('当前浏览器已启用兼容播放。');
            return;
        }

        setStatus('当前浏览器无法播放该视频源。');
    }

    startButton.addEventListener('click', async () => {
        attachSource();
        video.controls = true;

        try {
            await video.play();
            startButton.classList.add('is-hidden');
            setStatus('正在播放。');
        } catch (error) {
            setStatus('浏览器阻止了自动播放，请再次点击视频播放按钮。');
        }
    });

    video.addEventListener('playing', () => {
        startButton.classList.add('is-hidden');
        setStatus('正在播放。');
    });

    video.addEventListener('pause', () => {
        if (!video.ended) {
            setStatus('已暂停，可继续播放。');
        }
    });

    window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

players.forEach(initializePlayer);
