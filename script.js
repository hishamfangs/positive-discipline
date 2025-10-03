const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('primaryNav');
const yearSpan = document.getElementById('year');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('open');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('open');
    });
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Escape' && siteNav.classList.contains('open')) {
      navToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('open');
      navToggle.focus();
    }
  });
}

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
