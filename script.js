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


