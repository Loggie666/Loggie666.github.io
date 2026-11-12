(function () {
  'use strict';
  window.__APP_READY = true;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. nav: 滚动加背景 ---------- */
  var nav = $('#nav');
  var onScroll = function () {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 2. 移动端菜单 ---------- */
  var toggle = $('.nav-toggle');
  var panel = $('#nav-panel');
  if (toggle && panel) {
    var setOpen = function (open) {
      panel.dataset.open = open ? 'true' : 'false';
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    };
    toggle.addEventListener('click', function () {
      setOpen(panel.dataset.open !== 'true');
    });
    $$('a', panel).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.dataset.open === 'true') setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) setOpen(false);
    });
  }

  /* ---------- 3. 渐入 ---------- */
  var items = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 4. 当前区块高亮 ---------- */
  var links = $$('.nav-links a');
  var sections = links.map(function (a) {
    var id = a.getAttribute('href');
    return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
  }).filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + en.target.id;
          if (on) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 5. 图谱灯箱 ---------- */
  var lb = $('#lb');
  var frame = $('.map-frame');
  if (lb && frame && typeof lb.showModal === 'function') {
    var lbImg = $('img', lb);
    frame.addEventListener('click', function () {
      lbImg.src = frame.getAttribute('data-lightbox');
      lb.showModal();
    });
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb) lb.close(); /* 点背景关闭 */
    });
  } else if (frame) {
    /* 不支持 dialog 的浏览器：直接开新窗口看大图 */
    frame.addEventListener('click', function () {
      window.open(frame.getAttribute('data-lightbox'), '_blank', 'noopener');
    });
  }

  /* ---------- 6. 复制 ---------- */
  $$('.copy').forEach(function (btn) {
    if (btn.tagName === 'A') return;
    var original = btn.textContent;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var done = function () {
        btn.dataset.done = 'true';
        btn.textContent = '已复制';
        setTimeout(function () {
          btn.dataset.done = 'false';
          btn.textContent = original;
        }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
  });

  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* 忽略 */ }
    document.body.removeChild(ta);
  }

  /* ---------- 7. 回到顶部 ---------- */
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    toTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', location.pathname);
    });
  }
})();
