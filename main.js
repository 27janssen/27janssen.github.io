/* ═══════════════════════════════════════════════════════════════
   FIBONACCI / GOLDEN RATIO CANVAS
   Full-viewport, scroll-driven. Draws:
     1. A living golden spiral that grows as you scroll
     2. Fibonacci rectangles subdividing the viewport
     3. Floating golden-angle phyllotaxis bloom (seeds)
     4. Ambient mathematical text whispers
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('math-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const PHI = (1 + Math.sqrt(5)) / 2;         // 1.6180339…
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // 137.5°

  let W, H, dpr, scrollProgress = 0, animFrame = 0;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  function getScrollProgress() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    return docH > 0 ? Math.min(window.scrollY / docH, 1) : 0;
  }
  window.addEventListener('scroll', () => { scrollProgress = getScrollProgress(); }, { passive: true });

  /* ── 1. Fibonacci rectangles (golden ratio grid ghost) ── */
  function drawFibGrid(alpha) {
    const isLight = document.body.classList.contains('light');
    const col = isLight ? '120,80,16' : '200,169,110';

    // Start from top-left, subdivide by golden ratio iteratively
    ctx.save();
    ctx.globalAlpha = alpha * 0.06;

    let x = 0, y = 0, w = W, h = H;
    for (let i = 0; i < 10; i++) {
      ctx.strokeStyle = `rgba(${col},1)`;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, w, h);

      if (w > h) {
        const sq = h;
        x += sq;
        w -= sq;
      } else {
        const sq = w;
        y += sq;
        h -= sq;
      }
    }
    ctx.restore();
  }

  /* ── 2. The golden spiral ── */
  function drawGoldenSpiral(ts, scroll) {
    const isLight = document.body.classList.contains('light');
    const cx = W * 0.62, cy = H * 0.5;   // golden-ratio positioned centre

    // Spiral rotates slowly and grows with scroll
    const rotation = ts * 0.00008 + scroll * Math.PI * 0.8;
    const maxRadius = Math.min(W, H) * (0.22 + scroll * 0.14);
    const turns = 5 + scroll * 3;
    const N = Math.floor(turns * 200);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    // Glow pass
    ctx.globalAlpha = 0.08 + scroll * 0.06;
    ctx.strokeStyle = isLight ? '#7a5010' : '#C8A96E';
    ctx.lineWidth = isLight ? 6 : 8;
    ctx.filter = 'blur(6px)';
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const angle = t * turns * Math.PI * 2;
      const r = maxRadius * Math.pow(PHI, t * turns * 0.5) / Math.pow(PHI, turns * 0.5);
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Crisp pass
    ctx.filter = 'none';
    ctx.globalAlpha = 0.38 + scroll * 0.2;
    ctx.strokeStyle = isLight ? '#7a5010' : '#C8A96E';
    ctx.lineWidth = isLight ? 1.2 : 0.9;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const angle = t * turns * Math.PI * 2;
      const r = maxRadius * Math.pow(PHI, t * turns * 0.5) / Math.pow(PHI, turns * 0.5);
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.restore();
  }

  /* ── 3. Phyllotaxis bloom (sunflower seed pattern at golden angle) ── */
  function drawPhyllotaxis(ts, scroll) {
    const isLight = document.body.classList.contains('light');
    const col = isLight ? '120,80,16' : '200,169,110';

    const cx = W * 0.18, cy = H * 0.72;
    const n = Math.floor(80 + scroll * 140);
    const scale = Math.min(W, H) * (0.06 + scroll * 0.05);

    ctx.save();
    const pulse = 1 + 0.012 * Math.sin(ts * 0.0008);
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    ctx.rotate(ts * 0.00004);

    for (let i = 0; i < n; i++) {
      const t = i / n;
      const angle = i * GOLDEN_ANGLE;
      const r = scale * Math.sqrt(i / n);
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      const size = 0.8 + t * 1.6;
      const a = isLight ? (0.08 + t * 0.35) : (0.12 + t * 0.28);

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col},${a})`;
      ctx.fill();
    }
    ctx.restore();
  }

  /* ── 4. Fibonacci number whispers ── */
  const FIB_NUMS = [1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
  const MATH_SYMBOLS = ['φ','Φ','∞','∑','∂','∫','√5','π','ℝ','∀','∃','⊢','∧','λ','≡','∈'];

  const whispers = [...FIB_NUMS.map(n => String(n)), ...MATH_SYMBOLS].map(sym => ({
    sym,
    x: Math.random() * 1.1,
    y: Math.random() * 1.1,
    vx: (Math.random() - 0.5) * 0.00012,
    vy: (Math.random() - 0.5) * 0.00012,
    size: 10 + Math.random() * 22,
    baseOpacity: 0.03 + Math.random() * 0.09,
    phase: Math.random() * Math.PI * 2,
  }));

  function drawWhispers(ts) {
    const isLight = document.body.classList.contains('light');
    ctx.save();
    for (const f of whispers) {
      f.x += f.vx;
      f.y += f.vy;
      if (f.x < -0.05) f.x = 1.05;
      if (f.x > 1.05)  f.x = -0.05;
      if (f.y < -0.05) f.y = 1.05;
      if (f.y > 1.05)  f.y = -0.05;

      const opacity = f.baseOpacity * (0.7 + 0.3 * Math.sin(ts * 0.0005 + f.phase));
      const boosted = isLight ? Math.min(1, opacity * 3.5) : opacity;
      ctx.globalAlpha = boosted;
      ctx.fillStyle = isLight ? '#7a5010' : '#C8A96E';
      ctx.font = `300 ${f.size}px 'JetBrains Mono', monospace`;
      ctx.fillText(f.sym, f.x * W, f.y * H);
    }
    ctx.restore();
  }

  /* ── 5. Fibonacci rectangle spiral arcs (quarter-circles) ── */
  function drawFibArcs(ts, scroll) {
    const isLight = document.body.classList.contains('light');

    // Fibonacci sequence sizes
    const fibs = [1,1,2,3,5,8,13,21,34,55,89];
    const unit = Math.min(W, H) * (0.007 + scroll * 0.003);
    const cx = W * 0.5, cy = H * 0.5;
    const rotation = ts * 0.00005 + scroll * 0.6;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    let x = 0, y = 0;
    let dirs = [[1,0],[0,1],[-1,0],[0,-1]]; // right, down, left, up
    let prev = unit * 1;

    for (let i = 2; i < fibs.length; i++) {
      const sz = fibs[i] * unit;
      const dir = dirs[i % 4];
      const t = i / fibs.length;
      const alpha = (0.06 + t * 0.14 + scroll * 0.08);
      const col = isLight ? `rgba(120,80,16,${alpha})` : `rgba(200,169,110,${alpha})`;

      // Draw the quarter-circle arc
      ctx.beginPath();
      let arcX, arcY, startAngle, endAngle;
      // Arc origin depends on direction
      switch (i % 4) {
        case 2: arcX = x;      arcY = y + prev; startAngle = -Math.PI/2; endAngle = 0;           break;
        case 3: arcX = x - sz; arcY = y;        startAngle = 0;           endAngle = Math.PI/2;   break;
        case 0: arcX = x;      arcY = y - prev; startAngle = Math.PI/2;   endAngle = Math.PI;     break;
        case 1: arcX = x + sz; arcY = y + sz;   startAngle = Math.PI;     endAngle = 3*Math.PI/2; break;
      }
      ctx.arc(arcX, arcY, sz, startAngle, endAngle);
      ctx.strokeStyle = col;
      ctx.lineWidth = isLight ? 1.2 : 0.8;
      ctx.stroke();

      // Advance position
      x += dir[0] * sz;
      y += dir[1] * sz;
      prev = sz;
    }

    ctx.restore();
  }

  /* ── Background gradient ── */
  function drawBackground(scroll) {
    const isLight = document.body.classList.contains('light');
    const grad = ctx.createRadialGradient(
      W * (0.5 + scroll * 0.1), H * (0.4 - scroll * 0.05), 0,
      W * 0.5, H * 0.5, Math.max(W, H) * 0.9
    );
    if (isLight) {
      grad.addColorStop(0, `rgba(200,160,80,${0.08 + scroll * 0.04})`);
      grad.addColorStop(0.5, `rgba(190,140,60,${0.04})`);
      grad.addColorStop(1, 'rgba(240,232,213,0)');
    } else {
      grad.addColorStop(0, `rgba(45,27,105,${0.28 + scroll * 0.14})`);
      grad.addColorStop(0.4, `rgba(13,10,26,${0.45})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  /* ── Main render loop ── */
  function draw(ts) {
    animFrame++;
    ctx.clearRect(0, 0, W, H);

    const s = scrollProgress;

    drawBackground(s);
    drawFibGrid(0.6 + s * 0.4);
    drawWhispers(ts);
    drawPhyllotaxis(ts, s);
    drawFibArcs(ts, s);
    drawGoldenSpiral(ts, s);

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();


/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, idx) => {
      if (e.isIntersecting) {
        // Stagger siblings in the same parent
        const siblings = Array.from(e.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
        const delay = siblings.indexOf(e.target) * 80;
        setTimeout(() => {
          e.target.classList.add('visible');
        }, Math.min(delay, 400));
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06 });

  reveals.forEach(el => obs.observe(el));
})();


/* ═══════════════════════════════════════════════════════════════
   THEME TOGGLE
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    btn.textContent = document.body.classList.contains('light') ? '☀' : '☽';
  });
})();


/* ═══════════════════════════════════════════════════════════════
   ACTIVE NAV HIGHLIGHT (index.html only)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(s => obs.observe(s));
})();


/* ═══════════════════════════════════════════════════════════════
   PARALLAX POSTER EFFECT
   Sections translate subtly on scroll for ultra-poster feel
   ═══════════════════════════════════════════════════════════════ */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sections = document.querySelectorAll('section');
  if (!sections.length) return;

  function onScroll() {
    sections.forEach((sec, i) => {
      const rect = sec.getBoundingClientRect();
      const progress = 1 - (rect.top + rect.height) / (window.innerHeight + rect.height);
      const y = (progress - 0.5) * -18;
      sec.style.transform = `translateY(${y}px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();
