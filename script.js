/**
 * Skoop Dispensary Digital Signage Controller
 * Handles real-time clock, date, slideshow transitions, and timeline progress
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- CONFIGURATION ---
  const SLIDE_DURATION = 9000; // 9 seconds per slide
  const PROGRESS_INTERVAL = 50; // Progress bar update interval in ms

  // --- ELEMENT REFERENCING ---
  const slides = [
    document.getElementById('slide-overview'),
    document.getElementById('slide-tuesday'),
    document.getElementById('slide-wednesday'),
    document.getElementById('slide-thursday')
  ];

  const dotElements = [
    document.getElementById('dot-0'),
    document.getElementById('dot-1'),
    document.getElementById('dot-2'),
    document.getElementById('dot-3')
  ];

  const clockDisplay = document.getElementById('clock-display');
  const dateDisplay = document.getElementById('date-display');
  const progressBar = document.getElementById('progress-bar');
  const tickerText = document.getElementById('ticker-text');

  // --- STATE ---
  let currentSlideIndex = 0;
  let progressPercentage = 0;
  let progressTimer = null;
  let tickerOffset = 0;

  // --- 1. CLOCK & DATE WIDGET ---
  function updateClockAndDate() {
    const now = new Date();

    // 12-hour AM/PM formatting for clock
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    if (clockDisplay) {
      clockDisplay.textContent = formattedTime;
    }

    // Full Date formatting: e.g. "Thursday, May 21"
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options);

    if (dateDisplay) {
      dateDisplay.textContent = formattedDate;
    }
  }

  // Initial update and run clock timer
  updateClockAndDate();
  setInterval(updateClockAndDate, 1000);

  // --- 2. SLIDESHOW CAROUSEL ---
  function showSlide(index) {
    if (index === currentSlideIndex) return;

    // Reset previous active elements
    const oldSlide = slides[currentSlideIndex];
    const newSlide = slides[index];

    // Out animation for the old slide
    if (oldSlide) {
      oldSlide.classList.add('slide-exit');
      oldSlide.classList.remove('slide-active');
      oldSlide.style.pointerEvents = 'none';

      // Remove classes after animation completes to avoid flashes
      setTimeout(() => {
        oldSlide.classList.remove('slide-exit');
        oldSlide.style.opacity = '0';
      }, 700);
    }

    // In animation for new slide
    if (newSlide) {
      newSlide.classList.add('slide-enter');
      newSlide.style.opacity = '1';
      newSlide.style.pointerEvents = 'auto';

      // Force a reflow to trigger animation
      newSlide.offsetHeight;

      newSlide.classList.add('slide-active');
      newSlide.classList.remove('slide-enter');
    }

    // Update Dots indicator style
    dotElements.forEach((dot, dIndex) => {
      if (dIndex === index) {
        dot.className = 'w-8 h-3 rounded-full bg-brand-green border border-brand-green/40 shadow-[0_0_12px_rgba(16,185,129,0.6)] transition-all duration-300';
      } else {
        dot.className = 'w-3 h-3 rounded-full bg-white/20 border border-white/10 hover:bg-white/40 transition-all duration-300';
      }
    });

    currentSlideIndex = index;
    progressPercentage = 0; // Reset progress bar for the new slide
  }

  function nextSlide() {
    const nextIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  // --- 3. TIMELINE PROGRESS BAR ---
  function startTimeline() {
    if (progressTimer) clearInterval(progressTimer);

    const step = (PROGRESS_INTERVAL / SLIDE_DURATION) * 100;

    progressTimer = setInterval(() => {
      progressPercentage += step;

      if (progressPercentage >= 100) {
        progressPercentage = 100;
        if (progressBar) progressBar.style.width = '100%';
        nextSlide();
      } else {
        if (progressBar) progressBar.style.width = `${progressPercentage}%`;
      }
    }, PROGRESS_INTERVAL);
  }

  // Initialize and run the progress timer
  startTimeline();

  // --- 4. TEXT TICKER ANIMATION (DIGITAL SIGNAGE SCROLL) ---
  function animateTicker() {
    if (!tickerText) return;

    // Use a CSS transform slide animation for ultra-smooth scrolling on signage devices
    let tickerWidth = tickerText.offsetWidth;
    let parentWidth = tickerText.parentElement.offsetWidth;

    // Standard CSS animation is sometimes laggy on low-end signage media players,
    // so we handle it with requestAnimationFrame or simple negative margin transitions
    tickerText.style.transition = 'none';
    tickerText.style.transform = `translateX(${parentWidth}px)`;

    // Recalculate widths
    tickerWidth = tickerText.offsetWidth;
    parentWidth = tickerText.parentElement.offsetWidth;

    let currentPos = parentWidth;
    const speed = 1.2; // pixels per frame (about 70px per second)

    function scroll() {
      currentPos -= speed;
      if (currentPos < -tickerWidth) {
        currentPos = parentWidth;
      }
      tickerText.style.transform = `translateX(${currentPos}px)`;
      requestAnimationFrame(scroll);
    }

    // Delay start slightly to let the browser render everything
    setTimeout(scroll, 1000);
  }

  animateTicker();

  // Make dots clickable in case of touch-screen digital displays
  dotElements.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      progressPercentage = 0; // Reset progress
    });
  });
});
