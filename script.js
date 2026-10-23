document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("slider");
  const track = document.getElementById("sliderTrack");
  const slides = Array.from(track.children);
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const indicatorsContainer = document.getElementById("indicators");
  const toggleAutoplayBtn = document.getElementById("toggleAutoplayBtn");

  let currentIndex = 0;
  const totalSlides = slides.length;
  const intervalTime = 3500;
  let autoplayInterval = null;
  let isPlaying = true;

  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  const swipeThreshold = 50;

  function createIndicators() {
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.classList.add("slider__dot");
      dot.setAttribute("aria-label", `Перейти до слайду ${index + 1}`);
      if (index === 0) dot.classList.add("active");

      dot.addEventListener("click", () => {
        goToSlide(index);
        resetAutoplayTimer();
      });

      indicatorsContainer.appendChild(dot);
    });
  }

  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    const dots = indicatorsContainer.querySelectorAll(".slider__dot");
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = (index + totalSlides) % totalSlides;
    updateSlider();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoplay() {
    if (!autoplayInterval) {
      autoplayInterval = setInterval(nextSlide, intervalTime);
    }
    isPlaying = true;
    toggleAutoplayBtn.textContent = "⏸ Пауза";
    toggleAutoplayBtn.classList.remove("paused");
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
    isPlaying = false;
    toggleAutoplayBtn.textContent = "▶ Відновити";
    toggleAutoplayBtn.classList.add("paused");
  }

  function toggleAutoplay() {
    if (isPlaying) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  }

  function resetAutoplayTimer() {
    if (isPlaying) {
      clearInterval(autoplayInterval);
      autoplayInterval = setInterval(nextSlide, intervalTime);
    }
  }

  nextBtn.addEventListener("click", () => {
    nextSlide();
    resetAutoplayTimer();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    resetAutoplayTimer();
  });

  toggleAutoplayBtn.addEventListener("click", toggleAutoplay);

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      nextSlide();
      resetAutoplayTimer();
    } else if (event.key === "ArrowLeft") {
      prevSlide();
      resetAutoplayTimer();
    }
  });

  function handleDragStart(clientX) {
    isDragging = true;
    startX = clientX;
    currentX = clientX;
    track.style.transition = "none";
  }

  function handleDragMove(clientX) {
    if (!isDragging) return;
    currentX = clientX;
    const diff = currentX - startX;
    const slideWidth = slider.offsetWidth;
    const percentMove = (diff / slideWidth) * 100;
    track.style.transform = `translateX(calc(-${currentIndex * 100}% + ${percentMove}%))`;
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)";

    const diff = currentX - startX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      resetAutoplayTimer();
    } else {
      updateSlider();
    }
  }

  slider.addEventListener("mousedown", (e) => {
    if (e.target.closest("button")) return;
    handleDragStart(e.clientX);
  });

  window.addEventListener("mousemove", (e) => {
    handleDragMove(e.clientX);
  });

  window.addEventListener("mouseup", () => {
    handleDragEnd();
  });

  slider.addEventListener(
    "touchstart",
    (e) => {
      if (e.target.closest("button")) return;
      handleDragStart(e.touches[0].clientX);
    },
    { passive: true },
  );

  slider.addEventListener(
    "touchmove",
    (e) => {
      handleDragMove(e.touches[0].clientX);
    },
    { passive: true },
  );

  slider.addEventListener("touchend", () => {
    handleDragEnd();
  });

  createIndicators();
  updateSlider();
  startAutoplay();
});
