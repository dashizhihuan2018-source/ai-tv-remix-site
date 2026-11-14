/* Plain scripts deliberately support both file:// and static hosting. */
(() => {
  const dialog = document.querySelector('.image-dialog');
  let returnFocus;
  if (dialog && typeof dialog.showModal === 'function') {
    document.querySelectorAll('.image-zoom').forEach(link => {
      link.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !link.getAttribute('href')) return;
        event.preventDefault();
        returnFocus = link;
        const preview = dialog.querySelector('img');
        preview.src = link.href;
        preview.alt = link.querySelector('img')?.alt || '真实界面大图';
        dialog.querySelector('p').textContent = link.dataset.caption || '';
        document.body.classList.add('dialog-open');
        dialog.showModal();
      });
    });
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      returnFocus?.focus({ preventScroll: true });
    });
  }

  const media = window.AITV_MEDIA || {};
  const isPublicMedia = value => typeof value === 'string' && /^public\/media\/[a-zA-Z0-9_-]+\.(mp4|png)$/.test(value);
  const video = document.getElementById('promo-video');
  if (video && isPublicMedia(media.video) && media.video.endsWith('.mp4')) {
    const placeholder = document.getElementById('film-placeholder');
    const download = document.getElementById('video-download');
    const sound = document.getElementById('video-sound');
    const description = document.getElementById('film-description');
    const playback = isPublicMedia(media.preview) && media.preview.endsWith('.mp4') ? media.preview : media.video;
    let originalFallback = false;
    video.defaultMuted = true;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    download.href = media.video;
    download.hidden = false;
    const syncSound = () => {
      const audible = !video.muted && video.volume > 0;
      sound.textContent = audible ? '关闭配音' : '开启配音';
      sound.setAttribute('aria-pressed', String(audible));
    };
    const autoPlay = () => {
      const attempt = video.play();
      if (attempt) attempt.catch(() => {
        description.textContent = '点击播放器开始观看；点击开启配音。';
      });
    };
    const ready = () => {
      placeholder.hidden = true;
      video.hidden = false;
      sound.hidden = !media.narrated;
      document.getElementById('film-name').textContent = 'AI爆改电视 · 9秒实机短片';
      description.textContent = '自动播放 · PDFMaster 同款女声，点击开启配音';
      syncSound();
      autoPlay();
    };
    video.addEventListener('loadedmetadata', ready);
    video.addEventListener('canplay', autoPlay);
    video.addEventListener('volumechange', syncSound);
    sound.addEventListener('click', () => {
      video.muted = !video.muted;
      if (!video.muted) video.volume = 1;
      syncSound();
      autoPlay();
    });
    video.addEventListener('error', () => {
      if (!originalFallback && video.getAttribute('src') !== media.video) {
        originalFallback = true;
        video.src = media.video;
        autoPlay();
        return;
      }
      video.hidden = true;
      placeholder.hidden = false;
      sound.hidden = true;
      description.textContent = '当前网络未能加载视频，可下载高清短片观看。';
    });
    if (video.getAttribute('src') !== playback) video.src = playback;
    if (video.readyState >= 1) ready();
    autoPlay();
    if ('IntersectionObserver' in window) {
      const visible = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting) && video.paused) autoPlay();
      }, { threshold: 0.1 });
      visible.observe(video);
    }
  }
  const poster = document.getElementById('promo-poster');
  if (poster && isPublicMedia(media.poster) && media.poster.endsWith('.png')) {
    const ready = document.getElementById('poster-ready');
    const placeholder = document.getElementById('poster-placeholder');
    const open = document.getElementById('poster-open');
    const download = document.getElementById('poster-download');
    poster.addEventListener('load', () => {
      open.href = media.poster;
      download.href = media.poster;
      open.dataset.caption = 'AI爆改电视 · 宣传海报';
      poster.alt = 'AI爆改电视竖版宣传海报：无广告、全网通、免费看，附公开网站二维码。';
      download.innerHTML = '保存宣传海报 <span aria-hidden="true">↓</span>';
      placeholder.hidden = true;
      ready.hidden = false;
    }, { once: true });
    poster.addEventListener('error', () => {
      ready.hidden = true;
      placeholder.hidden = false;
      open.removeAttribute('href');
      download.removeAttribute('href');
    });
    // Hidden lazy images do not load in every browser; load this checked asset eagerly.
    poster.loading = 'eager';
    poster.src = media.poster;
  }
})();
