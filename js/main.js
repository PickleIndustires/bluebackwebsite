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

  if (!slides.length) return;

  const INTERVAL = 5500;
  const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let   current  = 0;
  let   timer    = null;

  function show(idx) {
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

    if (liveRgn) {
      liveRgn.textContent = 'Slide ' + (current + 1) + ' of ' + slides.length;
    }
  }

  function startAuto() {
    if (reduced) return;
    clearInterval(timer);
    timer = setInterval(function () { show(current + 1); }, INTERVAL);
  }

  function stopAuto() { clearInterval(timer); }

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

  startAuto();
}());
