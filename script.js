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

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function smoothScrollTo(targetElement, duration = 1200) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    targetElement.scrollIntoView();
    return;
  }

  const startY = window.pageYOffset || document.documentElement.scrollTop || 0;
  const targetRect = targetElement.getBoundingClientRect();
  const destinationY = targetRect.top + startY;
  const distance = destinationY - startY;

  if (distance === 0) {
    return;
  }

  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutQuad(progress);
    const newY = startY + distance * easedProgress;

    window.scrollTo(0, newY);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function resolveScrollTarget(trigger) {
  if (!trigger) {
    return null;
  }

  const dataTarget = trigger.getAttribute('data-scroll-target');
  if (dataTarget) {
    if (dataTarget === '#/' || dataTarget.toLowerCase() === '#top' || dataTarget.toLowerCase() === 'top') {
      return document.body;
    }
    if (dataTarget.startsWith('#')) {
      return document.querySelector(dataTarget);
    }
  }

  if (trigger.tagName === 'A') {
    const href = trigger.getAttribute('href');

    if (!href) {
      return null;
    }

    if (href === '#/' || href.toLowerCase() === '#top') {
      return document.body;
    }

    if (href.startsWith('#') && href.length > 1) {
      return document.querySelector(href);
    }
  }

  return null;
}

function initGlobalSmoothScroll() {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented) {
      return;
    }

    const trigger = event.target.closest('[data-scroll-target], a[href^="#"]');

    if (!trigger) {
      return;
    }

    // Skip elements intended to open modals or act as controls
    if (trigger.hasAttribute('data-modal') || trigger.closest('[data-modal]')) {
      return;
    }

    const targetElement = resolveScrollTarget(trigger);

    if (!targetElement) {
      return;
    }

    event.preventDefault();

    smoothScrollTo(targetElement);

    if (siteNav && trigger.closest('#primaryNav')) {
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
      }
      siteNav.classList.remove('open');
    }
  });
}

initGlobalSmoothScroll();

function initNavScrollSpy() {
  const navLinks = Array.from(document.querySelectorAll('#primaryNav a[href^="#"]'));

  if (!navLinks.length) {
    return;
  }

  const linkMap = navLinks
    .map((link) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') {
        return null;
      }

      const section = document.querySelector(targetId);
      if (!section) {
        return null;
      }

      return { link, section };
    })
    .filter(Boolean);

  if (!linkMap.length) {
    return;
  }

  let activeId = null;
  let ticking = false;

  function setActiveLink(id) {
    if (activeId === id) {
      return;
    }

    activeId = id;
    navLinks.forEach((link) => {
      if (id && link.getAttribute('href') === `#${id}`) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  function updateActiveLink() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const viewportMidpoint = scrollY + window.innerHeight / 2;

    let candidate = null;

    linkMap.forEach(({ section }) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = scrollY + rect.top;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (viewportMidpoint >= sectionTop && viewportMidpoint <= sectionBottom) {
        candidate = section;
      }
    });

    if (candidate) {
      setActiveLink(candidate.id);
    } else {
      setActiveLink(null);
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateActiveLink);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateActiveLink);

  updateActiveLink();
}

initNavScrollSpy();

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Workshop Modal Functionality
const workshopCards = document.querySelectorAll('.workshop-card');
const modals = {
  'school-intro-modal': document.getElementById('school-intro-modal'),
  'school-custom-modal': document.getElementById('school-custom-modal'),
  'egypt-workshop-modal': document.getElementById('egypt-workshop-modal'),
  'dubai-workshop-modal': document.getElementById('dubai-workshop-modal')
};

// Open modal function
function openModal(modalId) {
  const modal = modals[modalId];
  if (modal) {
    modal.classList.add('active');
    // Focus on first input
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
}

// Close modal function
function closeModal(modal) {
  modal.classList.remove('active');
}

// Workshop card click handlers
workshopCards.forEach(card => {
  const workshopType = card.dataset.workshop;
  const ctaButton = card.querySelector('.workshop-cta');
  
  if (ctaButton && workshopType) {
    ctaButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const explicitModal = ctaButton.getAttribute('data-modal');
      const targetKey = explicitModal || workshopType;
      openModal(targetKey);
    });
  }
});

// Handle buttons with data-modal attribute (Egypt and Dubai workshop buttons)
document.querySelectorAll('.workshop-cta[data-modal]').forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const modalId = button.getAttribute('data-modal');
    openModal(modalId);
  });
});

// Modal close handlers
Object.values(modals).forEach(modal => {
  if (modal) {
    // Close button
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }
    
    // Cancel button
    const cancelBtn = modal.querySelector('.modal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => closeModal(modal));
    }
    
    // Overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal(modal);
      }
    });
  }
});

// Hero bubble parallax scrolling
function initHeroBubbleParallax() {
  const heroSection = document.querySelector('.hero');
  const bubbles = Array.from(document.querySelectorAll('.hero-bubble'));

  if (!heroSection || bubbles.length === 0) {
    return;
  }

  const bubbleConfigs = bubbles.map((bubble, index) => ({
    element: bubble,
    speed: parseFloat(bubble.dataset.parallaxSpeed || (0.2 + index * 0.05))
  }));

  let heroTop = heroSection.offsetTop;
  let heroHeight = heroSection.offsetHeight;
  let viewportHeight = window.innerHeight;
  let ticking = false;

  function recalc() {
    heroTop = heroSection.offsetTop;
    heroHeight = heroSection.offsetHeight;
    viewportHeight = window.innerHeight;
    update();
  }

  function update() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const viewportCenter = scrollY + viewportHeight / 2;
    const heroCenter = heroTop + heroHeight / 2;
    const delta = viewportCenter - heroCenter;
    const HERO_MULTIPLIER = 2; // 5x the previous speed
    const MAX_OFFSET = 1500;

    bubbleConfigs.forEach(({ element, speed, direction }) => {
      const movement = Math.max(
        -MAX_OFFSET,
        Math.min(MAX_OFFSET, delta * HERO_MULTIPLIER * speed * -1)
      );
      element.style.transform = `translate3d(0, ${movement}px, 0)`;
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', recalc);

  recalc();
}

function initIllustrationParallax() {
  const illustration = document.getElementById('illustration');

  if (!illustration) {
    return;
  }

  const speed = parseFloat(illustration.dataset.parallaxSpeed || 1);

  let elementTop = illustration.offsetTop;
  let elementHeight = illustration.offsetHeight;
  let viewportHeight = window.innerHeight;
  let ticking = false;

  function recalc() {
    elementTop = illustration.offsetTop;
    elementHeight = illustration.offsetHeight;
    viewportHeight = window.innerHeight;
    update();
  }

  function update() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const viewportCenter = scrollY + viewportHeight / 2;
    const elementCenter = elementTop + elementHeight / 2;
    const delta = viewportCenter - elementCenter;
    const ILLUSTRATION_MULTIPLIER = 0.2;
    const MAX_OFFSET = 1500;

    const movement = Math.max(
      -MAX_OFFSET,
      Math.min(MAX_OFFSET, delta * ILLUSTRATION_MULTIPLIER * speed * -1)
    );

    illustration.style.transform = `translate3d(0, ${movement}px, 0)`;

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', recalc);

  recalc();
}

function initTestimonialParallax() {
  const testimonialGrid = document.querySelector('.testimonial-grid');

  if (!testimonialGrid) {
    return;
  }

  const speed = parseFloat(testimonialGrid.dataset.parallaxSpeed || 1);

  let elementTop = testimonialGrid.offsetTop;
  let elementHeight = testimonialGrid.offsetHeight;
  let viewportHeight = window.innerHeight;
  let ticking = false;

  function recalc() {
    elementTop = testimonialGrid.offsetTop;
    elementHeight = testimonialGrid.offsetHeight;
    viewportHeight = window.innerHeight;
    update();
  }

  function update() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const viewportCenter = scrollY + viewportHeight / 2;
    const elementCenter = elementTop + elementHeight / 2;
    const delta = viewportCenter - elementCenter;
    const TESTIMONIAL_MULTIPLIER = 0.5;
    const MAX_OFFSET = 1500;

    const movement = Math.max(
      -MAX_OFFSET,
      Math.min(MAX_OFFSET, delta * TESTIMONIAL_MULTIPLIER * speed * -1)
    );

    testimonialGrid.style.transform = `translate3d(0, ${movement}px, 0)`;

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', recalc);

  recalc();
}

function initTestimonialsDragScroll() {
  const container = document.querySelector('.testimonials-grid');

  if (!container) {
    return;
  }

  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let activePointerId = null;

  const onPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    isDragging = true;
    startX = event.clientX;
    startScrollLeft = container.scrollLeft;
    activePointerId = event.pointerId ?? null;
    container.classList.add('is-dragging');

    if (activePointerId !== null && container.setPointerCapture) {
      container.setPointerCapture(activePointerId);
    }
  };

  const onPointerMove = (event) => {
    if (!isDragging) {
      return;
    }

    event.preventDefault();
    const deltaX = event.clientX - startX;
    container.scrollLeft = startScrollLeft - deltaX;
  };

  const endDrag = () => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    container.classList.remove('is-dragging');

    if (activePointerId !== null && container.releasePointerCapture) {
      container.releasePointerCapture(activePointerId);
      activePointerId = null;
    }
  };

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointerleave', endDrag);
  container.addEventListener('pointercancel', endDrag);
}

// Image Slider Functionality
class ImageSlider {
  constructor(container) {
    this.container = container;
    this.slides = container.querySelectorAll('.slide');
    this.prevBtn = container.querySelector('.slider-prev');
    this.nextBtn = container.querySelector('.slider-next');
    this.dots = container.querySelectorAll('.dot');
    this.currentSlide = 0;
    this.isTransitioning = false;
    this.lightboxItems = [];
    this.lightbox = document.getElementById('gallery-lightbox');
    this.lightboxImage = null;
    this.lightboxVideo = null;
    this.lightboxClose = null;
    this.lightboxPrev = null;
    this.lightboxNext = null;
    this.lightboxIndex = 0;
    this.handleLightboxKeydown = null;
    this.handleSliderKeydown = null;
    
    this.init();
  }
  
  init() {
    if (this.slides.length === 0) return;
    
    // Set up event listeners
    this.prevBtn.addEventListener('click', () => this.previousSlide());
    this.nextBtn.addEventListener('click', () => this.nextSlide());
    
    // Set up dots navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.showSlide(index));
    });
    
    // Set up keyboard navigation
    this.handleSliderKeydown = (e) => {
      if (document.body.classList.contains('lightbox-open')) return;
      if (e.key === 'ArrowLeft') this.previousSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    };
    document.addEventListener('keydown', this.handleSliderKeydown);
    
    // Auto-play videos in active slides
    this.updateVideoPlayback();
    
    // Enable lightbox gallery
    this.initLightbox();
    
    // Auto-advance slider (optional)
    this.startAutoSlide();
  }
  
  showSlide(index) {
    if (this.isTransitioning || index === this.currentSlide) return;
    
    this.isTransitioning = true;
    
    // Hide current slide and dot
    this.slides[this.currentSlide].classList.remove('active');
    this.dots[this.currentSlide].classList.remove('active');
    
    // Update current slide index
    this.currentSlide = index;
    
    // Ensure index is within bounds
    if (this.currentSlide >= this.slides.length) {
      this.currentSlide = 0;
    } else if (this.currentSlide < 0) {
      this.currentSlide = this.slides.length - 1;
    }
    
    // Show new slide and dot
    this.slides[this.currentSlide].classList.add('active');
    this.dots[this.currentSlide].classList.add('active');
    
    // Update video playback
    this.updateVideoPlayback();
    
    // Reset transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
  }
  
  nextSlide() {
    this.showSlide(this.currentSlide + 1);
  }
  
  previousSlide() {
    this.showSlide(this.currentSlide - 1);
  }
  
  updateVideoPlayback() {
    this.slides.forEach((slide, index) => {
      const video = slide.querySelector('video');
      if (video) {
        if (index === this.currentSlide) {
          // Play video in active slide
          video.play().catch(e => {
            console.log('Video autoplay prevented:', e);
          });
        } else {
          // Pause video in inactive slides
          video.pause();
          video.currentTime = 0; // Reset to beginning
        }
      }
    });
  }
  
  startAutoSlide() {
    // Auto-advance every 10 seconds
    setInterval(() => {
      if (this.isTransitioning) return;
      if (document.body.classList.contains('lightbox-open')) return;
      this.nextSlide();
    }, 6000);
  }
  
  initLightbox() {
    if (!this.lightbox) return;
    
    this.lightboxImage = this.lightbox.querySelector('#lightbox-image');
    this.lightboxVideo = this.lightbox.querySelector('#lightbox-video');
    this.lightboxClose = this.lightbox.querySelector('.lightbox-close');
    this.lightboxPrev = this.lightbox.querySelector('.lightbox-prev');
    this.lightboxNext = this.lightbox.querySelector('.lightbox-next');
    
    if (!this.lightboxImage || !this.lightboxVideo || !this.lightboxClose || !this.lightboxPrev || !this.lightboxNext) return;
    
    this.lightboxItems = [];
    
    Array.from(this.slides).forEach((slide) => {
      const mediaElement = slide.querySelector('img, video');
      if (!mediaElement) return;
      
      const tag = mediaElement.tagName.toLowerCase();
      let item = null;
      
      if (tag === 'img') {
        const src = mediaElement.getAttribute('src');
        if (!src) return;
        item = {
          type: 'image',
          src,
          alt: mediaElement.getAttribute('alt') || '',
          element: mediaElement
        };
      } else if (tag === 'video') {
        const source = mediaElement.querySelector('source');
        const src = source ? source.getAttribute('src') : mediaElement.getAttribute('src') || mediaElement.currentSrc;
        if (!src) return;
        item = {
          type: 'video',
          src,
          alt: mediaElement.getAttribute('aria-label') || mediaElement.getAttribute('title') || 'Workshop highlight video',
          element: mediaElement
        };
      }
      
      if (!item) return;
      
      const index = this.lightboxItems.length;
      this.lightboxItems.push(item);
      
      mediaElement.addEventListener('click', (event) => {
        const slideElement = mediaElement.closest('.slide');
        if (!slideElement || !slideElement.classList.contains('active')) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.openLightbox(index);
      });
    });
    
    if (!this.lightboxItems.length) return;
    
    this.lightboxClose.addEventListener('click', () => this.closeLightbox());
    this.lightboxPrev.addEventListener('click', () => this.previousLightboxItem());
    this.lightboxNext.addEventListener('click', () => this.nextLightboxItem());
    
    this.lightbox.addEventListener('click', (event) => {
      if (event.target === this.lightbox) {
        this.closeLightbox();
      }
    });
    
    this.handleLightboxKeydown = (e) => {
      if (!this.lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') {
        this.closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.previousLightboxItem();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextLightboxItem();
      }
    };
    
    document.addEventListener('keydown', this.handleLightboxKeydown);
  }
  
  openLightbox(index) {
    if (!this.lightboxItems.length) return;
    
    if (index < 0 || index >= this.lightboxItems.length) {
      index = 0;
    }
    
    const selectedItem = this.lightboxItems[index];
    if (selectedItem && selectedItem.type === 'video' && selectedItem.element) {
      selectedItem.element.pause();
      selectedItem.element.currentTime = 0;
    }
    
    this.lightboxIndex = index;
    this.updateLightboxContent();
    
    this.lightbox.classList.add('active');
    this.lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    
    // Give focus to the close button for accessibility
    if (this.lightboxClose) {
      try {
        this.lightboxClose.focus({ preventScroll: true });
      } catch (error) {
        this.lightboxClose.focus();
      }
    }
  }
  
  closeLightbox() {
    if (!this.lightbox || !this.lightbox.classList.contains('active')) return;
    
    this.lightbox.classList.remove('active');
    this.lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    
    if (this.lightboxVideo) {
      this.lightboxVideo.pause();
      this.lightboxVideo.removeAttribute('src');
      this.lightboxVideo.load();
    }
    
    this.updateVideoPlayback();
  }
  
  updateLightboxContent() {
    if (!this.lightboxItems.length || !this.lightboxImage || !this.lightboxVideo) return;
    
    if (this.lightboxIndex < 0) {
      this.lightboxIndex = this.lightboxItems.length - 1;
    } else if (this.lightboxIndex >= this.lightboxItems.length) {
      this.lightboxIndex = 0;
    }
    
    const currentItem = this.lightboxItems[this.lightboxIndex];
    if (!currentItem) return;
    
    this.lightboxImage.style.display = 'none';
    this.lightboxVideo.style.display = 'none';
    
    this.lightboxImage.src = '';
    this.lightboxImage.alt = '';
    
    this.lightboxVideo.pause();
    this.lightboxVideo.removeAttribute('src');
    this.lightboxVideo.load();
    
    if (currentItem.type === 'image') {
      this.lightboxImage.src = currentItem.src;
      this.lightboxImage.alt = currentItem.alt;
      this.lightboxImage.style.display = 'block';
    } else if (currentItem.type === 'video') {
      this.lightboxVideo.style.display = 'block';
      this.lightboxVideo.setAttribute('src', currentItem.src);
      this.lightboxVideo.setAttribute('aria-label', currentItem.alt);
      this.lightboxVideo.setAttribute('controls', '');
      this.lightboxVideo.muted = false;
      this.lightboxVideo.currentTime = 0;
      this.lightboxVideo.load();
      this.lightboxVideo.play().catch(() => {});
    }
  }
  
  nextLightboxItem() {
    if (!this.lightboxItems.length) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxItems.length;
    this.updateLightboxContent();
  }
  
  previousLightboxItem() {
    if (!this.lightboxItems.length) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + this.lightboxItems.length) % this.lightboxItems.length;
    this.updateLightboxContent();
  }
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const sliderContainer = document.querySelector('.image-slider');
  if (sliderContainer) {
    new ImageSlider(sliderContainer);
  }
  
  initHeroBubbleParallax();
  initIllustrationParallax();
  initTestimonialParallax();
  initTestimonialsDragScroll();

  // Initialize Instagram feed
  //initRealInstagramFeed();
  
  // Hide Instagram widget watermark
  hideInstagramWidget();
});

// Real Instagram Feed using Instagram Basic Display API
function initRealInstagramFeed() {
  // Instagram Basic Display API configuration
  // NOTE: You'll need to replace these with your actual Instagram app credentials
  const INSTAGRAM_ACCESS_TOKEN = 'YOUR_INSTAGRAM_ACCESS_TOKEN'; // Replace with your access token
  const INSTAGRAM_USER_ID = 'YOUR_INSTAGRAM_USER_ID'; // Replace with your Instagram user ID
  
  // For demonstration, I'll provide both real API call and fallback
  loadInstagramPosts();
  
  async function loadInstagramPosts() {
    const gridContainer = document.getElementById('instagram-grid');
    
    if (!gridContainer) return;
    
    try {
      // First, try to load real Instagram data
      if (INSTAGRAM_ACCESS_TOKEN !== 'YOUR_INSTAGRAM_ACCESS_TOKEN') {
        await loadRealInstagramData(gridContainer);
      } else {
        // Fallback: Use Instagram's public feed scraping (note: this may not always work due to CORS)
        await loadInstagramFallback(gridContainer);
      }
    } catch (error) {
      console.error('Instagram feed error:', error);
      showInstagramError(gridContainer, error.message);
    }
  }
  
  async function loadRealInstagramData(container) {
    // Instagram Basic Display API endpoint
    const apiUrl = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,caption,like_count,comments_count,timestamp&access_token=${INSTAGRAM_ACCESS_TOKEN}`;
    
    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }
      
      const data = await response.json();
      displayInstagramPosts(container, data.data.slice(0, 6)); // Show latest 6 posts
      
    } catch (error) {
      console.error('Instagram API failed:', error);
      throw error;
    }
  }
  
  async function loadInstagramFallback(container) {
    // Alternative approach: Use a proxy service or scraping API
    // This is a placeholder for demonstration - in production, you'd use:
    // 1. Your own backend proxy to Instagram
    // 2. A service like RapidAPI Instagram scraper
    // 3. Instagram oEmbed API for specific posts
    
    // For now, show mock data that looks like real Instagram
    const mockInstagramData = [
      {
        id: '1',
        media_type: 'IMAGE',
        media_url: './assets/nagwa-illustration.png',
        permalink: 'https://www.instagram.com/p/sample1/',
        caption: '🌟 Workshop magic happening! Building connections through positive discipline techniques. Every parent deserves tools that work! 💙 #PositiveDiscipline #ParentingWorkshop #Dubai',
        like_count: 127,
        comments_count: 23,
        timestamp: '2024-11-10T10:30:00+0000'
      },
      {
        id: '2',
        media_type: 'IMAGE',
        media_url: './assets/children.png',
        permalink: 'https://www.instagram.com/p/sample2/',
        caption: 'Children learning together in our weekend sessions! 👶👧👦 The joy on their faces when they feel heard and understood. #ChildDevelopment #PositiveParenting',
        like_count: 89,
        comments_count: 15,
        timestamp: '2024-11-08T15:45:00+0000'
      },
      {
        id: '3',
        media_type: 'IMAGE',
        media_url: './assets/teens.png',
        permalink: 'https://www.instagram.com/p/sample3/',
        caption: 'Teen workshop vibes! 🧑‍🎓 Navigating adolescence with respect and understanding. These young minds are incredible! #TeenWorkshops #Adolescence',
        like_count: 156,
        comments_count: 31,
        timestamp: '2024-11-06T12:20:00+0000'
      },
      {
        id: '4',
        media_type: 'IMAGE',
        media_url: './assets/toddlers.png',
        permalink: 'https://www.instagram.com/p/sample4/',
        caption: 'Positive discipline starts early! 🍼 Toddler workshop highlights - so much growth in these little hearts. #ToddlerParenting #EarlyChildhood',
        like_count: 203,
        comments_count: 45,
        timestamp: '2024-11-04T09:15:00+0000'
      },
      {
        id: '5',
        media_type: 'IMAGE',
        media_url: './assets/photo.jpg',
        permalink: 'https://www.instagram.com/p/sample5/',
        caption: 'Real families, real connections, real change! ❤️ This is what positive discipline transformation looks like. #RealFamilies #Transformation',
        like_count: 178,
        comments_count: 38,
        timestamp: '2024-11-02T16:30:00+0000'
      },
      {
        id: '6',
        media_type: 'IMAGE',
        media_url: './assets/mother.png',
        permalink: 'https://www.instagram.com/p/sample6/',
        caption: 'Empowering parents with tools for kind and firm parenting! 💪 Every mom deserves support on this journey. #EmpoweringParents #KindAndFirm',
        like_count: 142,
        comments_count: 29,
        timestamp: '2024-10-31T11:45:00+0000'
      }
    ];
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    displayInstagramPosts(container, mockInstagramData);
  }
  
  function displayInstagramPosts(container, posts) {
    if (!posts || posts.length === 0) {
      showInstagramError(container, 'No Instagram posts found');
      return;
    }
    
    container.innerHTML = '';
    
    posts.forEach(post => {
      if (post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM') {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
      }
    });
  }
  
  function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'instagram-post';
    postDiv.setAttribute('tabindex', '0');
    postDiv.setAttribute('role', 'button');
    postDiv.setAttribute('aria-label', `View Instagram post: ${post.caption ? post.caption.substring(0, 100) + '...' : 'Instagram post'}`);
    
    const caption = post.caption || '';
    const shortCaption = caption.length > 80 ? caption.substring(0, 80) + '...' : caption;
    
    postDiv.innerHTML = `
      <img src="${post.media_url}" alt="${shortCaption}" loading="lazy" />
      <div class="instagram-overlay">
        <div class="post-stats">
          <div>
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            ${post.like_count || 0}
          </div>
          <div>
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M21,6h-2l-1.27-1.27C17.48,4.48,17.25,4.38,17,4.38H7C6.75,4.38,6.52,4.48,6.27,4.73L5,6H3A1,1 0 0,0 2,7V19A1,1 0 0,0 3,20H21A1,1 0 0,0 22,19V7A1,1 0 0,0 21,6M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/>
            </svg>
            ${post.comments_count || 0}
          </div>
        </div>
        <div class="post-caption">${shortCaption}</div>
      </div>
    `;
    
    // Add click handler to open Instagram
    const openPost = () => {
      window.open(post.permalink, '_blank', 'noopener,noreferrer');
    };
    
    postDiv.addEventListener('click', openPost);
    postDiv.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPost();
      }
    });
    
    return postDiv;
  }
  
  function showInstagramError(container, message) {
    container.innerHTML = `
      <div class="instagram-error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="m15 9-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="m9 9 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>Instagram Feed Unavailable</h3>
        <p>We're having trouble loading our Instagram posts right now.</p>
        <p style="font-size: 0.9rem; margin-top: 1rem;">
          <a href="https://www.instagram.com/positivedisciplinedxb/" target="_blank" rel="noopener noreferrer" style="color: var(--clr-teal); text-decoration: underline;">
            Visit our Instagram page directly →
          </a>
        </p>
      </div>
    `;
  }
}

// Hide Instagram widget watermark function
function hideInstagramWidget() {
  let attempts = 0;
  const maxAttempts = 20; // 20 seconds
  
  const searchInterval = setInterval(() => {
    attempts++;
    console.log(`Searching for Instagram widget (attempt ${attempts}/20)...`);
    
    // Look for element with title="Free Instagram Feed widget"
    const widgetElement = document.querySelector('[title="Free Instagram Feed widget"]');
    
    if (widgetElement) {
      // Found the element - hide it
      const currentStyle = widgetElement.getAttribute('style') || '';
      const newStyle = currentStyle + (currentStyle ? '; ' : '') + 'display: none !important;';
      widgetElement.setAttribute('style', newStyle);
      
      console.log('Instagram widget found and hidden successfully!');
      clearInterval(searchInterval);
      return;
    }
    
    // Stop after 20 attempts (20 seconds)
    if (attempts >= maxAttempts) {
      console.log('Instagram widget not found after 20 seconds. Stopping search.');
      clearInterval(searchInterval);
    }
  }, 1000); // Run every 1 second
}

// Phone Input Component
function initPhoneInputs() {
  const phoneInputs = [
    {
      selector: '#school-intro-phone',
      dropdown: '#school-intro-dropdown',
      flag: '#school-intro-flag',
      code: '#school-intro-code',
      hiddenCode: '#school-intro-country-code'
    },
    {
      selector: '#school-custom-phone',
      dropdown: '#school-custom-dropdown',
      flag: '#school-custom-flag',
      code: '#school-custom-code',
      hiddenCode: '#school-custom-country-code'
    },
    {
      selector: '#egypt-workshop-phone',
      dropdown: '#egypt-workshop-dropdown',
      flag: '#egypt-workshop-flag',
      code: '#egypt-workshop-code',
      hiddenCode: '#egypt-workshop-country-code'
    },
    {
      selector: '#dubai-workshop-phone',
      dropdown: '#dubai-workshop-dropdown',
      flag: '#dubai-workshop-flag',
      code: '#dubai-workshop-code',
      hiddenCode: '#dubai-workshop-country-code'
    }
  ];

  phoneInputs.forEach(config => {
    const phoneInput = document.querySelector(config.selector);
    const dropdown = document.querySelector(config.dropdown);
    const countrySelector = phoneInput?.closest('.phone-input-container')?.querySelector('.country-selector');
    const flag = document.querySelector(config.flag);
    const code = document.querySelector(config.code);
    const hiddenCode = document.querySelector(config.hiddenCode);

    if (!phoneInput || !dropdown || !countrySelector) return;

    // Country selection handler (skip if read-only)
    if (!countrySelector.dataset.readonly) {
      countrySelector.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = dropdown.classList.contains('active');
        closeAllDropdowns();
        if (!isActive) {
          dropdown.classList.add('active');
          countrySelector.classList.add('active');
        }
      });
    }

    // Country option selection
    dropdown.querySelectorAll('.country-option').forEach(option => {
      option.addEventListener('click', () => {
        const selectedCode = option.dataset.code;
        const selectedFlag = option.dataset.flag; // Now contains 'eg' or 'ae'
        const selectedCountry = option.dataset.country;

        // Update display - set flag icon class
        if (flag) {
          flag.innerHTML = `<span class="fi fi-${selectedFlag}"></span>`;
        }
        if (code) code.textContent = selectedCode;
        if (hiddenCode) hiddenCode.value = selectedCode;

        // Update placeholder based on country
        if (selectedCode === '+20') {
          phoneInput.placeholder = 'XX XXXX XXXX';
        } else if (selectedCode === '+971') {
          phoneInput.placeholder = 'XX XXX XXXX';
        }

        // Clear and reformat existing input
        const currentValue = phoneInput.value.replace(/\s/g, '');
        phoneInput.value = '';
        if (currentValue) {
          phoneInput.value = formatPhoneNumber(currentValue, selectedCode);
        }

        // Close dropdown
        dropdown.classList.remove('active');
        countrySelector.classList.remove('active');
        phoneInput.focus();
      });
    });

    // Set initial placeholder based on default country code
    const initialCode = hiddenCode?.value || '+20';
    if (initialCode === '+20') {
      phoneInput.placeholder = 'XX XXXX XXXX';
    } else if (initialCode === '+971') {
      phoneInput.placeholder = 'XX XXX XXXX';
    }

    // Format phone number as user types
    phoneInput.addEventListener('input', (e) => {
      const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
      const currentCode = hiddenCode?.value || '+20';
      e.target.value = formatPhoneNumber(value, currentCode);
    });

    // Prevent non-numeric input (except spaces which are added by formatting)
    phoneInput.addEventListener('keypress', (e) => {
      if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
        e.preventDefault();
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.phone-input-container')) {
      closeAllDropdowns();
    }
  });

  // Close dropdowns on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.country-dropdown').forEach(dropdown => {
    dropdown.classList.remove('active');
  });
  document.querySelectorAll('.country-selector').forEach(selector => {
    selector.classList.remove('active');
  });
}

function formatPhoneNumber(value, countryCode) {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  if (countryCode === '+20') {
    // Egypt: XX XXXX XXXX (10 digits)
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 10)}`;
    }
  } else if (countryCode === '+971') {
    // UAE: XX XXX XXXX (9 digits)
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 5) {
      return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
    }
  }
  
  return value;
}

// Number Spinner Functionality
function initNumberSpinners() {
  document.querySelectorAll('.number-spinner-wrapper').forEach(wrapper => {
    const spinner = wrapper.querySelector('.number-spinner');
    const decreaseBtn = wrapper.querySelector('.spinner-decrease');
    const increaseBtn = wrapper.querySelector('.spinner-increase');
    
    if (!spinner || !decreaseBtn || !increaseBtn) return;
    
    const min = parseInt(spinner.getAttribute('min')) || 1;
    const max = parseInt(spinner.getAttribute('max')) || 20;
    
    function updateButtons() {
      const value = parseInt(spinner.value) || min;
      decreaseBtn.disabled = value <= min;
      increaseBtn.disabled = value >= max;
    }
    
    decreaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(spinner.value) || min;
      if (currentValue > min) {
        spinner.value = currentValue - 1;
        updateButtons();
        spinner.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    increaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(spinner.value) || min;
      if (currentValue < max) {
        spinner.value = currentValue + 1;
        updateButtons();
        spinner.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    spinner.addEventListener('input', () => {
      let value = parseInt(spinner.value) || min;
      if (value < min) value = min;
      if (value > max) value = max;
      spinner.value = value;
      updateButtons();
    });
    
    spinner.addEventListener('blur', () => {
      let value = parseInt(spinner.value) || min;
      if (value < min) value = min;
      if (value > max) value = max;
      spinner.value = value;
      updateButtons();
    });
    
    // Initialize button states
    updateButtons();
  });
}

// Price Calculator Functionality
function initPriceCalculators() {
  const basePriceAED = 1200; // Base price per person in AED
  const basePriceEGP = 10000; // Base price per person in EGP
  const exchangeRateAEDtoEGP = 20; // 1 AED = 20 EGP (approximate)
  
  // Egypt workshop price calculator (EGP only)
  const egyptSpinner = document.querySelector('#egypt-workshop-form .number-spinner');
  const egyptPriceEGP = document.getElementById('egypt-price-egp');
  
  if (egyptSpinner && egyptPriceEGP) {
    function updateEgyptPrice() {
      const attendees = parseInt(egyptSpinner.value) || 1;
      const totalEGP = basePriceEGP * attendees;
      
      egyptPriceEGP.textContent = `${totalEGP.toLocaleString()} EGP`;
    }
    
    egyptSpinner.addEventListener('input', updateEgyptPrice);
    egyptSpinner.addEventListener('change', updateEgyptPrice);
    updateEgyptPrice(); // Initial calculation
  }
  
  // Dubai workshop price calculator (AED only)
  const dubaiSpinner = document.querySelector('#dubai-workshop-form .number-spinner');
  const dubaiPriceAED = document.getElementById('dubai-price-aed');
  
  if (dubaiSpinner && dubaiPriceAED) {
    function updateDubaiPrice() {
      const attendees = parseInt(dubaiSpinner.value) || 1;
      const totalAED = basePriceAED * attendees;
      
      dubaiPriceAED.textContent = `${totalAED.toLocaleString()} AED`;
    }
    
    dubaiSpinner.addEventListener('input', updateDubaiPrice);
    dubaiSpinner.addEventListener('change', updateDubaiPrice);
    updateDubaiPrice(); // Initial calculation
  }
}

// Form Submission Handlers
function initFormSubmissions() {
  // Egypt Workshop Form
  const egyptForm = document.getElementById('egypt-workshop-form');
  if (egyptForm) {
    egyptForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitForm(egyptForm, 'api/egypt-workshop.php', 'Egypt Workshop');
    });
  }

  // Dubai Workshop Form
  const dubaiForm = document.getElementById('dubai-workshop-form');
  if (dubaiForm) {
    dubaiForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitForm(dubaiForm, 'api/dubai-workshop.php', 'Dubai Workshop');
    });
  }

  // School Workshop Forms
  const schoolIntroForm = document.getElementById('school-intro-form');
  if (schoolIntroForm) {
    schoolIntroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitForm(schoolIntroForm, 'api/school-workshop.php', 'School Intro Workshop');
    });
  }

  const schoolCustomForm = document.getElementById('school-custom-form');
  if (schoolCustomForm) {
    schoolCustomForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitForm(schoolCustomForm, 'api/school-workshop.php', 'Custom School Workshop');
    });
  }

  // Contact Form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitForm(contactForm, 'api/contact.php', 'Contact');
    });
  }
}

// Generic form submission function
async function submitForm(form, endpoint, formName) {
  const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : 'Submit';
  
  try {
    // Show loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      submitBtn.classList.add('loading');
    }

    // Collect form data
    const formData = new FormData(form);
    
    // Send request
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    // Parse response
    const result = await response.json();

    if (result.success) {
      // Success - show success message
      showFormMessage(form, 'success', result.message || `${formName} submitted successfully!`);
      
      // Reset form
      form.reset();
      
      // Close modal if form is in a modal
      const modal = form.closest('.modal');
      if (modal) {
        setTimeout(() => {
          closeModal(modal);
        }, 2000);
      }
      
      // Reset price displays
      if (form.id === 'egypt-workshop-form') {
        const priceElement = document.getElementById('egypt-price-egp');
        if (priceElement) priceElement.textContent = '24,000 EGP';
      } else if (form.id === 'dubai-workshop-form') {
        const priceElement = document.getElementById('dubai-price-aed');
        if (priceElement) priceElement.textContent = '1,200 AED';
      }
      
    } else {
      // Error - show error message
      showFormMessage(form, 'error', result.message || `Failed to submit ${formName}. Please try again.`);
    }

  } catch (error) {
    console.error(`${formName} submission error:`, error);
    showFormMessage(form, 'error', 'Network error. Please check your connection and try again.');
  } finally {
    // Restore button state
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      submitBtn.classList.remove('loading');
    }
  }
}

// Show form message (success or error)
function showFormMessage(form, type, message) {
  // Remove any existing messages
  const existingMessage = form.querySelector('.form-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `form-message form-message-${type}`;
  messageDiv.innerHTML = `
    <div class="message-content">
      <span class="message-icon">${type === 'success' ? '✓' : '⚠'}</span>
      <span class="message-text">${message}</span>
    </div>
  `;

  // Insert message at the top of the form
  form.insertBefore(messageDiv, form.firstChild);

  // Auto-remove message after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);

  // Scroll message into view if needed
  messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize all functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initPhoneInputs();
  initNumberSpinners();
  initPriceCalculators();
  initFormSubmissions();
  
  // Update year in footer if element exists
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});