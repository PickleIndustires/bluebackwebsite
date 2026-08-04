(function () {
  'use strict';

  /* ── Analytics (GA4 dataLayer) ───────────────────────────
     GA4 is not yet installed on this site. dataLayer.push() is
     safe to call with no tag present — events simply queue in
     memory and are not sent anywhere. Once a GA4 tag is added
     (see ANALYTICS-SETUP.md), these events become available as
     conversions without any further code changes. ─────────── */
  window.dataLayer = window.dataLayer || [];

  function bbTrack(eventName, params) {
    window.dataLayer.push(Object.assign({
      event: eventName,
      page_path: window.location.pathname
    }, params || {}));
  }
  window.bbTrack = bbTrack;

  function getUtmParams() {
    var params = new URLSearchParams(window.location.search);
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    var out = {};
    keys.forEach(function (k) {
      var v = params.get(k);
      if (v) out[k] = v;
    });
    return out;
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-analytics-event]');
    if (el) {
      bbTrack(el.getAttribute('data-analytics-event'), {
        cta_location: el.getAttribute('data-analytics-location') || undefined,
        service: el.getAttribute('data-analytics-service') || undefined,
        property_type: el.getAttribute('data-analytics-property-type') || undefined
      });
      return;
    }
    var link = e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (link) {
      var isPhone = link.getAttribute('href').indexOf('tel:') === 0;
      bbTrack(isPhone ? 'phone_click' : 'email_click', {
        cta_location: link.getAttribute('data-analytics-location') || 'inline'
      });
    }
  });

  /* ── Seasonal Banner ──────────────────────────────────────
     Edit this object to change the sitewide banner. Every page
     reads from here — no per-page edits needed. Set enabled to
     false to turn the banner off everywhere. See CONTENT-GUIDE.md. */
  var SEASONAL_BANNER = {
    enabled: true,
    id: 'fall-2026-cleanup',
    message: 'Fall project and seasonal cleanup scheduling is now underway.',
    ctaText: 'Discuss Fall Work',
    ctaHref: 'seasonal-cleanups.html'
  };

  (function initSeasonalBanner() {
    var el = document.getElementById('seasonal-banner');
    if (!el || !SEASONAL_BANNER.enabled) return;

    var dismissedId = null;
    try { dismissedId = window.localStorage.getItem('bb_banner_dismissed'); } catch (err) {}
    if (dismissedId === SEASONAL_BANNER.id) return;

    el.innerHTML =
      '<div class="seasonal-banner-inner">' +
        '<p><span class="seasonal-banner-msg"></span> ' +
        '<a class="seasonal-banner-cta" href="' + SEASONAL_BANNER.ctaHref + '" data-analytics-event="seasonal_banner_cta"></a></p>' +
        '<button type="button" class="seasonal-banner-close" aria-label="Dismiss announcement">&times;</button>' +
      '</div>';
    el.querySelector('.seasonal-banner-msg').textContent = SEASONAL_BANNER.message;
    var cta = el.querySelector('.seasonal-banner-cta');
    cta.textContent = SEASONAL_BANNER.ctaText;
    el.hidden = false;

    el.querySelector('.seasonal-banner-close').addEventListener('click', function () {
      el.hidden = true;
      try { window.localStorage.setItem('bb_banner_dismissed', SEASONAL_BANNER.id); } catch (err) {}
    });
  }());

  /* ── Nav Dropdown (Services) ─────────────────────────────── */
  (function initNavDropdown() {
    var items = document.querySelectorAll('.nav-has-dropdown');
    items.forEach(function (item) {
      var btn = item.querySelector('.nav-dropdown-toggle');
      var menu = item.querySelector('.nav-dropdown');
      if (!btn || !menu) return;

      btn.addEventListener('click', function () {
        var open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
      });

      document.addEventListener('click', function (e) {
        if (!item.contains(e.target)) {
          item.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });

      item.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          item.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          btn.focus();
        }
      });
    });
  }());

  /* ── FAQ Accordion ────────────────────────────────────────── */
  (function initFaq() {
    var questions = document.querySelectorAll('.faq-question');
    questions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
      });
    });
  }());

  /* ── Project Filters (progressive enhancement) ──────────── */
  (function initProjectFilters() {
    var bar = document.querySelector('.project-filters');
    var cards = document.querySelectorAll('.project-card');
    if (!bar || !cards.length) return;

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.project-filter-btn');
      if (!btn) return;

      bar.querySelectorAll('.project-filter-btn').forEach(function (b) {
        b.setAttribute('aria-pressed', 'false');
      });
      btn.setAttribute('aria-pressed', 'true');

      var cat = btn.getAttribute('data-filter');
      cards.forEach(function (card) {
        var show = cat === 'all' || card.getAttribute('data-category') === cat;
        card.style.display = show ? '' : 'none';
      });
    });
  }());

  /* ── Blue Back Forms (consultation / commercial inquiry) ──
     Backed by Formspree (https://formspree.io/f/meeyybkv). See
     ANALYTICS-SETUP.md / CONTENT-GUIDE.md for how to change or
     replace this. If FORM_ENDPOINT is ever reset to the literal
     string below, submissions fall back to a pre-filled mailto:
     instead of silently failing. */
  var FORM_ENDPOINT = 'https://formspree.io/f/meeyybkv';

  function initBlueBackForms() {
    var forms = document.querySelectorAll('.bb-form');
    forms.forEach(function (form) {
      var started = false;
      var statusEl = form.querySelector('.form-status');

      // Hidden UTM fields
      var utm = getUtmParams();
      Object.keys(utm).forEach(function (key) {
        var field = form.querySelector('[name="' + key + '"]');
        if (field) field.value = utm[key];
      });

      form.addEventListener('input', function () {
        if (!started) {
          started = true;
          bbTrack('quote_form_start', { form_id: form.id || undefined });
        }
      }, { once: false, capture: true });

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Honeypot — if filled, silently drop (bot). "_gotcha" is Formspree's
        // own honeypot convention, so spam is filtered server-side too.
        var honeypot = form.querySelector('input[name="_gotcha"]');
        if (honeypot && honeypot.value) return;

        var valid = true;
        form.querySelectorAll('[required]').forEach(function (field) {
          var wrap = field.closest('.form-field');
          var ok = field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
          if (wrap) wrap.classList.toggle('invalid', !ok);
          if (!ok) valid = false;
        });
        if (!valid) {
          if (statusEl) {
            statusEl.textContent = 'Please fill in the required fields highlighted below.';
            statusEl.className = 'form-status visible error';
          }
          var firstInvalid = form.querySelector('.form-field.invalid input, .form-field.invalid select, .form-field.invalid textarea');
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        var formData = new FormData(form);
        var thankYouUrl = form.getAttribute('data-success-url') || 'thank-you.html';

        if (FORM_ENDPOINT === 'REPLACE_WITH_FORM_ENDPOINT') {
          // Fallback: open a pre-filled email instead of a fake success state.
          var lines = [];
          formData.forEach(function (value, key) {
            if (key === '_gotcha' || !value) return;
            lines.push(key + ': ' + value);
          });
          var subject = encodeURIComponent('Website inquiry — ' + (form.getAttribute('data-form-name') || 'Blue Back Landscaping'));
          var body = encodeURIComponent(lines.join('\n'));
          window.location.href = 'mailto:info@bluebacklandscaping.com?subject=' + subject + '&body=' + body;

          if (statusEl) {
            statusEl.textContent = 'Your email app should now open with your request pre-filled. If it did not open, please email info@bluebacklandscaping.com or call (860) 735-4145.';
            statusEl.className = 'form-status visible success';
          }
          bbTrack('quote_form_submit', { form_id: form.id || undefined, submit_method: 'mailto_fallback' });
          return;
        }

        fetch(FORM_ENDPOINT, { method: 'POST', body: formData, headers: { Accept: 'application/json' } })
          .then(function (res) {
            if (res.ok) {
              bbTrack('quote_form_submit', { form_id: form.id || undefined, submit_method: 'endpoint' });
              window.location.href = thankYouUrl;
            } else {
              throw new Error('Form submission failed');
            }
          })
          .catch(function () {
            if (statusEl) {
              statusEl.textContent = 'Something went wrong sending your request. Please call (860) 735-4145 or email info@bluebacklandscaping.com directly.';
              statusEl.className = 'form-status visible error';
            }
          });
      });
    });
  }
  initBlueBackForms();

  /* ── Pre-select service from ?service= query param ───────── */
  (function preselectService() {
    var select = document.getElementById('q-service');
    if (!select) return;
    var wanted = new URLSearchParams(window.location.search).get('service');
    if (!wanted) return;
    var map = {
      drainage: 'Drainage', grading: 'Grading or Lawn Restoration', renovation: 'Landscape Renovation',
      walkway: 'Walkway or Hardscape', estate: 'Estate Grounds Management', commercial: 'Commercial Maintenance',
      cleanup: 'Seasonal Cleanup', maintenance: 'Commercial Maintenance', snow: 'Snow and Ice'
    };
    var label = map[wanted];
    if (!label) return;
    Array.prototype.forEach.call(select.options, function (opt) {
      if (opt.textContent.trim() === label) select.value = opt.value;
    });
  }());

  /* ── Footer Year ──────────────────────────────────────────── */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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
