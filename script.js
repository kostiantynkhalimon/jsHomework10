/**
 * Базовый конструктор слайдера на прототипах
 * @param {string} selector - CSS-селектор контейнера слайдера
 * @param {Object} config - Объект настроек слайдера
 */
function Slider(selector, config) {
  this.slider = document.querySelector(selector);
  if (!this.slider) return;

  this.wrapper =
    this.slider.closest(".slider-wrapper") || this.slider.parentElement;
  this.track = this.slider.querySelector(".slider__track");
  this.slides = Array.from(this.track.children);

  // Конфигурация по умолчанию + пользовательские настройки
  this.config = Object.assign(
    {
      intervalTime: 3500,
      showIndicators: true,
      showNavButtons: true,
      autoplay: true,
      keyboardNavigation: true,
    },
    config,
  );

  this.currentIndex = 0;
  this.totalSlides = this.slides.length;
  this.autoplayInterval = null;
  this.isPlaying = this.config.autoplay;

  this.init();
}

Slider.prototype.init = function () {
  this.createControls();
  this.updateSlider();
  this.bindEvents();

  if (this.config.autoplay) {
    this.startAutoplay();
  }
};

/**
 * Динамическая генерация элементов управления через JavaScript
 */
Slider.prototype.createControls = function () {
  // 1. Кнопки навигации (Вперед / Назад)
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

  // 2. Индикаторы слайдов (точки)
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

  // 3. Нижняя панель с кнопкой паузы и подсказкой
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
  hint.textContent = "Керування: стрілки ⬅ ➡, миша або свайп";

  this.controlsPanel.appendChild(this.toggleAutoplayBtn);
  this.controlsPanel.appendChild(hint);
  this.wrapper.appendChild(this.controlsPanel);
};

Slider.prototype.updateSlider = function () {
  this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

  if (this.config.showIndicators && this.indicatorsContainer) {
    const dots = this.indicatorsContainer.querySelectorAll(".slider__dot");
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === this.currentIndex);
    });
  }
};

Slider.prototype.goToSlide = function (index) {
  this.currentIndex = (index + this.totalSlides) % this.totalSlides;
  this.updateSlider();
};

Slider.prototype.nextSlide = function () {
  this.goToSlide(this.currentIndex + 1);
};

Slider.prototype.prevSlide = function () {
  this.goToSlide(this.currentIndex - 1);
};

Slider.prototype.startAutoplay = function () {
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
};

Slider.prototype.stopAutoplay = function () {
  clearInterval(this.autoplayInterval);
  this.autoplayInterval = null;
  this.isPlaying = false;
  if (this.toggleAutoplayBtn) {
    this.toggleAutoplayBtn.textContent = "▶ Відновити";
    this.toggleAutoplayBtn.classList.add("paused");
  }
};

Slider.prototype.toggleAutoplay = function () {
  if (this.isPlaying) {
    this.stopAutoplay();
  } else {
    this.startAutoplay();
  }
};

Slider.prototype.resetAutoplayTimer = function () {
  if (this.isPlaying) {
    clearInterval(this.autoplayInterval);
    this.autoplayInterval = setInterval(
      () => this.nextSlide(),
      this.config.intervalTime,
    );
  }
};

Slider.prototype.bindEvents = function () {
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
};

/**
 * Дочерний конструктор с поддержкой тач-свайпов и перетаскивания мышью
 * Наследует базовый Slider через прототипы
 */
function SwipeSlider(selector, config) {
  this.startX = 0;
  this.currentX = 0;
  this.isDragging = false;
  this.swipeThreshold = (config && config.swipeThreshold) || 50;

  // Вызов родительского конструктора
  Slider.call(this, selector, config);
}

// Прототипное наследование
SwipeSlider.prototype = Object.create(Slider.prototype);
SwipeSlider.prototype.constructor = SwipeSlider;

// Расширение метода bindEvents родителя
SwipeSlider.prototype.bindEvents = function () {
  Slider.prototype.bindEvents.call(this);

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
};

SwipeSlider.prototype.handleDragStart = function (clientX) {
  this.isDragging = true;
  this.startX = clientX;
  this.currentX = clientX;
  this.track.style.transition = "none";
};

SwipeSlider.prototype.handleDragMove = function (clientX) {
  if (!this.isDragging) return;
  this.currentX = clientX;
  const diff = this.currentX - this.startX;
  const slideWidth = this.slider.offsetWidth;
  const percentMove = (diff / slideWidth) * 100;
  this.track.style.transform = `translateX(calc(-${this.currentIndex * 100}% + ${percentMove}%))`;
};

SwipeSlider.prototype.handleDragEnd = function () {
  if (!this.isDragging) return;
  this.isDragging = false;
  this.track.style.transition = "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)";

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
};

// Инициализация слайдера с объектом конфигурации
document.addEventListener("DOMContentLoaded", () => {
  new SwipeSlider("#slider", {
    intervalTime: 3500,
    showIndicators: true,
    showNavButtons: true,
    autoplay: true,
    keyboardNavigation: true,
    swipeThreshold: 50,
  });
});
