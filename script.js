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

// Workshop Modal Functionality
const workshopCards = document.querySelectorAll('.workshop-card');
const modals = {
  'free-intro': document.getElementById('free-workshop-modal'),
  'school-workshop': document.getElementById('school-workshop-modal')
};

// Open modal function
function openModal(modalId) {
  const modal = modals[modalId];
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
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
  document.body.style.overflow = '';
}

// Workshop card click handlers
workshopCards.forEach(card => {
  const workshopType = card.dataset.workshop;
  const ctaButton = card.querySelector('.workshop-cta');
  
  if (ctaButton && workshopType) {
    ctaButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal(workshopType);
    });
  }
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

// Form submission handlers
const freeWorkshopForm = document.getElementById('free-workshop-form');
const schoolWorkshopForm = document.getElementById('school-workshop-form');

if (freeWorkshopForm) {
  freeWorkshopForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(freeWorkshopForm);
    const data = {
      date: formData.get('date'),
      attendees: formData.get('attendees'),
      name: formData.get('name'),
      phone: formData.get('phone')
    };
    
    // Here you would normally send the data to your server
    console.log('Free workshop booking:', data);
    
    // Show success message (you can customize this)
    alert('Thank you for your interest! We will contact you soon to confirm your free workshop booking.');
    
    // Close modal and reset form
    closeModal(modals['free-intro']);
    freeWorkshopForm.reset();
  });
}

if (schoolWorkshopForm) {
  schoolWorkshopForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(schoolWorkshopForm);
    const data = {
      phone: formData.get('phone'),
      email: formData.get('email'),
      school: formData.get('school'),
      message: formData.get('message')
    };
    
    // Here you would normally send the data to your server
    console.log('School workshop inquiry:', data);
    
    // Show success message (you can customize this)
    alert('Thank you for your inquiry! We will contact you soon to discuss bringing Positive Discipline workshops to your school.');
    
    // Close modal and reset form
    closeModal(modals['school-workshop']);
    schoolWorkshopForm.reset();
  });
}
