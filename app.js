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
    // Validate actual browser metadata before showing controls or a download.
    video.addEventListener('loadedmetadata', () => {
      placeholder.hidden = true;
      video.hidden = false;
      download.href = media.video;
      download.hidden = false;
      document.getElementById('film-name').textContent = media.narrated ? 'AI爆改电视 · 女声配音版' : 'AI爆改电视 · 字幕版';
      const duration = Number.isFinite(video.duration) ? `${Math.round(video.duration)} 秒 · ` : '';
      document.getElementById('film-description').textContent = `${duration}${media.narrated ? 'PDFMaster 同款女声 · ' : '字幕版 · '}真实界面演示剪辑。`;
    }, { once: true });
    video.addEventListener('error', () => {
      video.hidden = true;
      placeholder.hidden = false;
      download.hidden = true;
      download.removeAttribute('href');
      document.getElementById('film-name').textContent = '真实界面 · 截图预览';
      document.getElementById('film-description').textContent = '短片暂不可播放，先浏览真实界面与下方适配说明。';
    });
    video.preload = 'metadata';
    if (isPublicMedia(media.cover) && media.cover.endsWith('.png')) {
      const cover = new Image();
      cover.addEventListener('load', () => { video.poster = media.cover; }, { once: true });
      cover.src = media.cover;
    }
    video.src = media.video;
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
      open.dataset.caption = 'AI爆改电视 · 宣传海报 · 设计候选待审';
      poster.alt = 'AI爆改电视竖版宣传海报：真实首页画面与客厅合成展示，设计候选待审。';
      download.innerHTML = '保存候选海报 <span aria-hidden="true">↓</span>';
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
