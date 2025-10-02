const heroSlides = document.querySelectorAll('[data-hero-slide]');
const heroDots = document.querySelectorAll('[data-hero-dot]');
const testimonials = document.querySelectorAll('[data-testimonial]');
const testimonialDots = document.querySelectorAll('[data-testimonial-dot]');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#navMenu');
const yearSpan = document.getElementById('year');
const revealElements = document.querySelectorAll(
  '.section, .card, .location-card, .timeline-item, .testimonial, .approach-card, .gallery-card, .faq-item'
);

const autoPlayDelay = 6000;
let heroIndex = 0;
let testimonialIndex = 0;
let heroInterval;
let testimonialInterval;

function setActiveSlide(index) {
  heroSlides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
  heroDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
    dot.setAttribute('aria-current', i === index ? 'true' : 'false');
  });
  heroIndex = index;
}

function nextHeroSlide() {
  const nextIndex = (heroIndex + 1) % heroSlides.length;
  setActiveSlide(nextIndex);
}

function setActiveTestimonial(index) {
  testimonials.forEach((testimonial, i) => {
    testimonial.classList.toggle('active', i === index);
  });
  testimonialDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
    dot.setAttribute('aria-current', i === index ? 'true' : 'false');
  });
  testimonialIndex = index;
}

function nextTestimonial() {
  const nextIndex = (testimonialIndex + 1) % testimonials.length;
  setActiveTestimonial(nextIndex);
}

function startIntervals() {
  heroInterval = setInterval(nextHeroSlide, autoPlayDelay);
  testimonialInterval = setInterval(nextTestimonial, autoPlayDelay + 2000);
}

function resetIntervals() {
  clearInterval(heroInterval);
  clearInterval(testimonialInterval);
  startIntervals();
}

heroDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    setActiveSlide(index);
    resetIntervals();
  });
});

testimonialDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    setActiveTestimonial(index);
    resetIntervals();
  });
});

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('open');
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealElements.forEach((element) => {
  element.classList.add('reveal');
  observer.observe(element);
});

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

startIntervals();
