// JS adapted from the CodePen to drive the carousel
const cards = document.querySelectorAll(".pd-workshops-carousel .card");
const dots = document.querySelectorAll(".pd-workshops-carousel .dot");
const pills = document.querySelectorAll(".pd-workshops-carousel .pd-pill");
const memberName = document.querySelector(".pd-workshops-carousel .member-name");
const memberRole = document.querySelector(".pd-workshops-carousel .member-role");
const leftArrow = document.querySelector(".pd-workshops-carousel .nav-arrow.left");
const rightArrow = document.querySelector(".pd-workshops-carousel .nav-arrow.right");

const workshopSections = [
  { name: "Fundamentals", role: "Positive Discipline Foundations" },
  { name: "Parenting Tools", role: "Kind & Firm in Everyday Moments" },
  { name: "Community", role: "Support from Like-Minded Parents" },
  { name: "Practice & Problem-Solving", role: "Turn Ideas into Daily Habits" }
];

let currentIndex = 0;
let isAnimating = false;

function updateCarousel(newIndex) {
  if (isAnimating) return;
  isAnimating = true;

  currentIndex = (newIndex + cards.length) % cards.length;

  cards.forEach((card, i) => {
    const offset = (i - currentIndex + cards.length) % cards.length;

    card.classList.remove("center", "left-1", "left-2", "right-1", "right-2", "hidden");

    if (offset === 0) {
      card.classList.add("center");
    } else if (offset === 1) {
      card.classList.add("right-1");
    } else if (offset === 2) {
      card.classList.add("right-2");
    } else if (offset === cards.length - 1) {
      card.classList.add("left-1");
    } else if (offset === cards.length - 2) {
      card.classList.add("left-2");
    } else {
      card.classList.add("hidden");
    }
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });

  pills.forEach((pill, i) => {
    pill.classList.toggle("active", i === currentIndex);
  });

  // Update label text under the carousel
  memberName.style.opacity = "0";
  memberRole.style.opacity = "0";

  setTimeout(() => {
    memberName.textContent = workshopSections[currentIndex].name;
    memberRole.textContent = workshopSections[currentIndex].role;
    memberName.style.opacity = "1";
    memberRole.style.opacity = "1";
  }, 300);

  setTimeout(() => {
    isAnimating = false;
  }, 800);
}

// Arrow controls
if (leftArrow && rightArrow) {
  leftArrow.addEventListener("click", () => updateCarousel(currentIndex - 1));
  rightArrow.addEventListener("click", () => updateCarousel(currentIndex + 1));
}

// Dots & pills click
dots.forEach((dot, i) => {
  dot.addEventListener("click", () => updateCarousel(i));
});

pills.forEach((pill, i) => {
  pill.addEventListener("click", () => updateCarousel(i));
});

// Card click (center on click)
cards.forEach((card, i) => {
  card.addEventListener("click", () => updateCarousel(i));
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") updateCarousel(currentIndex - 1);
  if (e.key === "ArrowRight") updateCarousel(currentIndex + 1);
});

// Basic swipe support
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      updateCarousel(currentIndex + 1);
    } else {
      updateCarousel(currentIndex - 1);
    }
  }
}

// Init
updateCarousel(0);
