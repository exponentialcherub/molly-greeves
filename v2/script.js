/* ============================================================
   MOLLY GREEVES — Portfolio Site
   Vanilla JS — Tab switching, content rendering, animations
   ============================================================ */

(function () {
  'use strict';

    // ── Loader sequence ──────────────────────────────────────────
  (function runLoader() {
    const loader  = document.getElementById('loader');
    const wrapper = document.querySelector('.site-wrapper');
    if (!loader || !wrapper) return;

    const HOLD_MS = 1600;
    const FADE_MS = 700;

    setTimeout(function () {
      loader.classList.add('loader--exit');
      wrapper.classList.remove('site-wrapper--hidden');

      setTimeout(function () {
        loader.classList.add('loader--gone');
      }, FADE_MS);
    }, HOLD_MS);
  })();

  /* ── DOM refs ── */
  const cursorDot  = document.getElementById('cursorDot');
  const tabBtns    = document.querySelectorAll('.tab-btn');
  const tabPanels  = document.querySelectorAll('.tab-panel');
  const tabIndicator = document.querySelector('.tab-indicator');
  const articlesGrid = document.getElementById('articlesGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  /* ============================================================
     CUSTOM CURSOR (desktop only)
     ============================================================ */
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (hasFinePointer && cursorDot) {
    let cx = -20, cy = -20;

    document.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
      cursorDot.style.left = cx + 'px';
      cursorDot.style.top  = cy + 'px';
    });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
    });

    /* Grow dot on interactive elements */
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1.8)';
        cursorDot.style.opacity   = '0.7';
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorDot.style.opacity   = '1';
      });
    });
  } else {
    /* Touch device — restore cursor, hide dot */
    if (cursorDot) cursorDot.style.display = 'none';
  }

  /* ============================================================
     TAB SWITCHING
     ============================================================ */
  function updateIndicator(btn) {
    if (!tabIndicator) return;
    const nav     = btn.parentElement;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    tabIndicator.style.left  = (btnRect.left - navRect.left) + 'px';
    tabIndicator.style.width = btnRect.width + 'px';
  }

  function switchTab(targetId) {
    const currentPanel = document.querySelector('.tab-panel.active');
    const targetPanel  = document.getElementById(targetId);
    if (!targetPanel || currentPanel === targetPanel) return;

    /* Update button states */
    tabBtns.forEach(btn => {
      const isActive = btn.dataset.tab === targetId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    /* Move indicator */
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${targetId}"]`);
    if (activeBtn) updateIndicator(activeBtn);

    /* Crossfade panels */
    if (currentPanel) currentPanel.classList.remove('active');
    requestAnimationFrame(() => {
      targetPanel.classList.add('active');
      /* Scroll new panel to top */
      targetPanel.scrollTop = 0;
    });
  }

  /* Tab button clicks */
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  /* Site name → About */
  const siteName = document.querySelector('.site-name');
  if (siteName) {
    siteName.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('about');
    });
  }

  /* "Get in touch" CTA → Contact */
  const contactCta = document.querySelector('.contact-cta');
  if (contactCta) {
    contactCta.addEventListener('click', () => switchTab('contact'));
  }

  /* Reposition indicator on window resize */
  window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('.tab-btn.active');
    if (activeBtn) updateIndicator(activeBtn);
  });

  /* Set initial indicator position after fonts load */
  document.fonts.ready.then(() => {
    const initialBtn = document.querySelector('.tab-btn.active');
    if (initialBtn) updateIndicator(initialBtn);
  });

  /* ============================================================
     ABOUT TAB — staggered entrance animation
     ============================================================ */
  function triggerAboutAnimation() {
    const about = document.getElementById('about');
    if (!about) return;
    /* Brief delay so the tab transition completes first */
    setTimeout(() => {
      about.classList.add('about-revealed');
    }, 80);
  }

  /* Only on desktop — mobile resets all transitions via CSS */
  if (window.matchMedia('(min-width: 801px)').matches) {
    triggerAboutAnimation();
  }

  /* ============================================================
     WORK TAB — build article grid from CONTENT
     ============================================================ */
  function buildWorkGrid() {
    if (!articlesGrid || typeof CONTENT === 'undefined') return;

    /* Order: investigations first (most impressive), then features, then news */
    const allArticles = [
      ...CONTENT.investigations.map(a => ({ ...a, category: 'investigations' })),
      ...CONTENT.features.map(a => ({ ...a, category: 'features' })),
      ...CONTENT.news.map(a => ({ ...a, category: 'news' })),
    ];

    allArticles.forEach(article => {
      const card = createCard(article);
      articlesGrid.appendChild(card);
    });
  }

  function createCard(article) {
    const a = document.createElement('a');
    a.href   = article.url;
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';
    a.classList.add('article-card');
    a.dataset.category = article.category;
    a.setAttribute('role', 'listitem');
    a.setAttribute('aria-label', `${article.title} — ${article.publication}`);

    /* Determine the type badge */
    let badgeLabel, badgeClass;
    if (article.badge && article.badgeType) {
      badgeLabel = article.badge;
      badgeClass = article.badgeType; /* 'investigation' or 'campaign' */
    } else {
      const labels = {
        features:       'Feature',
        news:           'News',
        investigations: 'Investigation',
      };
      badgeLabel = labels[article.category] || '';
      badgeClass = article.category === 'features' ? 'feature'
                 : article.category === 'news'     ? 'news'
                 : 'investigation';
    }

    const imgHtml = article.image
      ? `<img class="card-img" src="${escHtml(article.image)}" alt="" loading="lazy" aria-hidden="true">`
      : '';

    const excerptHtml = article.excerpt
      ? `<p class="card-excerpt">${escHtml(article.excerpt)}</p>`
      : '';

    a.innerHTML = `
      ${imgHtml}
      <div class="card-body">
        <div class="card-meta">
          <span class="card-publication">${escHtml(article.publication)}</span>
          <span class="card-type ${escHtml(badgeClass)}">${escHtml(badgeLabel)}</span>
        </div>
        <h3 class="card-title">${escHtml(article.title)}</h3>
        ${excerptHtml}
        <span class="card-date">${escHtml(article.date)}</span>
      </div>
    `;

    return a;
  }

  /* ── Filter buttons ── */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterArticles(btn.dataset.filter);
    });
  });

  function filterArticles(filter) {
    document.querySelectorAll('.article-card').forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
    });
  }

  /* ── Sanitise helper ── */
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ============================================================
     INIT
     ============================================================ */
  buildWorkGrid();

})();
