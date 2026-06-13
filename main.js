/* ═══════════════════════════════════════════════════
   MATH CANVAS — scroll-driven geometry animation
   Shared across index.html, reads.html, donate.html
   ═══════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('math-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, dpr, scrollProgress = 0;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  /* Torus knot parametric curve
     x(t) = (R + r*cos(q*t)) * cos(p*t)
     y(t) = (R + r*cos(q*t)) * sin(p*t)
     z(t) = r * sin(q*t)
     Projected with simple isometric-ish view.
     p,q evolve with scroll. */
  function drawTorusKnot(t_off, p, q, alpha) {
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.19;
    const r = R * 0.38;
    const N = 460;
    const cos = Math.cos, sin = Math.sin;

    ctx.save();
    ctx.globalAlpha = alpha;

    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const t2 = ((i + 1) / N) * Math.PI * 2;

      function pt(t) {
        const φ = p * t + t_off * 0.3;
        const θ = q * t;
        const x = (R + r * cos(θ)) * cos(φ);
        const y = (R + r * cos(θ)) * sin(φ);
        const z = r * sin(θ);
        return [cx + x * 0.9 - y * 0.1, cy + z * 0.9 + x * 0.3 + y * 0.2, z];
      }

      const [x1, y1, z1] = pt(t);
      const [x2, y2] = pt(t2);
      const hue = ((i / N) * 240 + t_off * 30) % 360;
      const bright = 0.5 + z1 / (r * 2) * 0.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${hue},70%,${55 + bright * 20}%,${alpha * 0.7})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.restore();
  }

  // Floating math symbols
  const symbols = ['∫','∑','∂','∇','∞','√','π','∈','∀','∃','⊂','λ','Δ','ℝ','ℂ','⊢','∧','∨','¬','⊕'];
  const floaters = symbols.map(s => ({
    sym: s,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    size: 12 + Math.random() * 18,
    opacity: 0.05 + Math.random() * 0.12,
  }));

  function drawFloaters(ts) {
    ctx.save();
    floaters.forEach(f => {
      f.x += f.vx;
      f.y += f.vy;
      if (f.x < -40) f.x = W + 40;
      if (f.x > W + 40) f.x = -40;
      if (f.y < -40) f.y = H + 40;
      if (f.y > H + 40) f.y = -40;
      ctx.globalAlpha = f.opacity * (0.7 + 0.3 * Math.sin(ts * 0.001 + f.x));
      ctx.fillStyle = '#a78bfa';
      ctx.font = `${f.size}px -apple-system, SF Pro Display, sans-serif`;
      ctx.fillText(f.sym, f.x, f.y);
    });
    ctx.restore();
  }

  // Grid of dots (topological lattice)
  function drawLattice(scroll) {
    const spacing = 60;
    const cols = Math.ceil(W / spacing) + 2;
    const rows = Math.ceil(H / spacing) + 2;
    ctx.save();
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const ox = (i - 0.5) * spacing;
        const oy = (j - 0.5) * spacing;
        const wave = Math.sin(ox * 0.015 + scroll * 4) * Math.cos(oy * 0.015 + scroll * 3);
        const dx = ox + wave * 8 * scroll;
        const dy = oy + Math.sin(ox * 0.02 + scroll * 5) * 6 * scroll;
        ctx.beginPath();
        ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${0.04 + 0.03 * Math.abs(wave)})`;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function getScrollProgress() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    return docH > 0 ? Math.min(window.scrollY / docH, 1) : 0;
  }

  window.addEventListener('scroll', () => {
    scrollProgress = getScrollProgress();
  }, { passive: true });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);
    const s = scrollProgress;
    const tOffset = ts * 0.0004;

    const grad = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, Math.max(W, H) * 0.8);
    const isLight = document.body.classList.contains('light');
    if (isLight) {
      grad.addColorStop(0, `rgba(${lerp(200,180,s)},${lerp(200,160,s)},${lerp(240,230,s)},0.7)`);
      grad.addColorStop(1, 'rgba(220,220,240,0)');
    } else {
      grad.addColorStop(0, `rgba(${lerp(20,40,s)},${lerp(10,20,s)},${lerp(60,80,s)},0.8)`);
      grad.addColorStop(1, 'rgba(0,0,10,0)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawLattice(s);
    drawFloaters(ts);

    const p = lerp(2, 3, s);
    const q = lerp(3, 5, s);
    const alpha = 0.35 + s * 0.25;
    drawTorusKnot(tOffset, p, q, alpha);
    drawTorusKnot(tOffset + Math.PI, lerp(3, 5, s), lerp(2, 3, s), alpha * 0.3);

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();


/* ═══════════════════════════════════════════════════
   SCROLL REVEAL — shared across all pages
   ═══════════════════════════════════════════════════ */
(function () {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  reveals.forEach(el => obs.observe(el));
})();


/* ═══════════════════════════════════════════════════
   THEME TOGGLE — shared across all pages
   ═══════════════════════════════════════════════════ */
(function () {
  const themeBtn = document.getElementById('theme-btn');
  if (!themeBtn) return;
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    themeBtn.textContent = document.body.classList.contains('light') ? '☀' : '☽';
  });
})();


/* ═══════════════════════════════════════════════════
   ACTIVE NAV HIGHLIGHT — index.html only
   ═══════════════════════════════════════════════════ */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const navObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(s => navObs.observe(s));
})();
