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

// Library search filtering: client-side search over a static JSON skill index
(function() {
  const searchInput = document.querySelector('.search-input');
  const searchForm = document.querySelector('.search-form');
  const quickLinks = document.getElementById('quick-links');
  const resultsSection = document.getElementById('search-results');
  const resultsGrid = document.getElementById('search-results-grid');
  const noResultsNote = document.getElementById('search-no-results');

  if (!searchInput) return;

  // keep preventing form submission (stay on page)
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  // Skill index is loaded from search-data.json (one entry per figure/element page)
  let skills = [];
  fetch('search-data.json')
    .then((res) => res.json())
    .then((data) => { skills = data; })
    .catch((err) => console.error('Failed to load search index:', err));

  function clearResults() {
    if (resultsGrid) resultsGrid.innerHTML = '';
  }

  function showQuickLinks() {
    if (quickLinks) quickLinks.hidden = false;
    if (resultsSection) resultsSection.hidden = true;
    if (noResultsNote) noResultsNote.hidden = true;
    clearResults();
  }

  function renderResults(matches) {
    clearResults();
    if (!resultsGrid) return;

    matches.forEach((item, idx) => {
      const a = document.createElement('a');
      a.className = 'card';
      a.href = item.url;
      a.setAttribute('data-index', idx);

      // Use a simple structure: title + muted category
      const titleSpan = document.createElement('div');
      titleSpan.className = 'card__title';
      titleSpan.textContent = item.title;

      const cat = document.createElement('div');
      cat.className = 'card__category';
      cat.textContent = item.category;

      a.appendChild(titleSpan);
      a.appendChild(cat);

      resultsGrid.appendChild(a);
    });
  }

  searchInput.addEventListener('input', (e) => {
    const query = (e.target.value || '').toLowerCase().trim();

    if (!query) {
      showQuickLinks();
      return;
    }

    // filter by title or category
    const matches = skills.filter((s) => {
      const hay = (s.title + ' ' + s.category).toLowerCase();
      return hay.includes(query);
    });

    if (matches.length === 0) {
      if (quickLinks) quickLinks.hidden = true;
      if (resultsSection) resultsSection.hidden = false;
      if (noResultsNote) noResultsNote.hidden = false;
      clearResults();
    } else {
      if (quickLinks) quickLinks.hidden = true;
      if (resultsSection) resultsSection.hidden = false;
      if (noResultsNote) noResultsNote.hidden = true;
      renderResults(matches);
    }
  });
})();

// Pool water simulation (index.html only): renders a textured water surface
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
  let tileCells; // tile size in grid-cell units, set on resize
  let timeT = 0; // slow-moving clock, animates the floor even with no ripples

  // Pool-floor color palette (a "sunlit water over blue tile" look) and the
  // grout color the wobbly tile grid is blended toward.
  const DEEP = [138, 196, 217];
  const SHALLOW = [206, 241, 247];
  const GROUT = [58, 122, 138];
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

    const desiredTilePx = Math.max(34, Math.min(70, displayW / 20));
    tileCells = Math.max(4, Math.round(desiredTilePx / CELL));
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

  // Pointer tracking: a steady pulse is emitted from wherever the pointer
  // currently rests (see loop()). Movement itself triggers nothing — no
  // trail retracing the cursor's path, just ripples from its current spot.
  let pointerX = null, pointerY = null;
  let hasPointer = false;
  let lastPulse = 0;
  const PULSE_INTERVAL = 1600;

  function handleMove(clientX, clientY) {
    hasPointer = true;
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
  // Both the caustic shimmer and the tile grid are evaluated procedurally,
  // *at a position displaced by the local ripple slope* — real refraction,
  // rather than a static image just relit — so passing ripples visibly bend
  // the grid lines instead of only brightening them. A second, slower shared
  // flow field bends the whole grid as one continuous curving sheet even at
  // rest, so it never reads as a perfectly rigid square grid.
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

        // Wobbly tile grid: the whole coordinate space is bent by one shared,
        // low-frequency flow field before measuring distance to the nearest
        // grid line, so neighbouring lines curve together as one continuous
        // sheet (not each line wiggling out of sync with its neighbours).
        const warpX = 3 * Math.sin(sy * 0.012 + timeT * 0.35);
        const warpY = 3 * Math.sin(sx * 0.012 - timeT * 0.3);
        const wx = sx + warpX;
        const wy = sy + warpY;

        const li = Math.round(wx / tileCells);
        const distX = Math.abs(wx - li * tileCells);

        const lj = Math.round(wy / tileCells);
        const distY = Math.abs(wy - lj * tileCells);

        const lineDist = distX < distY ? distX : distY;
        if (lineDist < 1.3) {
          const mix = (1 - lineDist / 1.3) * 0.32;
          r += (GROUT[0] - r) * mix;
          g += (GROUT[1] - g) * mix;
          b += (GROUT[2] - b) * mix;
        }

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
    if (hasPointer && now - lastPulse > PULSE_INTERVAL) {
      splash(pointerX, pointerY, 5, 1);
      lastPulse = now;
    }
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
