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
  const imageEl      = document.getElementById('preview-image-el');

  let selectedItem = null;

  // ── Render articles from content.js ───────────────────────────
  function buildItem(article) {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.setAttribute('tabindex', '0');
    li.dataset.previewPub     = article.publication || '';
    li.dataset.previewTitle   = article.title       || '';
    li.dataset.previewDate    = article.date        || '';
    li.dataset.previewExcerpt = article.excerpt     || '';
    li.dataset.previewUrl     = article.url         || '#!';
    if (article.badge)     li.dataset.previewBadge     = article.badge;
    if (article.badgeType) li.dataset.previewBadgeType = article.badgeType;
    if (article.image)     li.dataset.previewImage     = article.image;

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

  // ── Selection management ───────────────────────────────────────
  function selectItem(item) {
    if (selectedItem) selectedItem.classList.remove('selected');
    selectedItem = item;
    if (selectedItem) {
      selectedItem.classList.add('selected');
      populatePreview(selectedItem);
    } else {
      clearPreview();
    }
  }

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
      const newList = document.getElementById('tab-' + target);
      if (newList) newList.classList.add('active');

      // Auto-select first item in new tab
      const firstItem = newList ? newList.querySelector('.list-item') : null;
      selectItem(firstItem || null);
    });
  });

  // ── Preview population ─────────────────────────────────────────
  function populatePreview(item) {
    const pub       = item.dataset.previewPub      || '';
    const title     = item.dataset.previewTitle    || '';
    const date      = item.dataset.previewDate     || '';
    const excerpt   = item.dataset.previewExcerpt  || '';
    const url       = item.dataset.previewUrl      || '#!';
    const badge     = item.dataset.previewBadge    || '';
    const badgeType = item.dataset.previewBadgeType || '';
    const image     = item.dataset.previewImage    || '';

    const existingBadge = document.getElementById('preview-badge-el');
    if (existingBadge) existingBadge.remove();

    if (image) {
      imageEl.src = image;
      imageEl.alt = title;
      imageEl.style.display = 'block';
    } else {
      imageEl.src = '';
      imageEl.alt = '';
      imageEl.style.display = 'none';
    }

    pubEl.textContent  = pub;
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
      excerptEl.textContent   = excerpt;
      excerptEl.style.display = '';
    } else {
      excerptEl.textContent   = '';
      excerptEl.style.display = 'none';
    }

    ctaEl.innerHTML = (excerpt ? 'Read article' : 'View at ' + pub) + ' <span class="cta-arrow">\u2192</span>';
    ctaEl.href = url;

    previewInner.classList.add('showing-content');
  }

  function clearPreview() {
    previewInner.classList.remove('showing-content');
    const existingBadge = document.getElementById('preview-badge-el');
    if (existingBadge) existingBadge.remove();
    imageEl.src = '';
    imageEl.alt = '';
    imageEl.style.display = 'none';
  }

  // Restore selected item on mouse-out (or clear if nothing selected)
  function restoreSelected() {
    if (selectedItem) {
      populatePreview(selectedItem);
    } else {
      clearPreview();
    }
  }

  // ── Event delegation ───────────────────────────────────────────

  // Hover previews without changing selection.
  // If cursor is in the list but not over an item (gap/padding zones), restore selected.
  colList.addEventListener('mouseover', e => {
    const item = e.target.closest('.list-item');
    if (item) {
      populatePreview(item);
    } else {
      restoreSelected();
    }
  });

  // Restore when cursor leaves the list column (moves to preview pane, info col, etc.)
  colList.addEventListener('mouseleave', restoreSelected);

  // Click selects on desktop, navigates on mobile
  colList.addEventListener('click', e => {
    const item = e.target.closest('.list-item');
    if (!item) return;
    const colPreview = document.querySelector('.col-preview');
    if (getComputedStyle(colPreview).display === 'none') {
      const url = item.dataset.previewUrl;
      if (url && url !== '#!') window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      selectItem(item);
    }
  });

  // Keyboard: Enter/Space selects; focus shows preview
  colList.addEventListener('keydown', e => {
    const item = e.target.closest('.list-item');
    if (!item) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectItem(item);
    }
  });

  colList.addEventListener('focusin', e => {
    const item = e.target.closest('.list-item');
    if (item) populatePreview(item);
  });

  colList.addEventListener('focusout', e => {
    if (!colList.contains(e.relatedTarget)) {
      restoreSelected();
    }
  });

  // Restore selected article when cursor leaves the layout
  mainLayout.addEventListener('mouseleave', restoreSelected);

  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href') === '#!') e.preventDefault();
  });

  // ── Auto-select first article on load ─────────────────────────
  const firstItem = document.querySelector('#tab-features .list-item');
  if (firstItem) selectItem(firstItem);

  // ── For curious developers ─────────────────────────────────────
  console.log(
    '%c Molly Greeves ',
    'background:#4a6741;color:#f7f3ec;font-family:Georgia,serif;font-size:15px;padding:4px 12px;',
    '\n\nAward-winning consumer & personal finance journalist.\nGet in touch: molly.greeves@the-independent.com'
  );
})();
