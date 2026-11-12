class BaseSlider {
  /**
   * @param {string} selector
   * @param {Object} config
   */
  constructor(selector, config = {}) {
    this.slider = document.querySelector(selector);
    if (!this.slider) return;

    this.wrapper =
      this.slider.closest(".slider-wrapper") || this.slider.parentElement;
    this.track = this.slider.querySelector(".slider__track");
    this.slides = Array.from(this.track.children);

    this.config = {
      intervalTime: 3500,
      showIndicators: true,
      showNavButtons: true,
      autoplay: true,
      pauseOnHover: true,
      keyboardNavigation: true,
      ...config,
    };

    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.autoplayInterval = null;
    this.isPlaying = this.config.autoplay;
    this.isPausedByUser = !this.config.autoplay;

    this.init();
  }

  init() {
    this.createControls();
    this.updateSlider();
    this.bindEvents();

    if (this.config.autoplay) {
      this.startAutoplay();
    }
  }

  createControls() {
    if (this.config.showNavButtons) {
      this.prevBtn = document.createElement("button");
      this.prevBtn.className = "slider__btn slider__btn--prev";
      this.prevBtn.setAttribute("aria-label", "Попередній слайд");
      this.prevBtn.innerHTML = "&#10094;";

      this.nextBtn = document.createElement("button");
      this.nextBtn.className = "slider__btn slider__btn--next";
      this.nextBtn.setAttribute("aria-label", "Наступний слайд");
      this.nextBtn.innerHTML = "&#10095;";

      this.slider.appendChild(this.prevBtn);
      this.slider.appendChild(this.nextBtn);
    }

    if (this.config.showIndicators) {
      this.indicatorsContainer = document.createElement("div");
      this.indicatorsContainer.className = "slider__indicators";

      this.slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.classList.add("slider__dot");
        dot.setAttribute("aria-label", `Перейти до слайду ${index + 1}`);
        if (index === 0) dot.classList.add("active");

        dot.addEventListener("click", () => {
          this.goToSlide(index);
          this.resetAutoplayTimer();
        });

        this.indicatorsContainer.appendChild(dot);
      });

      this.slider.appendChild(this.indicatorsContainer);
    }

    this.controlsPanel = document.createElement("div");
    this.controlsPanel.className = "slider-controls";

    this.toggleAutoplayBtn = document.createElement("button");
    this.toggleAutoplayBtn.className = "control-btn";
    this.toggleAutoplayBtn.textContent = this.isPlaying
      ? "⏸ Пауза"
      : "▶ Відновити";
    if (!this.isPlaying) this.toggleAutoplayBtn.classList.add("paused");

    const hint = document.createElement("span");
    hint.className = "control-hint";
    hint.textContent =
      "Керування: стрілки ⬅ ➡, миша, свайп (пауза при наведенні)";

    this.controlsPanel.appendChild(this.toggleAutoplayBtn);
    this.controlsPanel.appendChild(hint);
    this.wrapper.appendChild(this.controlsPanel);
  }

  updateSlider() {
    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    if (this.config.showIndicators && this.indicatorsContainer) {
      const dots = this.indicatorsContainer.querySelectorAll(".slider__dot");
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === this.currentIndex);
      });
    }
  }

  goToSlide(index) {
    this.currentIndex = (index + this.totalSlides) % this.totalSlides;
    this.updateSlider();
  }

  nextSlide() {
    this.goToSlide(this.currentIndex + 1);
  }

  prevSlide() {
    this.goToSlide(this.currentIndex - 1);
  }

  startAutoplay() {
    if (!this.autoplayInterval) {
      this.autoplayInterval = setInterval(
        () => this.nextSlide(),
        this.config.intervalTime,
      );
    }
    this.isPlaying = true;
    if (this.toggleAutoplayBtn) {
      this.toggleAutoplayBtn.textContent = "⏸ Пауза";
      this.toggleAutoplayBtn.classList.remove("paused");
    }
  }

  stopAutoplay() {
    clearInterval(this.autoplayInterval);
    this.autoplayInterval = null;
    this.isPlaying = false;
    if (this.toggleAutoplayBtn) {
      this.toggleAutoplayBtn.textContent = "▶ Відновити";
      this.toggleAutoplayBtn.classList.add("paused");
    }
  }

  toggleAutoplay() {
    if (this.isPlaying) {
      this.isPausedByUser = true;
      this.stopAutoplay();
    } else {
      this.isPausedByUser = false;
      this.startAutoplay();
    }
  }

  resetAutoplayTimer() {
    if (this.isPlaying) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = setInterval(
        () => this.nextSlide(),
        this.config.intervalTime,
      );
    }
  }

  bindEvents() {
    if (this.config.showNavButtons) {
      this.nextBtn.addEventListener("click", () => {
        this.nextSlide();
        this.resetAutoplayTimer();
      });

      this.prevBtn.addEventListener("click", () => {
        this.prevSlide();
        this.resetAutoplayTimer();
      });
    }

    if (this.toggleAutoplayBtn) {
      this.toggleAutoplayBtn.addEventListener("click", () =>
        this.toggleAutoplay(),
      );
    }

    if (this.config.keyboardNavigation) {
      document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
          this.nextSlide();
          this.resetAutoplayTimer();
        } else if (event.key === "ArrowLeft") {
          this.prevSlide();
          this.resetAutoplayTimer();
        }
      });
    }

    if (this.config.pauseOnHover) {
      this.slider.addEventListener("mouseenter", () => {
        if (this.isPlaying) {
          this.stopAutoplay();
        }
      });

      this.slider.addEventListener("mouseleave", () => {
        if (!this.isPausedByUser) {
          this.startAutoplay();
        }
      });
    }
  }
}

class InteractiveSlider extends BaseSlider {
  constructor(selector, config = {}) {
    super(selector, config);
    this.startX = 0;
    this.currentX = 0;
    this.isDragging = false;
    this.swipeThreshold = config.swipeThreshold || 50;
  }

  bindEvents() {
    super.bindEvents();

    this.slider.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) return;
      this.handleDragStart(e.clientX);
    });

    window.addEventListener("mousemove", (e) => {
      this.handleDragMove(e.clientX);
    });

    window.addEventListener("mouseup", () => {
      this.handleDragEnd();
    });

    this.slider.addEventListener(
      "touchstart",
      (e) => {
        if (e.target.closest("button")) return;
        this.handleDragStart(e.touches[0].clientX);
      },
      { passive: true },
    );

    this.slider.addEventListener(
      "touchmove",
      (e) => {
        this.handleDragMove(e.touches[0].clientX);
      },
      { passive: true },
    );

    this.slider.addEventListener("touchend", () => {
      this.handleDragEnd();
    });
  }

  handleDragStart(clientX) {
    this.isDragging = true;
    this.startX = clientX;
    this.currentX = clientX;
    this.track.style.transition = "none";
  }

  handleDragMove(clientX) {
    if (!this.isDragging) return;
    this.currentX = clientX;
    const diff = this.currentX - this.startX;
    const slideWidth = this.slider.offsetWidth;
    const percentMove = (diff / slideWidth) * 100;
    this.track.style.transform = `translateX(calc(-${this.currentIndex * 100}% + ${percentMove}%))`;
  }

  handleDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.style.transition =
      "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)";

    const diff = this.currentX - this.startX;

    if (Math.abs(diff) > this.swipeThreshold) {
      if (diff < 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
      this.resetAutoplayTimer();
    } else {
      this.updateSlider();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new InteractiveSlider("#slider", {
    intervalTime: 3500,
    showIndicators: true,
    showNavButtons: true,
    autoplay: true,
    pauseOnHover: true,
    keyboardNavigation: true,
    swipeThreshold: 50,
  });
});
