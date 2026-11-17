/* =========================================================
   아이콘랩 강사 소개 페이지 - 동작
   외부 라이브러리 없이 기본 JavaScript만 사용해요.
   ========================================================= */

// JS가 켜져 있다는 표시 (스크롤 등장 효과용) - 화면이 그려지기 전에 붙여요
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 햄버거 메뉴 ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '메뉴 열기');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- 2. 스크롤하면 헤더 그림자 + 맨 위로 버튼 ---------- */
  var header = document.querySelector('.site-header');
  var toTop = document.querySelector('.to-top');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 10);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. 글자 타이핑 효과 (반복) ---------- */
  // 한 글자씩 천천히 쓰고 → 다 쓰면 2초 쉬고 → 지우고 처음부터 다시 써요.
  var TYPE_SPEED = 150;   // 한 글자 쓰는 간격 (0.15초)
  var PAUSE_AFTER = 2000; // 다 쓴 뒤 쉬는 시간 (2초)
  var typingEl = document.querySelector('[data-typing]');
  if (typingEl && !reduceMotion) {
    var fullText = typingEl.textContent;
    var i = 0;
    (function type() {
      typingEl.textContent = fullText.slice(0, i);
      if (i < fullText.length) {
        i += 1;
        setTimeout(type, TYPE_SPEED);
      } else {
        // 다 썼으면 2초 쉬었다가 처음부터
        setTimeout(function () { i = 0; type(); }, PAUSE_AFTER);
      }
    })();
  }

  /* ---------- 4. 숫자 올라가기 ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion) { el.textContent = target.toLocaleString('ko-KR'); return; }
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // 처음엔 빠르게, 끝엔 천천히
      el.textContent = Math.round(target * eased).toLocaleString('ko-KR');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- 5. 스크롤하면 서서히 나타나기 ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var counters = document.querySelectorAll('[data-count]');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el, idx) {
      // 같은 줄의 카드는 살짝 시간차를 두고 등장
      el.style.transitionDelay = (idx % 4) * 0.08 + 's';
      revealObserver.observe(el);
    });

    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) {
      el.textContent = '0';
      countObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 6. 이메일 주소 조합 (스팸 수집 방지) ---------- */
  // 코드에 이메일이 통째로 적혀 있지 않고, 화면에서만 조합돼요.
  document.querySelectorAll('[data-email-user]').forEach(function (el) {
    var address = el.getAttribute('data-email-user') + '@' + el.getAttribute('data-email-domain');
    if (el.tagName === 'A') {
      el.setAttribute('href', 'mailto:' + address);
      el.setAttribute('aria-label', '이메일 보내기: ' + address);
    } else if (el.hasAttribute('data-email-text')) {
      el.textContent = address;
    }
  });

  /* ---------- 7. 푸터 연도 자동 ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
});
