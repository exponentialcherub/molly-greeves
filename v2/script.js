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
  const tabBtns    = document.querySelectorAll('.tab-btn');
  const tabPanels  = document.querySelectorAll('.tab-panel');
  const tabIndicator = document.querySelector('.tab-indicator');
  const articlesGrid = document.getElementById('articlesGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');

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
  function buildWorkGrid(content) {
    if (!articlesGrid || !content) return;

    /* Order: investigations first (most impressive), then features, then news */
    const allArticles = [
      ...content.investigations.map(a => ({ ...a, category: 'investigations' })),
      ...content.features.map(a => ({ ...a, category: 'features' })),
      ...content.news.map(a => ({ ...a, category: 'news' })),
    ];

    allArticles.forEach(article => {
      articlesGrid.appendChild(createCard(article));
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

  function applyMeta(meta) {
    if (!meta) return;

    if (meta.jobTitle) {
      document.title = 'Molly Greeves \u2014 ' + meta.jobTitle;
      var loaderCred = document.querySelector('.loader-credential');
      if (loaderCred) loaderCred.textContent = meta.jobTitle;
      var heroRole = document.querySelector('.hero-role');
      if (heroRole) heroRole.textContent = meta.jobTitle;
      var sigTitle = document.querySelector('.sig-title');
      if (sigTitle) sigTitle.textContent = meta.jobTitle;
    }

    if (meta.availabilityText) {
      var heroAvail = document.querySelector('.hero-availability');
      if (heroAvail) {
        var dot = heroAvail.querySelector('.availability-dot');
        heroAvail.textContent = meta.availabilityText;
        if (dot) heroAvail.insertBefore(dot, heroAvail.firstChild);
      }
    }

    if (meta.contactEmail) {
      var emailEl = document.querySelector('.contact-email');
      if (emailEl) {
        emailEl.textContent = meta.contactEmail;
        emailEl.href = 'mailto:' + meta.contactEmail;
      }
    }

    if (meta.contactAvailabilityTags) {
      var availEl = document.querySelector('.contact-avail');
      if (availEl) {
        availEl.innerHTML = '';
        meta.contactAvailabilityTags.forEach(function (tag, i) {
          var span = document.createElement('span');
          span.className = 'avail-tag';
          span.textContent = tag;
          availEl.appendChild(span);
          if (i < meta.contactAvailabilityTags.length - 1) {
            var sep = document.createElement('span');
            sep.className = 'avail-sep';
            sep.setAttribute('aria-hidden', 'true');
            sep.textContent = '\u00b7';
            availEl.appendChild(sep);
          }
        });
      }
    }

    if (meta.contactBody) {
      var bodyEl = document.querySelector('.contact-body');
      if (bodyEl) bodyEl.textContent = meta.contactBody;
    }

    if (meta.bio) {
      var heroText = document.querySelector('.hero-text');
      if (heroText) {
        heroText.querySelectorAll('.hero-bio').forEach(function (el) { el.remove(); });
        var rule = heroText.querySelector('.hero-rule');
        var insertAfter = rule;
        meta.bio.forEach(function (text, i) {
          var p = document.createElement('p');
          p.className = 'hero-bio';
          p.style.setProperty('--delay', (360 + i * 70) + 'ms');
          p.textContent = text;
          insertAfter.insertAdjacentElement('afterend', p);
          insertAfter = p;
        });
      }
    }
  }

  function populateLatestInvestigation(data) {
    const inv = data.investigations && data.investigations[0];
    if (!inv) return;
    const el = document.querySelector('.latest-investigation');
    if (!el) return;
    el.href = inv.url;
    el.querySelector('.li-pub').textContent = inv.publication;
    el.querySelector('.li-title').textContent = inv.title;
  }

  /* ============================================================
     INIT
     ============================================================ */
  fetch('../content.json')
    .then(res => res.json())
    .then(data => {
      applyMeta(data.meta);
      buildWorkGrid(data);
      populateLatestInvestigation(data);
    })
    .catch(e => console.error('Failed to load content', e));

})();
