(function () {
  // Only enable custom cursor on "fine" pointers (desktop / laptop mice, trackpads)
  var hasFinePointer =
    window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (!hasFinePointer) {
    // Graceful fallback: keep the default cursor on touch/mobile
    return;
  }

  var cursor = document.getElementById('romantic-cursor');
  var trailLayer = document.getElementById('romantic-cursor-trail');
  if (!cursor || !trailLayer) return;

  document.body.classList.add('custom-cursor-enabled');

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var lastX = mouseX;
  var lastY = mouseY;
  var moving = false;

  // Keep the trail lightweight
  var MAX_HEARTS = 20;

  // Occasionally spawn extra romantic hearts near the cursor
  var extraHeartCooldown = 0;

  function createHeart(x, y, options) {
    if (trailLayer.childElementCount >= MAX_HEARTS) {
      trailLayer.removeChild(trailLayer.firstElementChild);
    }

    var heart = document.createElement('div');
    heart.className = 'cursor-heart';

    if (options && options.className) {
      heart.className = options.className;
    }

    heart.style.left = x + 'px';
    heart.style.top = y + 'px';

    if (options && options.delay) {
      heart.style.animationDelay = options.delay + 's';
    }

    heart.addEventListener('animationend', function () {
      if (heart.parentNode) {
        heart.parentNode.removeChild(heart);
      }
    });

    trailLayer.appendChild(heart);
  }

  // Smooth movement + trailing, using requestAnimationFrame
  function animate() {
    if (moving) {
      lastX += (mouseX - lastX) * 0.25;
      lastY += (mouseY - lastY) * 0.25;
      cursor.style.left = lastX + 'px';
      cursor.style.top = lastY + 'px';

      // Create heart along the path for a soft trail
      createHeart(lastX, lastY);

      // Occasionally spawn a small extra heart for romantic detail
      if (extraHeartCooldown <= 0 && Math.random() < 0.04) {
        var jitterX = lastX + (Math.random() - 0.5) * 16;
        var jitterY = lastY + (Math.random() - 0.5) * 16;
        createHeart(jitterX, jitterY);
        extraHeartCooldown = 250; // ms (approx)
      } else {
        extraHeartCooldown -= 16;
      }
    }
    requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', function (e) {
    moving = true;
    cursor.style.opacity = '1';
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', function () {
    cursor.style.opacity = '0';
    moving = false;
  });

  // Hover targets where glow should intensify:
  // - gallery arrows (.gallery-arrow)
  // - images (img)
  // - buttons (button, a[role="button"])
  // - audio player (audio, .audio-player)
  var hoverSelectors = [
    'button',
    'a',
    'img',
    '.gallery-arrow',
    'audio',
    '.audio-player',
    '[role="button"]',
  ];

  function setupHoverEffects() {
    var elements = document.querySelectorAll(hoverSelectors.join(','));
    elements.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.classList.add('cursor-hover', 'cursor-ring');
        if (el.matches('.gallery img')) {
          el.style.filter = 'brightness(1.15)';
          el.style.boxShadow =
            '0 18px 36px rgba(0, 0, 0, 0.85), 0 0 36px rgba(255, 192, 203, 0.6)';
        }
      });
      el.addEventListener('mouseleave', function () {
        cursor.classList.remove('cursor-hover', 'cursor-ring');
        if (el.matches('.gallery img')) {
          el.style.filter = '';
          el.style.boxShadow = '';
        }
      });
    });
  }

  setupHoverEffects();
  requestAnimationFrame(animate);
})();

// ===== Romantic carousel, particles, and scroll reveal =====

(function () {
  // Simple helper for modular arithmetic
  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  // CAROUSEL
  var track = document.querySelector('.carousel-track');
  var items = track ? Array.from(track.querySelectorAll('.carousel-item')) : [];
  var prevBtn = document.querySelector('.carousel-arrow.prev');
  var nextBtn = document.querySelector('.carousel-arrow.next');
  var currentIndex = 0;

  function updateCarousel() {
    if (!items.length) return;
    var total = items.length;
    var prevIndex = mod(currentIndex - 1, total);
    var nextIndex = mod(currentIndex + 1, total);

    items.forEach(function (item, index) {
      item.classList.remove('is-active', 'is-prev', 'is-next');
      if (index === currentIndex) {
        item.classList.add('is-active');
      } else if (index === prevIndex) {
        item.classList.add('is-prev');
      } else if (index === nextIndex) {
        item.classList.add('is-next');
      }
    });
  }

  if (items.length) {
    updateCarousel();

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        currentIndex = mod(currentIndex - 1, items.length);
        updateCarousel();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        currentIndex = mod(currentIndex + 1, items.length);
        updateCarousel();
      });
    }

    // Touch swipe (mobile)
    var touchStartX = 0;
    var touchEndX = 0;
    var threshold = 45;
    var viewport = document.querySelector('.carousel-viewport');

    if (viewport) {
      viewport.addEventListener(
        'touchstart',
        function (e) {
          var touch = e.changedTouches[0];
          touchStartX = touch.clientX;
        },
        { passive: true }
      );

      viewport.addEventListener(
        'touchmove',
        function (e) {
          var touch = e.changedTouches[0];
          touchEndX = touch.clientX;
        },
        { passive: true }
      );

      viewport.addEventListener(
        'touchend',
        function () {
          var deltaX = touchEndX - touchStartX;
          if (Math.abs(deltaX) > threshold) {
            if (deltaX < 0) {
              currentIndex = mod(currentIndex + 1, items.length);
            } else {
              currentIndex = mod(currentIndex - 1, items.length);
            }
            updateCarousel();
          }
        },
        { passive: true }
      );
    }
  }

  // BACKGROUND PARTICLES
  var particlesContainer = document.querySelector('.bg-particles');
  if (particlesContainer) {
    var PARTICLE_COUNT = 22;
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var p = document.createElement('span');
      p.className = 'bg-particle';
      var size = 4 + Math.random() * 4;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      var duration = 16 + Math.random() * 16;
      var delay = Math.random() * -duration;
      p.style.animationDuration = duration + 's';
      p.style.animationDelay = delay + 's';
      particlesContainer.appendChild(p);
    }
  }

  // SCROLL REVEAL
  var revealEls = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
})();