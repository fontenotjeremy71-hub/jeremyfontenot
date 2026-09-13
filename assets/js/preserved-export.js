'use strict';

// Safe compatibility entry point for preserved presentation derivatives whose
// original optional script dependency was not included in the attested export.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-toggle').forEach((toggle) => {
    const target = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!target) return;
    const mobile = window.matchMedia('(max-width: 980px)').matches;
    if (mobile) target.hidden = true;
    toggle.addEventListener('click', () => {
      const open = target.hidden;
      target.hidden = !open;
      target.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  });
});
