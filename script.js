/* v4.js — Molly Greeves portfolio v4 interactions */

(function () {
  const mainLayout   = document.querySelector('.main-layout');
  const colList      = document.querySelector('.col-list');
  const previewInner = document.querySelector('.preview-inner');
  const pubEl        = document.getElementById('preview-pub-el');
  const titleEl      = document.getElementById('preview-title-el');
  const dateEl       = document.getElementById('preview-date-el');
  const excerptEl    = document.getElementById('preview-excerpt-el');
  const ctaEl        = document.getElementById('preview-cta-el');

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
    const pub     = item.dataset.previewPub     || '';
    const title   = item.dataset.previewTitle   || '';
    const date    = item.dataset.previewDate    || '';
    const excerpt = item.dataset.previewExcerpt || '';
    const url     = item.dataset.previewUrl     || '#!';
    const badge   = item.dataset.previewBadge   || '';
    const badgeType = item.dataset.previewBadgeType || '';

    // Clear any badge from previous render
    const existingBadge = document.getElementById('preview-badge-el');
    if (existingBadge) existingBadge.remove();

    pubEl.textContent = pub;
    titleEl.textContent = title;
    dateEl.textContent = date;

    // Insert badge before title if present
    if (badge) {
      const badgeNode = document.createElement('span');
      badgeNode.id = 'preview-badge-el';
      badgeNode.className = 'preview-badge' + (badgeType === 'campaign' ? ' campaign' : '');
      badgeNode.textContent = badge;
      titleEl.parentNode.insertBefore(badgeNode, titleEl);
    }

    if (excerpt) {
      excerptEl.textContent = excerpt;
      excerptEl.style.display = '';
    } else {
      excerptEl.textContent = '';
      excerptEl.style.display = 'none';
    }

    // CTA label
    if (excerpt) {
      ctaEl.textContent = 'Read article \u2192';
    } else {
      ctaEl.textContent = 'View at ' + pub + ' \u2192';
    }
    ctaEl.href = url;

    previewInner.classList.add('showing-content');
  }

  function showDefault() {
    previewInner.classList.remove('showing-content');
    // Clean up any injected badge
    const existingBadge = document.getElementById('preview-badge-el');
    if (existingBadge) existingBadge.remove();
  }

  // ── Event delegation: hover over list items ────────────────────
  colList.addEventListener('mouseover', e => {
    const item = e.target.closest('.list-item');
    if (item) populatePreview(item);
  });

  // Reset only when cursor leaves the entire main layout
  mainLayout.addEventListener('mouseleave', showDefault);

  // ── Prevent placeholder link jumps ────────────────────────────
  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href') === '#!') e.preventDefault();
  });
})();
