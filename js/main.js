/* HOT FROG · main.js */
(() => {
  'use strict';

  const doc = document.documentElement;
  const body = document.body;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const sheet = $('#sheet');

  doc.classList.add('js');
  if (reduce) doc.classList.add('reduce');

  /* ---------- split headings into masked words ---------- */
  function splitWords(el) {
    let k = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const wi = document.createElement('span');
            wi.className = 'wi';
            wi.style.setProperty('--k', k++);
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    };
    walk(el);
  }
  $$('[data-split]').forEach(splitWords);

  /* ---------- words that light up while scrolling ---------- */
  const wordBlocks = $$('[data-words]').map(el => {
    const words = [];
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            s.className = 'ww';
            s.textContent = part;
            words.push(s);
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return { el, words };
  });

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('[data-reveal], [data-split], [data-clip]');
  // small stagger for siblings
  revealEls.forEach(el => {
    const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal')) : [];
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--rd', Math.min(i * 0.08, 0.32) + 's');
  });
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- intro ---------- */
  const intro = $('#intro');
  const wordmark = $('.hero .wordmark');
  function startHero() {
    body.classList.add('ready');
    setTimeout(() => wordmark && wordmark.classList.add('wm-done'), 1700);
  }
  if (reduce || !intro) {
    if (intro) intro.classList.add('gone');
    startHero();
  } else {
    doc.style.overflow = 'hidden';
    const img = $('img', intro);
    const go = () => {
      if (intro.classList.contains('go')) return;
      intro.classList.add('go');
      setTimeout(() => {
        intro.classList.add('out');
        doc.style.overflow = '';
        startHero();
      }, 1500);
      setTimeout(() => intro.classList.add('gone'), 2600);
    };
    if (img.decode) img.decode().then(go, go); else go();
    setTimeout(go, 1200); // never wait longer than this
  }

  // letters jump on hover / tap
  if (wordmark) {
    $$('.wm-l', wordmark).forEach(l => {
      const jump = () => {
        if (!wordmark.classList.contains('wm-done')) return;
        l.classList.remove('jump'); void l.getBoundingClientRect(); l.classList.add('jump');
      };
      l.addEventListener('pointerenter', jump);
      l.addEventListener('animationend', e => { if (e.animationName === 'jump') l.classList.remove('jump'); });
    });
  }

  /* ---------- nav ---------- */
  const nav = $('#nav');
  const burger = $('.burger');
  const drawer = $('#drawer');
  let lastY = scrollY;
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
    drawer.setAttribute('aria-hidden', !open);
    doc.style.overflow = open ? 'hidden' : '';
    if (open) nav.classList.remove('hide');
  }
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  $$('a', drawer).forEach(a => a.addEventListener('click', () => setMenu(false)));

  const navLinks = $$('.nav__links a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => so.observe(s));
  }

  /* ---------- menu category chips ---------- */
  const cats = $$('.cat');
  const chaps = cats.map(c => $(c.getAttribute('href')));
  const catsInner = $('.cats__inner');
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        cats.forEach(c => {
          const on = c.getAttribute('href') === '#' + e.target.id;
          c.classList.toggle('active', on);
          if (on && catsInner.scrollWidth > catsInner.clientWidth) {
            catsInner.scrollTo({ left: c.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
          }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    chaps.forEach(c => c && co.observe(c));
  }

  /* ---------- open / closed (Europe/Zagreb, svaki dan 11–23) ---------- */
  const OPEN = 11 * 60, CLOSE = 23 * 60;
  function zagrebMinutes() {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zagreb', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const h = +parts.find(p => p.type === 'hour').value;
      const m = +parts.find(p => p.type === 'minute').value;
      return h * 60 + m;
    } catch (e) {
      const d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    }
  }
  function updateStatus() {
    const t = zagrebMinutes();
    const open = t >= OPEN && t < CLOSE;
    const txt = open ? 'Otvoreno · do 23:00' : (t < OPEN ? 'Zatvoreno · otvaramo u 11:00' : 'Zatvoreno · otvaramo sutra u 11:00');
    $$('[data-status]').forEach(s => {
      s.classList.toggle('is-open', open);
      s.classList.toggle('is-closed', !open);
      $('span', s).textContent = txt;
    });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- counters ---------- */
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1100;
        const tick = now => {
          const p = clamp((now - t0) / dur, 0, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        el.textContent = '0';
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------- hero pointer parallax ---------- */
  const hero = $('.hero');
  const heroBadge = $('[data-tilt-hero]');
  if (finePointer && !reduce && hero) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      heroBadge.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5) * 2);
      heroBadge.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5) * 2);
    });
    hero.addEventListener('pointerleave', () => { heroBadge.style.setProperty('--mx', 0); heroBadge.style.setProperty('--my', 0); });
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduce) {
    $$('.magnet').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.18}px ${(e.clientY - r.top - r.height / 2) * 0.3}px`;
      });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }

  /* ---------- 3D tilt cards ---------- */
  if (finePointer && !reduce) {
    $$('[data-tilt]').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transition = 'transform .12s ease-out';
        c.style.transform = `perspective(900px) rotateX(${-y * 9}deg) rotateY(${x * 11}deg) translateY(-4px)`;
      });
      c.addEventListener('pointerleave', () => {
        c.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1)';
        c.style.transform = '';
      });
    });
  }

  /* ---------- signature dogs ---------- */
  const dogsWrap = $('#dogs');
  const track = $('.dogs__track');
  const dogs = $$('.dog', track);
  const dotsBox = $('.dogs__dots');
  const idxEl = $('[data-dog-index]');
  const bar = $('[data-dog-bar]');
  const dots = dogs.map((d, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', d.dataset.name);
    b.addEventListener('click', () => {
      track.scrollTo({ left: d.offsetLeft - (track.clientWidth - d.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
    });
    dotsBox.appendChild(b);
    return b;
  });
  let activeDog = -1;
  function setActiveDog(i) {
    if (i === activeDog) return;
    activeDog = i;
    dogs.forEach((d, j) => d.classList.toggle('is-active', j === i));
    dots.forEach((b, j) => b.classList.toggle('on', j === i));
    if (idxEl) idxEl.textContent = String(i + 1).padStart(2, '0');
  }
  setActiveDog(0);

  // preload the cutouts before the section arrives
  if ('IntersectionObserver' in window) {
    const pre = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { $$('img', track).forEach(i => { i.loading = 'eager'; }); pre.disconnect(); }
    }, { rootMargin: '900px 0px' });
    pre.observe(dogsWrap);
  }

  const pinMQ = matchMedia('(min-width: 1000px) and (hover: hover) and (pointer: fine)');
  let pinned = false, travel = 0;
  let mobileIO = null;

  function setupDogs() {
    pinned = pinMQ.matches && !reduce;
    dogsWrap.classList.toggle('dogs--pin', pinned);
    if (mobileIO) { mobileIO.disconnect(); mobileIO = null; }
    if (pinned) {
      track.style.transform = '';
      const last = dogs[dogs.length - 1];
      const padL = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      travel = Math.max(0, last.offsetLeft + last.offsetWidth - (innerWidth - padL));
      dogsWrap.style.height = (innerHeight + travel) + 'px';
      onScroll();
    } else {
      dogsWrap.style.height = '';
      track.style.transform = '';
      dogs.forEach(d => { const im = $('.dog__img img', d); im.style.removeProperty('--a'); im.style.removeProperty('--r'); });
      if ('IntersectionObserver' in window) {
        mobileIO = new IntersectionObserver(entries => {
          entries.forEach(e => { if (e.isIntersecting) setActiveDog(dogs.indexOf(e.target)); });
        }, { root: track, threshold: 0.6 });
        dogs.forEach(d => mobileIO.observe(d));
      }
    }
  }

  function updatePinned() {
    const r = dogsWrap.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = travel ? clamp(-r.top / travel, 0, 1) : 0;
    track.style.transform = `translate3d(${-p * travel}px,0,0)`;
    if (bar) bar.parentElement.style.setProperty('--p', p);
    if (bar) bar.style.transform = `scaleX(${p})`;
    const vw = innerWidth;
    let best = 0, bestD = Infinity;
    dogs.forEach((d, i) => {
      const dr = d.getBoundingClientRect();
      const cx = dr.left + dr.width / 2;
      const dist = cx - vw / 2;
      const a = 1 - clamp(Math.abs(dist) / (vw * 0.7), 0, 1);
      const im = $('.dog__img img', d);
      im.style.setProperty('--a', a.toFixed(3));
      im.style.setProperty('--r', (-4 - dist / vw * 18).toFixed(2));
      if (Math.abs(dist) < bestD) { bestD = Math.abs(dist); best = i; }
    });
    setActiveDog(best);
  }

  /* ---------- scroll-linked: parallax, words, nav, fab ---------- */
  const parallaxEls = $$('[data-parallax]');
  const fab = $('.fab');
  const footer = $('.foot');
  let ticking = false;
  // hide the floating button while controls sit in the lower part of the screen
  const blockers = new Set();
  if ('IntersectionObserver' in window) {
    const fo = new IntersectionObserver(es => {
      es.forEach(e => e.isIntersecting ? blockers.add(e.target) : blockers.delete(e.target));
      onScroll();
    }, { rootMargin: '-62% 0px 0px 0px' });
    $$('[data-nofab]').forEach(el => fo.observe(el));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = scrollY, vh = innerHeight;

      // nav
      nav.classList.toggle('scrolled', y > 20);
      if (!body.classList.contains('menu-open')) {
        const down = y > lastY + 4, up = y < lastY - 4;
        if (down && y > vh * 0.9) { nav.classList.add('hide'); doc.classList.add('nav-hidden'); }
        else if (up || y < vh * 0.5) { nav.classList.remove('hide'); doc.classList.remove('nav-hidden'); }
      }
      lastY = y;

      // hero floats
      if (y < vh * 1.2 && hero) hero.style.setProperty('--sy', y.toFixed(1));

      if (!reduce) {
        parallaxEls.forEach(el => {
          const r = el.parentElement.getBoundingClientRect();
          if (r.bottom < -100 || r.top > vh + 100) return;
          const f = parseFloat(el.dataset.parallax) || 0.1;
          const c = r.top + r.height / 2 - vh / 2;
          el.style.transform = `translate3d(0,${(-c * f).toFixed(1)}px,0)`;
        });

        wordBlocks.forEach(({ el, words }) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          const p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.38), 0, 1);
          const n = words.length;
          words.forEach((w, i) => {
            const o = clamp(p * (n + 3) - i, 0, 1);
            w.style.setProperty('--o', (0.16 + o * 0.84).toFixed(3));
          });
        });
      }

      if (pinned) updatePinned();

      // fab
      if (fab) {
        const fr = footer.getBoundingClientRect();
        fab.classList.toggle('show', y > vh * 0.75 && fr.top > vh - 40 && !blockers.size && !sheet.classList.contains('open'));
      }
    });
  }
  addEventListener('scroll', onScroll, { passive: true });

  let rz;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(setupDogs, 150); });
  pinMQ.addEventListener ? pinMQ.addEventListener('change', setupDogs) : pinMQ.addListener(setupDogs);

  /* ---------- freestyle builder ---------- */
  const builder = $('.builder');
  if (builder) {
    const combo = $('[data-combo]', builder);
    const sausage = $('.hd__sausage', builder);
    const burst = $('[data-burst]', builder);
    const stage = $('.builder__stage', builder);
    const BASE = { pileci: 'Pileći hot dog', kobasica: 'Hot dog s kobasicom', sir: 'Hot dog s kobasicom sa sirom' };
    const EXTRA = { cheese: 'topljeni sir', chilli: 'chilli meat', sauce: 'umak po izboru' };
    const COLORS = ['#f7c51e', '#ef3b36', '#7dbe45', '#fff4de'];

    function pop() {
      if (reduce) return;
      const r = stage.getBoundingClientRect();
      for (let i = 0; i < 14; i++) {
        const d = document.createElement('i');
        const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 110;
        d.style.left = r.width / 2 + 'px';
        d.style.top = r.height * 0.45 + 'px';
        d.style.background = COLORS[i % COLORS.length];
        burst.appendChild(d);
        d.animate([
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(.2)`, opacity: 0 }
        ], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => d.remove();
      }
    }

    function render(changed) {
      const base = $('input[name="base"]:checked', builder).value;
      const extras = $$('input[name="extra"]:checked', builder).map(i => i.value);
      const prevBase = builder.dataset.base;
      builder.dataset.base = base;
      ['cheese', 'chilli', 'sauce'].forEach(x => builder.classList.toggle('has-' + x, extras.includes(x)));
      combo.textContent = [BASE[base], ...extras.map(x => EXTRA[x])].join(' + ');
      if (!changed) return;
      combo.classList.remove('flash'); void combo.offsetWidth; combo.classList.add('flash');
      if (changed.name === 'base' && prevBase !== base && !reduce && sausage.animate) {
        sausage.animate([
          { transform: 'translateY(0) scale(1)' },
          { transform: 'translateY(-34px) scale(1.04, .96) rotate(-2deg)', offset: 0.35 },
          { transform: 'translateY(0) scale(.98, 1.03)', offset: 0.7 },
          { transform: 'translateY(0) scale(1)' }
        ], { duration: 650, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      }
      if (changed.checked) pop();
    }
    builder.addEventListener('change', e => { if (e.target.matches('input')) render(e.target); });
    render();
  }

  /* ---------- order sheet ---------- */
  let lastFocus = null;
  function openSheet() {
    lastFocus = document.activeElement;
    if (body.classList.contains('menu-open')) setMenu(false);
    sheet.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
    doc.style.overflow = 'hidden';
    fab && fab.classList.remove('show');
    setTimeout(() => { const f = $('.opt-link', sheet); f && f.focus({ preventScroll: true }); }, 350);
  }
  function closeSheet() {
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
    doc.style.overflow = '';
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
    onScroll();
  }
  $$('[data-order]').forEach(b => b.addEventListener('click', openSheet));
  $$('[data-close]', sheet).forEach(b => b.addEventListener('click', closeSheet));
  // swipe down to close (phones)
  const panel = $('.sheet__panel', sheet);
  let sy0 = null;
  panel.addEventListener('touchstart', e => { if (panel.scrollTop <= 0) sy0 = e.touches[0].clientY; }, { passive: true });
  panel.addEventListener('touchmove', e => {
    if (sy0 == null) return;
    const dy = e.touches[0].clientY - sy0;
    if (dy > 0 && innerWidth < 600) { panel.style.transition = 'none'; panel.style.transform = `translateY(${dy}px)`; }
  }, { passive: true });
  panel.addEventListener('touchend', e => {
    if (sy0 == null) return;
    const dy = e.changedTouches[0].clientY - sy0;
    sy0 = null;
    panel.style.transition = ''; panel.style.transform = '';
    if (dy > 90 && innerWidth < 600) closeSheet();
  });

  /* ---------- gallery reel + lightbox ---------- */
  const shots = $$('.shot');
  $$('.reel__track').forEach(t => {
    [...t.children].forEach(c => {
      const cl = c.cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      cl.tabIndex = -1;
      t.appendChild(cl);
    });
  });
  const lb = $('#lb');
  const lbImg = $('img', lb);
  const lbCap = $('figcaption', lb);
  let lbIndex = 0;
  function showShot(i) {
    lbIndex = (i + shots.length) % shots.length;
    const s = shots[lbIndex];
    const im = $('img', s);
    lbImg.style.opacity = 0;
    const next = new Image();
    next.onload = () => { lbImg.src = next.src; lbImg.alt = im.alt; lbImg.style.opacity = 1; };
    next.src = s.dataset.full;
    lbCap.textContent = im.alt;
  }
  function openLB(i) {
    lastFocus = document.activeElement;
    showShot(i);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    doc.style.overflow = 'hidden';
    $('.lb__x', lb).focus({ preventScroll: true });
  }
  function closeLB() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    doc.style.overflow = '';
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  $$('.reel .shot').forEach(s => {
    s.addEventListener('click', () => {
      const src = s.dataset.full;
      openLB(shots.findIndex(x => x.dataset.full === src));
    });
  });
  $('.lb__x', lb).addEventListener('click', closeLB);
  $('.lb__prev', lb).addEventListener('click', () => showShot(lbIndex - 1));
  $('.lb__next', lb).addEventListener('click', () => showShot(lbIndex + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  let lx0 = null;
  lb.addEventListener('pointerdown', e => { lx0 = e.clientX; });
  lb.addEventListener('pointerup', e => {
    if (lx0 == null) return;
    const dx = e.clientX - lx0; lx0 = null;
    if (Math.abs(dx) > 50) showShot(lbIndex + (dx < 0 ? 1 : -1));
  });

  addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (lb.classList.contains('open')) closeLB();
      else if (sheet.classList.contains('open')) closeSheet();
      else if (body.classList.contains('menu-open')) setMenu(false);
    }
    if (lb.classList.contains('open')) {
      if (e.key === 'ArrowRight') showShot(lbIndex + 1);
      if (e.key === 'ArrowLeft') showShot(lbIndex - 1);
    }
  });

  /* ---------- FAQ accordion with height animation ---------- */
  $$('.qa').forEach(d => {
    const sum = $('summary', d);
    const ans = $('.qa__a', d);
    sum.addEventListener('click', e => {
      if (reduce || !ans.animate) return;
      e.preventDefault();
      if (d.open) {
        const a = ans.animate([{ height: ans.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
        a.onfinish = () => { d.open = false; };
      } else {
        d.open = true;
        const h = ans.offsetHeight;
        ans.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    });
  });

  /* ---------- misc ---------- */
  const yr = $('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();

  setupDogs();
  onScroll();
  addEventListener('load', () => { setupDogs(); onScroll(); });
})();
