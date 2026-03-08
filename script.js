/* v5.js — Molly Greeves portfolio, content loaded from content.json */

(function () {
  const mainLayout   = document.querySelector('.main-layout');
  const colList      = document.querySelector('.col-list');
  const previewInner = document.querySelector('.preview-inner');
  const pubEl        = document.getElementById('preview-pub-el');
  const titleEl      = document.getElementById('preview-title-el');
  const dateEl       = document.getElementById('preview-date-el');
  const excerptEl    = document.getElementById('preview-excerpt-el');
  const ctaEl        = document.getElementById('preview-cta-el');

  // ── Render articles from content.json ─────────────────────────
  function buildItem(article) {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.dataset.previewPub     = article.publication || '';
    li.dataset.previewTitle   = article.title       || '';
    li.dataset.previewDate    = article.date        || '';
    li.dataset.previewExcerpt = article.excerpt     || '';
    li.dataset.previewUrl     = article.url         || '#!';
    if (article.badge)     li.dataset.previewBadge     = article.badge;
    if (article.badgeType) li.dataset.previewBadgeType = article.badgeType;

    const meta = document.createElement('div');
    meta.className = 'item-meta';

    const pubSpan = document.createElement('span');
    pubSpan.className = 'item-pub';
    if (article.badge) {
      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'item-badge' + (article.badgeType === 'campaign' ? ' campaign' : '');
      badgeSpan.textContent = article.badge;
      pubSpan.appendChild(badgeSpan);
      pubSpan.appendChild(document.createTextNode(' ' + article.publication));
    } else {
      pubSpan.textContent = article.publication;
    }

    const yearSpan = document.createElement('span');
    yearSpan.className = 'item-year';
    yearSpan.textContent = article.date;

    meta.appendChild(pubSpan);
    meta.appendChild(yearSpan);

    const titleSpan = document.createElement('span');
    titleSpan.className = 'item-title';
    titleSpan.textContent = article.title;

    li.appendChild(meta);
    li.appendChild(titleSpan);
    return li;
  }

  function renderContent(data) {
    ['features', 'news', 'investigations'].forEach(tab => {
      const list = document.getElementById('tab-' + tab);
      if (!list || !data[tab]) return;
      list.innerHTML = '';
      data[tab].forEach(article => list.appendChild(buildItem(article)));
    });
  }

  renderContent(CONTENT);

  // ── Tab switching ──────────────────────────────────────────────
  document.querySelectorAll('.list-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      document.querySelectorAll('.list-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.item-list').forEach(l => l.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById('tab-' + target).classList.add('active');

      showDefault();
    });
  });

  // ── Preview population ─────────────────────────────────────────
  function populatePreview(item) {
    const pub       = item.dataset.previewPub     || '';
    const title     = item.dataset.previewTitle   || '';
    const date      = item.dataset.previewDate    || '';
    const excerpt   = item.dataset.previewExcerpt || '';
    const url       = item.dataset.previewUrl     || '#!';
    const badge     = item.dataset.previewBadge   || '';
    const badgeType = item.dataset.previewBadgeType || '';

    const existingBadge = document.getElementById('preview-badge-el');
    if (existingBadge) existingBadge.remove();

    pubEl.textContent   = pub;
    titleEl.textContent = title;
    dateEl.textContent  = date;

    if (badge) {
      const badgeNode = document.createElement('span');
      badgeNode.id = 'preview-badge-el';
      badgeNode.className = 'preview-badge' + (badgeType === 'campaign' ? ' campaign' : '');
      badgeNode.textContent = badge;
      titleEl.parentNode.insertBefore(badgeNode, titleEl);
    }

    if (excerpt) {
      excerptEl.textContent  = excerpt;
      excerptEl.style.display = '';
    } else {
      excerptEl.textContent  = '';
      excerptEl.style.display = 'none';
    }

    ctaEl.textContent = excerpt ? 'Read article \u2192' : 'View at ' + pub + ' \u2192';
    ctaEl.href = url;

    previewInner.classList.add('showing-content');
  }

  function showDefault() {
    previewInner.classList.remove('showing-content');
    const existingBadge = document.getElementById('preview-badge-el');
    if (existingBadge) existingBadge.remove();
  }

  // ── Event delegation: hover over list items ────────────────────
  colList.addEventListener('mouseover', e => {
    const item = e.target.closest('.list-item');
    if (item) populatePreview(item);
  });

  mainLayout.addEventListener('mouseleave', showDefault);

  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href') === '#!') e.preventDefault();
  });
})();
