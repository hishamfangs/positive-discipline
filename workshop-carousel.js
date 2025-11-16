// Workshop Topics Carousel Functionality
function initWorkshopCarousel() {
  const carousel = document.querySelector('.workshop-topics-carousel');
  if (!carousel) return;

  const breadcrumbs = carousel.querySelectorAll('.breadcrumb-btn');
  const cards = carousel.querySelectorAll('.topic-card');
  const prevBtn = carousel.querySelector('.topics-nav-btn.prev');
  const nextBtn = carousel.querySelector('.topics-nav-btn.next');
  
  let currentIndex = 0;
  const totalTopics = cards.length;

  function showTopic(index) {
    if (index < 0) index = totalTopics - 1;
    if (index >= totalTopics) index = 0;

    // Update cards
    cards.forEach((card, i) => {
      card.classList.toggle('active', i === index);
    });

    // Update breadcrumbs
    breadcrumbs.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });

    currentIndex = index;
  }

  // Breadcrumb navigation
  breadcrumbs.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      showTopic(index);
    });
  });

  // Arrow navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showTopic(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showTopic(currentIndex + 1);
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!carousel.matches(':hover')) return;
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showTopic(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      showTopic(currentIndex + 1);
    }
  });

  // Auto-advance (optional - comment out if not desired)
  let autoAdvanceInterval = setInterval(() => {
    showTopic(currentIndex + 1);
  }, 8000);

  // Pause auto-advance on hover
  carousel.addEventListener('mouseenter', () => {
    clearInterval(autoAdvanceInterval);
  });

  carousel.addEventListener('mouseleave', () => {
    autoAdvanceInterval = setInterval(() => {
      showTopic(currentIndex + 1);
    }, 8000);
  });

  // Initialize
  showTopic(0);
}

// Add to existing DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  initWorkshopCarousel();
});
