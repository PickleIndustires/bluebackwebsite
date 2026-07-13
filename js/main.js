(function () {
  'use strict';

  /* ── Mobile Nav ───────────────────────────────────────── */
  const toggle  = document.querySelector('.nav-toggle');
  const navList = document.getElementById('primary-nav');

  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      const open = navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      toggle.innerHTML = open ? '&#10005;' : '&#9776;';
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });

    navList.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navList.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '&#9776;';
      });
    });

    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '&#9776;';
      }
    });
  }

  /* ── Hero Carousel ────────────────────────────────────── */
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const slides   = hero.querySelectorAll('.hero-slide');
  const dots     = hero.querySelectorAll('.hero-dot');
  const prevBtn  = hero.querySelector('.hero-prev');
  const nextBtn  = hero.querySelector('.hero-next');
  const liveRgn  = hero.querySelector('.hero-live');
  const heroVideos = hero.querySelectorAll('.hero-video');

  if (!slides.length) return;

  const INTERVAL = 5500;
  const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let   current  = 0;
  let   timer    = null;

  const videoBySlideIndex = new Map();
  heroVideos.forEach(function (video) {
    const idx = Array.prototype.indexOf.call(slides, video.closest('.hero-slide'));
    if (idx !== -1) videoBySlideIndex.set(idx, video);
  });

  function isVideoSlide(idx) { return videoBySlideIndex.has(idx); }

  function playVideoSlide(idx) {
    if (reduced) return;
    const video = videoBySlideIndex.get(idx);
    if (!video) return;
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise && playPromise.catch) playPromise.catch(function () {});
  }

  function stopVideoSlide(idx) {
    const video = videoBySlideIndex.get(idx);
    if (video) video.pause();
  }

  function show(idx) {
    if (isVideoSlide(current)) stopVideoSlide(current);

    slides[current].classList.remove('active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');
    dots[current].setAttribute('tabindex', '-1');

    current = ((idx % slides.length) + slides.length) % slides.length;

    slides[current].classList.add('active');
    slides[current].removeAttribute('aria-hidden');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');
    dots[current].setAttribute('tabindex', '0');

    if (isVideoSlide(current)) playVideoSlide(current);

    if (liveRgn) {
      liveRgn.textContent = 'Slide ' + (current + 1) + ' of ' + slides.length;
    }
  }

  function startAuto() {
    if (reduced) return;
    clearInterval(timer);
    if (isVideoSlide(current)) return; // advances on the video's 'ended' event instead
    timer = setInterval(function () { show(current + 1); }, INTERVAL);
  }

  function stopAuto() { clearInterval(timer); }

  videoBySlideIndex.forEach(function (video, idx) {
    video.addEventListener('ended', function () {
      if (current !== idx) return;
      show(current + 1);
      startAuto();
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', function () { show(current - 1); stopAuto(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { show(current + 1); stopAuto(); startAuto(); });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { show(i); stopAuto(); startAuto(); });
    dot.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { dots[(i + 1) % dots.length].focus(); }
      if (e.key === 'ArrowLeft')  { dots[(i - 1 + dots.length) % dots.length].focus(); }
    });
  });

  hero.addEventListener('mouseenter', stopAuto);
  hero.addEventListener('mouseleave', startAuto);
  hero.addEventListener('focusin',    stopAuto);
  hero.addEventListener('focusout',   startAuto);

  hero.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { show(current - 1); stopAuto(); startAuto(); }
    if (e.key === 'ArrowRight') { show(current + 1); stopAuto(); startAuto(); }
  });

  if (reduced) {
    heroVideos.forEach(function (video) {
      video.pause();
      video.removeAttribute('autoplay');
    });
  }

  startAuto();

  /* ── Gallery Lightbox ─────────────────────────────────── */
  const galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');

  if (galleryItems.length && lightbox) {
    const stage     = lightbox.querySelector('.lightbox-stage');
    const captionEl = lightbox.querySelector('.lightbox-caption');
    const closeBtn  = lightbox.querySelector('.lightbox-close');
    const lbPrevBtn = lightbox.querySelector('.lightbox-prev');
    const lbNextBtn = lightbox.querySelector('.lightbox-next');
    let   activeIndex = 0;
    let   lastFocused  = null;

    function renderItem(index) {
      activeIndex = ((index % galleryItems.length) + galleryItems.length) % galleryItems.length;
      const item = galleryItems[activeIndex];
      const type = item.getAttribute('data-type');
      const src = item.getAttribute('data-src');
      const caption = item.getAttribute('data-caption') || '';

      stage.innerHTML = '';
      if (type === 'video') {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        stage.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = src;
        img.alt = caption;
        stage.appendChild(img);
      }
      captionEl.textContent = caption;
    }

    function openLightbox(index) {
      lastFocused = document.activeElement;
      renderItem(index);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      stage.innerHTML = '';
      document.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    galleryItems.forEach(function (item, index) {
      item.addEventListener('click', function () { openLightbox(index); });
    });

    closeBtn.addEventListener('click', closeLightbox);
    lbPrevBtn.addEventListener('click', function () { renderItem(activeIndex - 1); });
    lbNextBtn.addEventListener('click', function () { renderItem(activeIndex + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowRight') renderItem(activeIndex + 1);
      if (e.key === 'ArrowLeft')  renderItem(activeIndex - 1);
    });
  }
}());
