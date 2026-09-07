/* script.js — Vanilla JS for reveal animations, header scroll state, and library search */

// Scroll-triggered reveals using IntersectionObserver
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach((el) => {
    observer.observe(el);
  });
})();

// Library button navigation: make the Library dropdown button clickable
(function() {
  const dropBtn = document.querySelector('.dropbtn');
  if (!dropBtn) return;

  dropBtn.addEventListener('click', function(e) {
    // Determine the base URL for library.html
    const currentPath = window.location.pathname;
    let libraryUrl = 'library.html';
    
    if (currentPath.includes('/figures/') || currentPath.includes('/elements/')) {
      libraryUrl = '../library.html';
    }
    
    window.location.href = libraryUrl;
  });
})();

// Mobile nav toggle: opens/closes the header nav on small screens
(function() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function() {
    const open = nav.classList.toggle('nav--open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav--open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// Header scroll-state: add .site-header--scrolled class when scrolled past threshold
(function() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;
  const threshold = 10;

  function updateHeaderState() {
    const scrolled = window.scrollY > threshold;
    if (scrolled) {
      header.classList.add('site-header--scrolled');
    } else {
      header.classList.remove('site-header--scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeaderState);
      ticking = true;
    }
  }, { passive: true });
})();

// Shared skill index (search-data.json) loader, used by both the
// autocomplete dropdowns below and the search-results page. Paths in the
// index are root-relative; from inside figures/ or elements/ they need a
// "../" prefix, same trick the header dropdown/library-button code uses.
function swaySkillsBasePath() {
  const p = window.location.pathname;
  return (p.includes('/figures/') || p.includes('/elements/')) ? '../' : '';
}
function swayLoadSkills() {
  if (window.__swaySkillsPromise) return window.__swaySkillsPromise;
  window.__swaySkillsPromise = fetch(swaySkillsBasePath() + 'search-data.json')
    .then((res) => res.json())
    .catch((err) => { console.error('Failed to load search index:', err); return []; });
  return window.__swaySkillsPromise;
}

// Autocomplete dropdown: attaches to every .search-form__field on the page
// (the library hero search, the header's compact nav-search, etc). Shows up
// to 6 matches as the visitor types, capped to a scrollable ~4-item-tall
// panel (see .search-suggest max-height) so it never sprawls; Enter/the
// search icon still submits the form normally (to search.html) for the
// full results.
(function() {
  const fields = document.querySelectorAll('.search-form__field');
  if (!fields.length) return;

  const base = swaySkillsBasePath();

  fields.forEach((field) => {
    const input = field.querySelector('.search-input, input[type="search"]');
    if (!input) return;

    const suggest = document.createElement('div');
    suggest.className = 'search-suggest';
    suggest.setAttribute('role', 'listbox');
    field.appendChild(suggest);

    let items = [];
    let activeIndex = -1;

    function close() {
      suggest.classList.remove('is-open');
      suggest.innerHTML = '';
      items = [];
      activeIndex = -1;
    }

    function render(matches) {
      suggest.innerHTML = '';
      matches.forEach((item) => {
        const a = document.createElement('a');
        a.className = 'search-suggest__item';
        a.setAttribute('role', 'option');
        a.href = base + item.url;
        const title = document.createElement('span');
        title.textContent = item.title;
        const cat = document.createElement('span');
        cat.className = 'search-suggest__cat';
        cat.textContent = item.category;
        a.appendChild(title);
        a.appendChild(cat);
        suggest.appendChild(a);
      });
      items = Array.from(suggest.querySelectorAll('.search-suggest__item'));
      activeIndex = -1;
      suggest.classList.toggle('is-open', items.length > 0);
    }

    function setActive(i) {
      items.forEach((el) => el.classList.remove('is-active'));
      if (items[i]) {
        items[i].classList.add('is-active');
        items[i].scrollIntoView({ block: 'nearest' });
      }
      activeIndex = i;
    }

    input.addEventListener('input', () => {
      const query = input.value.toLowerCase().trim();
      if (!query) { close(); return; }
      swayLoadSkills().then((skills) => {
        const matches = skills.filter((s) => (s.title + ' ' + s.category).toLowerCase().includes(query)).slice(0, 6);
        render(matches);
      });
    });

    input.addEventListener('keydown', (e) => {
      if (!items.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((activeIndex + 1) % items.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((activeIndex - 1 + items.length) % items.length); }
      else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); items[activeIndex].click(); }
      else if (e.key === 'Escape') { close(); }
    });

    input.addEventListener('blur', () => {
      // let a click on a suggestion register before it disappears
      setTimeout(close, 150);
    });
  });
})();

// Search-results page (search.html only): reads ?q= and renders every
// matching skill as a gallery of .card links.
(function() {
  const grid = document.getElementById('results-gallery');
  const meta = document.getElementById('results-meta');
  const empty = document.getElementById('results-empty');
  if (!grid) return;

  const query = (new URLSearchParams(window.location.search).get('q') || '').trim();
  const input = document.querySelector('.search-bar-top .search-input');
  if (input && query) input.value = query;

  if (!query) {
    if (meta) meta.textContent = 'Type something above to search the library.';
    return;
  }

  swayLoadSkills().then((skills) => {
    const q = query.toLowerCase();
    const matches = skills.filter((s) => (s.title + ' ' + s.category).toLowerCase().includes(q));

    if (meta) meta.textContent = `${matches.length} result${matches.length === 1 ? '' : 's'} for “${query}”`;
    if (matches.length === 0) {
      if (empty) empty.hidden = false;
      return;
    }

    matches.forEach((item, idx) => {
      const a = document.createElement('a');
      // dynamically-inserted cards skip .reveal — the page-load
      // IntersectionObserver already ran before these existed, so they'd
      // otherwise sit at opacity:0 forever
      a.className = 'card';
      a.style.setProperty('--card-index', idx);
      a.href = item.url;

      const titleSpan = document.createElement('div');
      titleSpan.className = 'card__title';
      titleSpan.textContent = item.title;

      const cat = document.createElement('div');
      cat.className = 'card__category';
      cat.textContent = item.category;

      a.appendChild(titleSpan);
      a.appendChild(cat);
      grid.appendChild(a);
    });
  });
})();

// Library media strip (library.html only): auto-drifts, pauses on hover, and
// can be dragged left/right (mouse or touch) to browse manually. Driven by a
// single rAF loop that owns the track's transform, rather than a CSS
// animation, so the drag and the idle drift never fight over the property.
(function() {
  const strip = document.querySelector('.media-strip');
  const track = strip ? strip.querySelector('.media-strip__track') : null;
  if (!strip || !track) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEED = 0.035; // px per ms of idle auto-drift

  let offset = 0;
  let halfWidth = track.scrollWidth / 2;
  let hovering = false;
  let dragging = false;
  let dragStartX = 0;
  let dragStartOffset = 0;
  let dragMoved = false; // true once a drag has moved far enough to not count as a click
  let last = null;

  function wrap(v) {
    if (halfWidth <= 0) return v;
    v = v % halfWidth;
    if (v > 0) v -= halfWidth;
    return v;
  }

  function apply() {
    track.style.transform = `translateX(${offset}px)`;
  }

  function frame(now) {
    if (last === null) last = now;
    const dt = now - last;
    last = now;
    if (!dragging && !hovering && !reduceMotion) {
      offset = wrap(offset - SPEED * dt);
      apply();
    }
    requestAnimationFrame(frame);
  }

  strip.addEventListener('mouseenter', () => { hovering = true; });
  strip.addEventListener('mouseleave', () => { hovering = false; });

  function startDrag(x) {
    dragging = true;
    dragMoved = false;
    dragStartX = x;
    dragStartOffset = offset;
    strip.classList.add('media-strip--dragging');
  }
  function moveDrag(x) {
    if (!dragging) return;
    if (Math.abs(x - dragStartX) > 6) dragMoved = true;
    offset = wrap(dragStartOffset + (x - dragStartX));
    apply();
  }
  function endDrag() {
    dragging = false;
    strip.classList.remove('media-strip--dragging');
  }

  strip.addEventListener('mousedown', (e) => { startDrag(e.clientX); e.preventDefault(); });
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX));
  window.addEventListener('mouseup', endDrag);

  strip.addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) startDrag(t.clientX); }, { passive: true });
  strip.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) moveDrag(t.clientX); }, { passive: true });
  strip.addEventListener('touchend', endDrag);

  // A drag that actually moved shouldn't also register as a click-through to
  // one of the figure links underneath the pointer.
  strip.addEventListener('click', (e) => {
    if (dragMoved) {
      e.preventDefault();
      e.stopPropagation();
      dragMoved = false;
    }
  }, true);

  // Images have no explicit width, so scrollWidth is only accurate once
  // they've actually loaded.
  window.addEventListener('load', () => { halfWidth = track.scrollWidth / 2; });
  window.addEventListener('resize', () => { halfWidth = track.scrollWidth / 2; }, { passive: true });

  requestAnimationFrame(frame);
})();

// Pool water simulation (index.html only): renders a clear, textured water surface
// to <canvas id="pool-water"> using a classic two-buffer ripple/wave algorithm
// (each cell's next height = average of its neighbours' current height minus
// its own height two frames ago, then damped). The surface height field is
// also used to "relight" a procedural still-water texture each frame, faking
// refraction so passing ripples visibly distort it — rather than drawing flat
// expanding circles. Cursor/touch movement injects a splash into the field.
(function() {
  const canvas = document.getElementById('pool-water');
  const pool = document.getElementById('pool-bg');
  if (!canvas || !pool) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CELL = 6; // simulated px per cell, before upscaling to the real canvas
  const MAX_COLS = 260;
  const MAX_ROWS = 170;

  let cols, rows, displayW, displayH;
  let heightsA, heightsB; // wave height fields; swapped each simulation step
  let bufferCanvas, bufferCtx, frame;
  let timeT = 0; // slow-moving clock, animates the water even with no ripples

  // Pool-water color palette.
  const DEEP = [138, 196, 217];
  const SHALLOW = [206, 241, 247];
  const REFRACT = 3.2; // how strongly ripple slope displaces the sampled floor

  function drawVignette() {
    const cx = displayW / 2, cy = displayH / 2;
    const diag = Math.hypot(cx, cy);
    const grad = ctx.createRadialGradient(cx, cy, diag * 0.5, cx, cy, diag * 1.1);
    grad.addColorStop(0, 'rgba(4, 26, 34, 0)');
    grad.addColorStop(1, 'rgba(4, 26, 34, 0.22)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, displayW, displayH);
  }

  function resize() {
    displayW = pool.clientWidth;
    displayH = pool.clientHeight;
    canvas.width = displayW;
    canvas.height = displayH;

    cols = Math.min(MAX_COLS, Math.max(40, Math.round(displayW / CELL)));
    rows = Math.min(MAX_ROWS, Math.max(30, Math.round(displayH / CELL)));

    heightsA = new Float32Array(cols * rows);
    heightsB = new Float32Array(cols * rows);

    bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = cols;
    bufferCanvas.height = rows;
    bufferCtx = bufferCanvas.getContext('2d');
    frame = bufferCtx.createImageData(cols, rows);
    for (let i = 3; i < frame.data.length; i += 4) frame.data[i] = 255; // opaque

  }

  // Disturb the height field near (clientX, clientY) with a small falloff radius.
  function splash(clientX, clientY, strength, radius) {
    const rect = pool.getBoundingClientRect();
    const gx = Math.round(((clientX - rect.left) / rect.width) * cols);
    const gy = Math.round(((clientY - rect.top) / rect.height) * rows);
    radius = radius || 2;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = gx + dx, y = gy + dy;
        if (x <= 0 || y <= 0 || x >= cols - 1 || y >= rows - 1) continue;
        const falloff = 1 - Math.hypot(dx, dy) / (radius + 1);
        if (falloff <= 0) continue;
        heightsA[y * cols + x] += strength * falloff;
      }
    }
  }

  // Pointer movement creates small overlapping ripples. Throttling keeps the
  // effect delicate instead of turning fast cursor movement into a splash.
  let pointerX = null, pointerY = null;
  let lastRipple = 0;
  const RIPPLE_INTERVAL = 42;
  const MIN_MOVE = 4;

  function handleMove(clientX, clientY) {
    const now = performance.now();
    const moved = pointerX === null ? Infinity : Math.hypot(clientX - pointerX, clientY - pointerY);
    if (moved >= MIN_MOVE && now - lastRipple >= RIPPLE_INTERVAL) {
      splash(clientX, clientY, 2.6, 1);
      lastRipple = now;
    }
    pointerX = clientX;
    pointerY = clientY;
  }

  // One physics step of the wave equation, with damping.
  function step() {
    for (let y = 1; y < rows - 1; y++) {
      const row = y * cols;
      for (let x = 1; x < cols - 1; x++) {
        const i = row + x;
        let val = (heightsA[i - cols] + heightsA[i + cols] + heightsA[i - 1] + heightsA[i + 1]) / 2 - heightsB[i];
        val -= val / 22;
        heightsB[i] = val;
      }
    }
    const tmp = heightsA; heightsA = heightsB; heightsB = tmp;
  }

  // Paint the low-res buffer, then stretch it onto the real canvas (the
  // smoothing on upscale is what gives the water its soft, liquid look).
  // The water texture is evaluated at a position displaced by the local
  // ripple slope, creating soft refraction without a visible background grid.
  function render() {
    const data = frame.data;
    for (let y = 0; y < rows; y++) {
      const row = y * cols;
      for (let x = 0; x < cols; x++) {
        const i = row + x;
        const dx = (x > 0 && x < cols - 1) ? heightsA[i + 1] - heightsA[i - 1] : 0;
        const dy = (y > 0 && y < rows - 1) ? heightsA[i + cols] - heightsA[i - cols] : 0;

        let sx = x + Math.max(-8, Math.min(8, dx * REFRACT));
        let sy = y + Math.max(-8, Math.min(8, dy * REFRACT));
        if (sx < 0) sx = 0; else if (sx > cols - 1) sx = cols - 1;
        if (sy < 0) sy = 0; else if (sy > rows - 1) sy = rows - 1;
        const u = sx / cols, v = sy / rows;

        let n = 0.5 + 0.5 * Math.sin(u * 9 + v * 5.5 + timeT);
        n += 0.5 + 0.5 * Math.sin(u * 3.2 - v * 8.4 + 1.4 - timeT * 0.7);
        n += 0.4 * (0.5 + 0.5 * Math.sin((u + v) * 13.5 + timeT * 1.3));
        n /= 2.4;
        let r = DEEP[0] + (SHALLOW[0] - DEEP[0]) * n;
        let g = DEEP[1] + (SHALLOW[1] - DEEP[1]) * n;
        let b = DEEP[2] + (SHALLOW[2] - DEEP[2]) * n;

        const lightMul = 1 + Math.max(-0.2, Math.min(0.24, (dx + dy) * 0.026));
        const p = i * 4;
        data[p] = r * lightMul;
        data[p + 1] = g * lightMul;
        data[p + 2] = b * lightMul;
      }
    }
    bufferCtx.putImageData(frame, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(bufferCanvas, 0, 0, cols, rows, 0, 0, displayW, displayH);
    drawVignette();
  }

  function loop(now) {
    timeT += 0.006;
    step();
    render();
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  if (reduceMotion) {
    render(); // one still, textured frame — no physics loop, no splashes
    return;
  }

  loop(0);

  window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (t) handleMove(t.clientX, t.clientY);
  }, { passive: true });

  // Right-click: a single big, deliberate splash instead of the browser menu.
  // Triggered on mousedown (button 2) rather than solely on 'contextmenu' so
  // the splash always fires even if something else on the page ends up
  // handling/suppressing the context menu event itself.
  window.addEventListener('mousedown', (e) => {
    if (e.button === 2) splash(e.clientX, e.clientY, 17, 3);
  });
  window.addEventListener('contextmenu', (e) => e.preventDefault());
})();
