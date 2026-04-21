/* =============================================
   FINCA VILLA LIDA — Main JavaScript
   Scroll behavior, form submission, animations
   ============================================= */

// ─── 1. NAVBAR SCROLL BEHAVIOR ───────────────
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const iconOpen = document.getElementById('icon-open');
const iconClose = document.getElementById('icon-close');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('navbar-scrolled');
    navbar.classList.remove('navbar-transparent');
  } else {
    navbar.classList.remove('navbar-scrolled');
    navbar.classList.add('navbar-transparent');
  }
  updateActiveNavLink();
});

// ─── 2. MOBILE MENU TOGGLE ───────────────────
menuToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('menu-open');
  mobileMenu.classList.toggle('hidden', false); // ensure it's not hidden
  iconOpen.classList.toggle('hidden', isOpen);
  iconClose.classList.toggle('hidden', !isOpen);

  if (!isOpen) {
    setTimeout(() => mobileMenu.classList.add('hidden'), 350);
  }
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('menu-open');
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
    setTimeout(() => mobileMenu.classList.add('hidden'), 350);
  });
});


// ─── 3. ACTIVE NAV LINK HIGHLIGHT ────────────
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let currentSection = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}


// ─── 4. SCROLL REVEAL ANIMATION ──────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.style.animationDelay
          ? parseFloat(entry.target.style.animationDelay) * 1000
          : 0;
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);

document.querySelectorAll('.reveal-on-scroll').forEach(el => {
  revealObserver.observe(el);
});


// ─── 5. COUNTER ANIMATION ────────────────────
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        if (!isNaN(target)) {
          animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('[data-target]').forEach(el => {
  counterObserver.observe(el);
});

function animateCounter(el, target) {
  const duration = 1800;
  const start = performance.now();
  const initialText = el.innerHTML;

  // preserve any HTML after the number (e.g. <span class="text-2xl">%</span>)
  const suffix = initialText.replace(/^[\d.]+/, '').trim();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(eased * target);
    el.innerHTML = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.innerHTML = target + suffix;
  }
  requestAnimationFrame(update);
}


// ─── 6. SMOOTH SCROLL ────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


// ─── 7. CONTACT FORM HANDLER ─────────────────
const form = document.getElementById('contacto-form');
const successMsg = document.getElementById('form-success');
const errorMsg = document.getElementById('form-error');
const submitBtn = document.getElementById('submit-btn');
const submitIcon = document.getElementById('submit-icon');
const submitSpinner = document.getElementById('submit-spinner');
const submitText = document.getElementById('submit-text');

// ── Field validation helpers
function validateField(input) {
  const group = input.closest('.form-group');
  const errorEl = group.querySelector('.field-error');
  let valid = true;

  input.classList.remove('border-red-400', 'border-verde-claro');

  if (!input.value.trim()) {
    valid = false;
  } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
    valid = false;
  } else if (input.type === 'tel' && input.value.replace(/\D/g, '').length < 7) {
    valid = false;
  }

  if (!valid) {
    input.classList.add('border-red-400');
    errorEl.classList.remove('hidden');
  } else {
    input.classList.add('border-verde-claro');
    errorEl.classList.add('hidden');
  }
  return valid;
}

// Live validation on blur
['nombre', 'telefono', 'correo', 'mensaje'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('blur', () => validateField(el));
  el.addEventListener('input', () => {
    if (el.classList.contains('border-red-400')) validateField(el);
  });
});

// ── Form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre');
  const telefono = document.getElementById('telefono');
  const correo = document.getElementById('correo');
  const mensaje = document.getElementById('mensaje');

  const valid = [nombre, telefono, correo, mensaje]
    .map(validateField)
    .every(Boolean);

  if (!valid) return;

  // Loading state
  setLoading(true);
  successMsg.classList.add('hidden');
  errorMsg.classList.add('hidden');

  // Collect data
  const payload = {
    nombre: nombre.value.trim(),
    telefono: telefono.value.trim(),
    correo: correo.value.trim(),
    mensaje: mensaje.value.trim(),
    timestamp: new Date().toISOString(),
    origen: 'Formulario Web Villa Lida'
  };

  try {
    // ── PRIMARY: Formspree endpoint
    // Replace 'YOUR_FORMSPREE_ID' with your actual Formspree form ID
    // Get one free at: https://formspree.io
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORMSPREE_ID';

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: payload.nombre,
        phone: payload.telefono,
        email: payload.correo,
        message: payload.mensaje,
        _subject: `Nueva solicitud de ${payload.nombre} – Finca Villa Lida`
      })
    });

    if (response.ok) {
      showSuccess();
      form.reset();
      // Clear validation styles
      document.querySelectorAll('.form-input').forEach(i => {
        i.classList.remove('border-red-400', 'border-verde-claro');
      });
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    console.error('Form submission error:', err);

    // ── FALLBACK: mailto link
    const subject = encodeURIComponent(`Solicitud de ${payload.nombre} – Finca Villa Lida`);
    const body = encodeURIComponent(
      `Nombre: ${payload.nombre}\nTeléfono/WhatsApp: ${payload.telefono}\nCorreo: ${payload.correo}\n\nMensaje:\n${payload.mensaje}`
    );
    const mailto = `mailto:contacto@villalida.com?subject=${subject}&body=${body}`;
    window.location.href = mailto;

    // Show partial success
    showSuccess();
    form.reset();
  } finally {
    setLoading(false);
  }
});

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitIcon.classList.toggle('hidden', loading);
  submitSpinner.classList.toggle('hidden', !loading);
  submitText.textContent = loading ? 'Enviando...' : 'Enviar Mensaje';
  submitBtn.classList.toggle('opacity-70', loading);
  submitBtn.classList.toggle('cursor-not-allowed', loading);
}

function showSuccess() {
  successMsg.classList.remove('hidden');
  successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  // Auto-hide after 8 seconds
  setTimeout(() => successMsg.classList.add('hidden'), 8000);
}


// ─── 8. PARALLAX EFFECT ON HERO ──────────────
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const heroSection = document.getElementById('inicio');
      if (heroSection) {
        const scrollY = window.scrollY;
        const overlay = heroSection.querySelector('.hero-overlay');
        if (overlay && scrollY < window.innerHeight) {
          overlay.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
      }
      ticking = false;
    });
    ticking = true;
  }
});


// ─── 9. INIT ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateActiveNavLink();
  console.log('%c🌿 Finca Villa Lida — Página cargada', 'color: #2d6a4a; font-size:14px; font-weight:bold;');
});


// ═══════════════════════════════════════════════
//  10. GALERÍA INTERACTIVA — LIGHTBOX + FILTROS
// ═══════════════════════════════════════════════

let currentLightboxIndex = 0;
let visibleItems = [];

function buildVisibleItems() {
  visibleItems = Array.from(document.querySelectorAll('#gallery-grid .gallery-item:not(.hidden-item)'));
}

function openLightbox(indexInGrid) {
  buildVisibleItems();
  // Find clicked item's position in visibleItems
  const allItems = Array.from(document.querySelectorAll('#gallery-grid .gallery-item'));
  const clickedItem = allItems[indexInGrid];
  const visibleIndex = visibleItems.indexOf(clickedItem);
  currentLightboxIndex = visibleIndex >= 0 ? visibleIndex : 0;

  showLightboxImage(currentLightboxIndex);

  const lightbox = document.getElementById('lightbox');
  lightbox.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function showLightboxImage(index) {
  const item = visibleItems[index];
  if (!item) return;

  const src   = item.dataset.src;
  const title = item.dataset.title || '';
  const desc  = item.dataset.desc  || '';
  const total = visibleItems.length;

  const img     = document.getElementById('lightbox-img');
  const spinner = document.getElementById('lightbox-spinner');
  const titleEl = document.getElementById('lightbox-title');
  const descEl  = document.getElementById('lightbox-desc');
  const counter = document.getElementById('lightbox-counter');

  // Show spinner, hide image
  img.classList.add('loading');
  spinner.classList.add('is-visible');

  // Update caption
  titleEl.innerHTML = title;
  descEl.innerHTML  = desc;
  counter.textContent = `${index + 1} / ${total}`;

  // Load image
  const newImg = new Image();
  newImg.onload = () => {
    img.src = src;
    img.classList.remove('loading');
    spinner.classList.remove('is-visible');
  };
  newImg.onerror = () => {
    img.src = src; // try anyway
    img.classList.remove('loading');
    spinner.classList.remove('is-visible');
  };
  newImg.src = src;
}

function changeLightbox(direction) {
  const newIndex = (currentLightboxIndex + direction + visibleItems.length) % visibleItems.length;
  currentLightboxIndex = newIndex;
  showLightboxImage(currentLightboxIndex);
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('is-open');
  document.body.style.overflow = '';
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || !lightbox.classList.contains('is-open')) return;

  if (e.key === 'ArrowRight') changeLightbox(1);
  if (e.key === 'ArrowLeft')  changeLightbox(-1);
  if (e.key === 'Escape')     closeLightbox();
});

// Touch/swipe support for mobile
(function() {
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      changeLightbox(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
})();

// Gallery filter function
function filterGallery(category) {
  const items = document.querySelectorAll('#gallery-grid .gallery-item');
  const btns  = document.querySelectorAll('.gallery-filter-btn');

  // Update active button
  btns.forEach(btn => {
    if (btn.dataset.filter === category) {
      btn.classList.add('active-filter');
      btn.style.cssText = 'background:#1a4a2e!important;color:#fff!important;border-color:#1a4a2e!important;box-shadow:0 4px 15px rgba(26,74,46,0.35)';
    } else {
      btn.classList.remove('active-filter');
      btn.style.cssText = '';
    }
  });

  // Show/hide items with animation
  items.forEach((item, i) => {
    const cat = item.dataset.category;
    const show = category === 'todas' || cat === category;

    if (show) {
      item.classList.remove('hidden-item');
      item.style.animation = `fadeUp 0.5s ease-out ${i * 0.05}s both`;
    } else {
      item.classList.add('hidden-item');
    }
  });

  buildVisibleItems();
}

