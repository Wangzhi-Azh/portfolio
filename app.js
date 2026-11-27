/* =========================================================
   王智 · 工业设计作品集 — 交互脚本
   ---------------------------------------------------------
   1. 工具函数
   2. 图片容错（失败重试一次）
   3. 滚动渐显 / 数字滚动
   4. 作品渲染（精选 + 网格 + 筛选）
   5. 灯箱（键盘、滑动、焦点管理、预加载、下载）
   6. 导航（滚动状态、进度、当前区块、移动端菜单）
   ========================================================= */
(function () {
  'use strict';

  const DATA = window.PORTFOLIO || { categories: [], projects: [] };
  const PROJECTS = DATA.projects || [];
  const CATS = DATA.categories || [];
  const CAT_LABEL = Object.fromEntries(CATS.map((c) => [c.id, c.label]));

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, '0');
  const imgUrl = (name) => `assets/img/${name}.webp`;
  const thumbUrl = (name) => `assets/thumb/${name}.webp`;
  const thumbSmUrl = (name) => `assets/thumb-sm/${name}.webp`;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsIO = 'IntersectionObserver' in window;

  /* ---------------------------------------------------------
     1. 图片容错：静态服务器偶发超时时自动重试一次
     --------------------------------------------------------- */
  document.addEventListener(
    'error',
    (e) => {
      const img = e.target;
      if (!img || img.tagName !== 'IMG' || img.dataset.retried) return;
      const src = img.currentSrc || img.getAttribute('src');
      if (!src) return;
      img.dataset.retried = '1';
      window.setTimeout(() => {
        img.src = `${src}${src.includes('?') ? '&' : '?'}retry=1`;
      }, 700);
    },
    true
  );

  /* ---------------------------------------------------------
     2. 滚动渐显（同组元素依次错开）
     --------------------------------------------------------- */
  const revealOne = (el, delay = 0) => {
    el.style.transitionDelay = prefersReduced ? '0ms' : `${delay}ms`;
    el.classList.add('is-in');
  };

  const revealAll = (nodes) => {
    if (prefersReduced || !supportsIO) {
      nodes.forEach((n) => revealOne(n));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
          revealOne(el, Math.min(siblings.indexOf(el), 6) * 70);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    nodes.forEach((n) => io.observe(n));
  };

  revealAll($$('.reveal'));

  /* ---------------------------------------------------------
     3. 数字滚动
     --------------------------------------------------------- */
  const finishCount = (el) => {
    el.textContent = el.dataset.count + (el.dataset.plus ? '+' : '');
  };

  const runCount = (el) => {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.plus ? '+' : '';
    if (prefersReduced) {
      finishCount(el);
      return;
    }
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counters = $$('[data-count]');
  if (supportsIO && !prefersReduced) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          cio.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach(finishCount);
  }

  /* ---------------------------------------------------------
     4. 作品渲染
     --------------------------------------------------------- */
  const projectIndex = new Map(PROJECTS.map((p, i) => [p.id, i]));
  const isContained = (cat) => cat === 'agv' || cat === 'ui';

  const mediaAttrs = (p, src, cls) =>
    `src="${src}" alt="${p.title}" width="${p.coverW || 1600}" height="${p.coverH || 1200}" ` +
    `class="${cls}" loading="lazy" decoding="async"` +
    (p.pos ? ` style="object-position:${p.pos}"` : '');

  const featuredEl = $('#featured');
  const feats = PROJECTS.filter((p) => p.featured);
  if (featuredEl) {
    featuredEl.innerHTML = feats
      .map((p, i) => {
        const ratio = p.coverW && p.coverH ? ` style="aspect-ratio:${p.coverW}/${p.coverH}"` : '';
        return `
        <article class="feat reveal" data-project="${p.id}">
          <div class="feat__media"${ratio} role="button" tabindex="0"
               aria-haspopup="dialog" aria-label="打开 ${p.title} 图集，共 ${p.images.length} 张">
            <picture>
              <source media="(max-width:900px)" srcset="${imgUrl(p.cover + '-sm')}" />
              <img ${mediaAttrs(p, imgUrl(p.cover), 'feat__img')} />
            </picture>
            <span class="feat__num">${pad(i + 1)} / ${pad(feats.length)}</span>
          </div>
          <div class="feat__body">
            <div class="feat__meta">
              <span>${CAT_LABEL[p.cat] || ''}</span><span class="dot" aria-hidden="true"></span><span>${p.year}</span>
            </div>
            <h3 class="feat__title">${p.title}</h3>
            <p class="feat__desc">${p.desc}</p>
            <ul class="feat__tags">${(p.tags || []).map((t) => `<li>${t}</li>`).join('')}</ul>
            <button class="feat__link" type="button">查看 ${p.images.length} 张图 <span aria-hidden="true">→</span></button>
          </div>
        </article>`;
      })
      .join('');
    revealAll($$('#featured .reveal'));
  }

  const gridEl = $('#grid');
  const filtersEl = $('#filters');

  if (gridEl) {
    gridEl.innerHTML = PROJECTS.map((p) => {
      const mods = [isContained(p.cat) ? 'card--contain' : '', p.cat === 'ui' ? 'card--ui' : ''].join(' ');
      return `
      <article class="card${mods ? ' ' + mods : ''}" data-cat="${p.cat}" data-project="${p.id}"
               tabindex="0" role="button" aria-haspopup="dialog"
               aria-label="打开 ${p.title} 图集，共 ${p.images.length} 张">
        <div class="card__media">
          <picture>
            <source media="(max-width:560px)" srcset="${thumbSmUrl(p.cover)}" />
            <img ${mediaAttrs(p, thumbUrl(p.cover), 'card__img')} />
          </picture>
          <span class="card__overlay" aria-hidden="true"></span>
          <span class="card__count" aria-hidden="true">${p.images.length} 图</span>
        </div>
        <div class="card__info">
          <div>
            <span class="card__idx mono" aria-hidden="true">P—${pad(projectIndex.get(p.id) + 1)}</span>
            <h3 class="card__title">${p.title}</h3>
            <p class="card__sub">${p.subtitle || CAT_LABEL[p.cat] || ''}</p>
          </div>
          <span class="card__year">${p.year || ''}</span>
        </div>
      </article>`;
    }).join('');
  }

  const counts = { all: PROJECTS.length };
  PROJECTS.forEach((p) => (counts[p.cat] = (counts[p.cat] || 0) + 1));

  if (filtersEl) {
    filtersEl.innerHTML = CATS.filter((c) => c.id === 'all' || counts[c.id])
      .map(
        (c) => `<button type="button" data-cat="${c.id}"
                  class="${c.id === 'all' ? 'is-active' : ''}"
                  aria-pressed="${c.id === 'all'}"
                  aria-label="${c.label}，${counts[c.id] || 0} 个">` +
          `<span class="f-full">${c.label}</span>` +
          `<span class="f-short">${c.short || c.label}</span>` +
          `<span class="count" aria-hidden="true">${counts[c.id] || 0}</span></button>`
      )
      .join('');

    filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-cat]');
      if (!btn) return;
      const cat = btn.dataset.cat;
      $$('button', filtersEl).forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      $$('.card', gridEl).forEach((card) => {
        card.classList.toggle('is-hidden', cat !== 'all' && card.dataset.cat !== cat);
      });
    });
  }

  /* ---------------------------------------------------------
     5. 灯箱
     --------------------------------------------------------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbTitle = $('#lbTitle');
  const lbDesc = $('#lbDesc');
  const lbCat = $('#lbCat');
  const lbCaption = $('#lbCaption');
  const lbCounter = $('#lbCounter');
  const lbThumbs = $('#lbThumbs');
  const lbPrev = $('#lbPrev');
  const lbNext = $('#lbNext');
  const lbClose = $('#lbClose');
  const lbDownload = $('#lbDownload');

  const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const inertTargets = () => [$('#nav'), $('main'), $('.footer'), $('.skip-link')].filter(Boolean);

  let current = null;
  let index = 0;
  let lastFocus = null;

  const preload = (name) => {
    if (!name) return;
    const i = new Image();
    i.src = imgUrl(name);
  };

  function show(i) {
    if (!current) return;
    const total = current.images.length;
    index = ((i % total) + total) % total;
    const name = current.images[index];
    const url = imgUrl(name);

    lbImg.style.opacity = '0';
    const pre = new Image();
    pre.onload = () => {
      lbImg.src = pre.src;
      lbImg.alt = `${current.title} — 第 ${index + 1} 张，共 ${total} 张`;
      lbImg.style.opacity = '1';
    };
    pre.src = url;

    if (lbDownload) {
      lbDownload.href = url;
      lbDownload.setAttribute('download', `${current.title}-${pad(index + 1)}.webp`);
    }
    lbCaption.textContent = `${current.title} · 图 ${pad(index + 1)} / ${pad(total)}`;
    lbCounter.textContent = `${pad(index + 1)} / ${pad(total)}`;
    lbThumbs.querySelectorAll('button').forEach((b, bi) => {
      const on = bi === index;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-current', on ? 'true' : 'false');
    });
    const active = lbThumbs.children[index];
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: prefersReduced ? 'auto' : 'smooth' });

    preload(current.images[(index + 1) % total]);
    preload(current.images[(index - 1 + total) % total]);
  }

  function openProject(id) {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) return;
    current = p;
    index = 0;
    lastFocus = document.activeElement;

    lbTitle.textContent = p.title;
    lbDesc.textContent = p.desc || '';
    lbCat.textContent = `${CAT_LABEL[p.cat] || ''} · ${p.year || ''}`;
    lbThumbs.innerHTML = p.images
      .map(
        (n, i) =>
          `<button type="button" data-i="${i}" aria-label="第 ${i + 1} 张" aria-current="false">
             <img src="${thumbUrl(n)}" alt="" width="760" height="500" loading="lazy" />
           </button>`
      )
      .join('');

    lb.hidden = false;
    document.body.classList.add('is-locked');
    inertTargets().forEach((el) => (el.inert = true));
    requestAnimationFrame(() => lb.classList.add('is-open'));
    show(0);
    lbClose.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!current) return;
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    inertTargets().forEach((el) => (el.inert = false));
    const restore = lastFocus;
    current = null;
    window.setTimeout(() => {
      lb.hidden = true;
      lbImg.removeAttribute('src');
      lbThumbs.innerHTML = '';
    }, prefersReduced ? 0 : 320);
    if (restore && restore.focus) restore.focus({ preventScroll: true });
  }

  /* 灯箱内的点击：缩略图 / 关闭 / 前后 / 背景 */
  document.addEventListener('click', (e) => {
    const thumb = e.target.closest('#lbThumbs button');
    if (thumb) {
      show(Number(thumb.dataset.i));
      return;
    }
    const trigger = e.target.closest('[data-project]');
    if (trigger && lb.hidden) openProject(trigger.dataset.project);
  });

  lbPrev.addEventListener('click', () => show(index - 1));
  lbNext.addEventListener('click', () => show(index + 1));
  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => {
    const el = e.target;
    if (el === lb || el.id === 'lbStage' || el.classList.contains('lb__figure')) closeLightbox();
  });

  /* 键盘：卡片回车打开；灯箱内 ← → Esc / Tab 焦点循环 */
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) {
      const active = document.activeElement;
      const isTrigger = active && active.matches('.card, .feat__media, .feat__link');
      if (isTrigger && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const host = active.closest('[data-project]');
        if (host) openProject(host.dataset.project);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(index + 1);
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(index - 1);
      return;
    }
    if (e.key === 'Tab') {
      const nodes = $$(FOCUSABLE, lb).filter((n) => n.getClientRects().length > 0);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* 触摸滑动切换 */
  let touchStartX = 0;
  let touchStartY = 0;
  lb.addEventListener(
    'touchstart',
    (e) => {
      const t = e.changedTouches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    },
    { passive: true }
  );
  lb.addEventListener(
    'touchend',
    (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) show(index + (dx < 0 ? 1 : -1));
    },
    { passive: true }
  );

  /* ---------------------------------------------------------
     6. 导航
     --------------------------------------------------------- */
  const nav = $('#nav');
  const progressBar = $('#progressBar');
  const navAnchors = $$('[data-nav]');
  const sections = ['about', 'timeline', 'capability', 'work', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 24);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = max > 0 ? `${(y / max) * 100}%` : '0%';

    const probe = y + window.innerHeight * 0.32;
    let activeId = '';
    sections.forEach((s) => {
      if (s.offsetTop <= probe) activeId = s.id;
    });
    navAnchors.forEach((a) => {
      const on = a.getAttribute('href') === `#${activeId}`;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* 移动端菜单 */
  const burger = $('#burger');
  const navLinks = $('#navLinks');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  };

  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      setMenu(false);
      burger.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) setMenu(false);
  });

  $('#year').textContent = new Date().getFullYear();
})();
