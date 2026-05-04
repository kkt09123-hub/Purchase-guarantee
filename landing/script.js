/* ============================================================
   구매보증 랜딩페이지 — script.js
   ============================================================ */

/* ---------- T16: Navbar 스크롤 효과 ---------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ---------- 모바일 메뉴 ---------- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuClose = document.getElementById('mobileMenuClose');

hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
mobileMenuClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
function closeMobileMenu() { mobileMenu.classList.remove('open'); }

/* ---------- Hero 비디오 fallback ---------- */
const heroVideo = document.querySelector('.hero-video');
const heroBgFallback = document.getElementById('heroBgFallback');

function showHeroFallback() {
  if (!heroVideo || !heroBgFallback) return;
  heroVideo.style.display = 'none';
  heroBgFallback.style.display = 'block';
}

if (heroVideo) {
  heroVideo.addEventListener('error', showHeroFallback);
  const heroSource = heroVideo.querySelector('source');
  if (heroSource) heroSource.addEventListener('error', showHeroFallback);
  window.addEventListener('load', () => {
    if (heroVideo.readyState === 0) showHeroFallback();
  });
}

/* ---------- Hero Rotator (1싸이클, 1.4s 간격, 3번째에서 멈춤) ---------- */
(function heroRotator() {
  const wrap = document.getElementById('heroRotator');
  if (!wrap) return;
  const items = wrap.querySelectorAll('.rotator-item');
  if (items.length < 2) return;
  const interval = 1400;     // 1.4s
  const startDelay = 850;    // 0.45s 진입 + 0.4s 노출 후 다음으로
  let i = 0;
  function next() {
    items[i].classList.remove('is-active');
    i = (i + 1);
    if (i >= items.length) return; // 마지막 문구 유지 후 종료
    items[i].classList.add('is-active');
    setTimeout(next, interval);
  }
  setTimeout(next, startDelay);
})();

/* ---------- Process — 섹션 진입 시 1회 자동 게이지바 트리거 ---------- */
(function processGaugeTrigger() {
  const stepsWrap = document.getElementById('processSteps');
  if (!stepsWrap) return;
  const steps = stepsWrap.querySelectorAll('.step');
  if (!steps.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // 모든 카드에 동시에 클래스 부여 — CSS에서 nth-child stagger
      steps.forEach(s => s.classList.add('is-played'));
      io.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  io.observe(stepsWrap);
})();

/* ---------- Benefits 신뢰 패널 — trust-tile stagger reveal ---------- */
(function trustTileStagger() {
  const panel = document.getElementById('benefitsTrust');
  if (!panel) return;
  const tiles = panel.querySelectorAll('.trust-tile');
  if (!tiles.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      tiles.forEach((tile, idx) => {
        setTimeout(() => tile.classList.add('is-revealed'), idx * 100);
      });
      io.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  io.observe(panel);
})();

/* ---------- Benefits — CountUp 애니메이션 ---------- */
function countUp(el, target, duration = 1000) {
  const start = performance.now();
  const suffix = el.dataset.suffix || '';
  const isFloat = target % 1 !== 0;
  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const v = isFloat ? (target * eased).toFixed(1) : Math.floor(target * eased);
    el.textContent = v + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const benefitObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target.querySelector('[data-count]');
    if (el && !el.dataset.counted) {
      el.dataset.counted = '1';
      countUp(el, parseFloat(el.dataset.count));
    }
    benefitObserver.unobserve(e.target);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.benefit-item').forEach(el => benefitObserver.observe(el));

/* ---------- T15: Stagger Scroll Reveal ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ---------- T18: CTA → Form smooth scroll ---------- */
document.querySelectorAll('a[href="#form"]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ---------- T17: FAQ 아코디언 ---------- */
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ---------- T20: 폼 제출 (GAS 연동) ---------- */
const GAS_URL = 'YOUR_GAS_WEB_APP_URL'; // Phase 4에서 교체

const form = document.getElementById('contactForm');
const formResult = document.getElementById('formResult');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // 기본 유효성 검사
  const required = form.querySelectorAll('[required]');
  let valid = true;
  required.forEach(field => {
    if (field.type === 'checkbox' && !field.checked) {
      field.closest('.form-privacy').style.color = '#dc2626';
      valid = false;
    } else if (field.type !== 'checkbox' && !field.value.trim()) {
      field.style.borderColor = '#dc2626';
      valid = false;
    } else {
      field.style.borderColor = '';
      if (field.type === 'checkbox') {
        field.closest('.form-privacy').style.color = '';
      }
    }
  });
  if (!valid) {
    showResult('error', '필수 항목을 모두 입력해 주세요.');
    return;
  }

  const submitBtn = form.querySelector('.form-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = '전송 중...';

  const data = {
    name:    form.querySelector('[name="name"]').value.trim(),
    company: form.querySelector('[name="company"]').value.trim(),
    bizno:   form.querySelector('[name="bizno"]').value.trim(),
    phone:   form.querySelector('[name="phone"]').value.trim(),
    year:    form.querySelector('[name="year"]').value.trim(),
    revenue: form.querySelector('[name="revenue"]').value,
    items:   form.querySelector('[name="items"]').value.trim(),
    timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
  };

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    form.reset();
    showResult('success', '✓ 상담 신청이 완료되었습니다. 담당자가 빠른 시일 내 연락드리겠습니다.');
  } catch {
    showResult('error', '전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '상담 신청하기 →';
  }
});

function showResult(type, msg) {
  formResult.textContent = msg;
  formResult.className = `form-result ${type}`;
  formResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ---------- 개업연도 최대값 동적 설정 ---------- */
const yearInput = document.getElementById('f-year');
if (yearInput) yearInput.max = new Date().getFullYear();

/* ---------- 사업자번호 자동 포맷 ---------- */
const biznoInput = document.getElementById('f-bizno');
if (biznoInput) {
  biznoInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 3 && v.length <= 5) v = v.slice(0,3) + '-' + v.slice(3);
    else if (v.length > 5) v = v.slice(0,3) + '-' + v.slice(3,5) + '-' + v.slice(5,10);
    e.target.value = v;
  });
}

/* ---------- 연락처 자동 포맷 ---------- */
const phoneInput = document.getElementById('f-phone');
if (phoneInput) {
  phoneInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 3 && v.length <= 7) v = v.slice(0,3) + '-' + v.slice(3);
    else if (v.length > 7) v = v.slice(0,3) + '-' + v.slice(3,7) + '-' + v.slice(7,11);
    e.target.value = v;
  });
}

/* ---------- A: 마그네틱 CTA ---------- */
(function magneticCTA() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  document.querySelectorAll('.is-magnetic').forEach(btn => {
    const MAX_SHIFT = 8;    // 버튼 최대 이동 px
    const INNER_RATIO = 0.5; // 내부 텍스트 이동 배율
    const RADIUS = 60;      // 반응 반경 (버튼 경계 + N px)

    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // 버튼 경계에서 RADIUS 밖이면 무시
      const halfW = rect.width / 2 + RADIUS;
      const halfH = rect.height / 2 + RADIUS;
      if (Math.abs(dx) > halfW || Math.abs(dy) > halfH) return;

      // 중심 거리 0~1 정규화 (중심에 가까울수록 1)
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.sqrt(halfW * halfW + halfH * halfH);
      const intensity = 1 - Math.min(dist / maxDist, 1);

      const tx = (dx / maxDist) * MAX_SHIFT * intensity * 2;
      const ty = (dy / maxDist) * MAX_SHIFT * intensity * 2;

      btn.style.transform = `translate(${tx}px, ${ty}px)`;

      // 내부 span/after 깊이감 — btn 자체 이동의 절반 반대 방향은 주지 않고, 같은 방향 절반
      // 내부 요소는 ::after(화살표)를 직접 제어 불가하므로 btn 내 텍스트 노드 없음.
      // data-inner 로 내부 wrap이 있으면 처리, 없으면 생략
      const inner = btn.querySelector('[data-magnetic-inner]');
      if (inner) inner.style.transform = `translate(${tx * INNER_RATIO}px, ${ty * INNER_RATIO}px)`;
    });

    btn.addEventListener('pointerleave', () => {
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      btn.style.transform = 'translate(0, 0)';
      setTimeout(() => { btn.style.transition = ''; }, 420);

      const inner = btn.querySelector('[data-magnetic-inner]');
      if (inner) {
        inner.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        inner.style.transform = 'translate(0, 0)';
        setTimeout(() => { inner.style.transition = ''; }, 420);
      }
    });
  });
})();

/* ---------- B: 스크롤 진행바 ---------- */
(function scrollProgressBar() {
  const bar = document.getElementById('scroll-bar');
  if (!bar) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    // reduced-motion: 즉시 width 변경, transition 없음
    bar.style.transition = 'none';
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      bar.style.width = pct + '%';
      ticking = false;
    });
  }, { passive: true });
})();

/* ---------- E: Pain Point 인용구 stagger + border growUp ---------- */
(function painPointReveal() {
  const items = document.querySelectorAll('.pain-problem-item');
  if (!items.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STAGGER = 200; // ms 간격

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      items.forEach((item, idx) => {
        const delay = reduced ? 0 : idx * STAGGER;
        item.style.animationDelay = delay + 'ms';
        item.style.setProperty('--border-delay', delay + 'ms');
        item.classList.add('is-pain-visible');
      });

      io.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  // 첫 번째 아이템 기준으로 관찰 (3개가 같은 컨테이너 내 순차)
  io.observe(items[0]);
})();
