/* ============================================
   STEAM CORP — SHARED NAVIGATION
   ============================================ */

(function () {
  'use strict';

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const pageMap = {
    'index.html': 0,
    'vault.html': 1,
    'assets.html': 2,
    'about.html': 3,
    '': 0
  };

  // Highlight active nav link
  const navLinks = document.querySelectorAll('.nav__link');
  const activeIndex = pageMap[currentPage];

  navLinks.forEach((link, i) => {
    if (i === activeIndex) {
      link.classList.add('nav__link--active');
    }
  });

  // Mobile hamburger toggle
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinksContainer = document.querySelector('.nav__links');

  if (hamburger && navLinksContainer) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinksContainer.classList.toggle('open');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksContainer.classList.remove('open');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav')) {
        hamburger.classList.remove('active');
        navLinksContainer.classList.remove('open');
      }
    });
  }
})();
