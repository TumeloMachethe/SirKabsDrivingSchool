/*
==========================================================================
SIR KABS DRIVING SCHOOL — QUICK EDIT GUIDE
==========================================================================

1) FORMSUBMIT EMAIL
   Update CONFIG.formSubmitEmail below if the booking email changes.

2) MAKE.COM WEBHOOK
   Replace PASTE_YOUR_MAKE_WEBHOOK_URL_HERE when you are ready to connect Make.

3) STUDY MATERIAL
   The PDF links live in study.html.

4) OWNER PHOTOS
   Current files:
   assets/owners/Owner.jpeg
   assets/owners/Owner2.jpg

5) PASSED STUDENT PHOTOS / HERO SLIDER
   Current files:
   assets/students/student1.jpeg ... student9.jpeg
   Add or replace images in index.html and success.html when needed.

6) CUSTOM PACKAGE BUILDER
   The calculator is in courses.html. Prices are in the PRICES object below.

==========================================================================
*/
const CONFIG = {
  formSubmitEmail: "sirkabsdrivingschool@gmail.com",
  makeWebhookUrl: "PASTE_YOUR_MAKE_WEBHOOK_URL_HERE", // <<< MAKE.COM: PASTE YOUR WEBHOOK HERE
  whatsappNumber: "27780861628"
};

// Current prices (from the Sir Kabs packages flyer).
// If you change a price here, also change the matching option values in courses.html.
const PRICES = {
  code8: 6500,
  code10: 7650,
  learners: 800,
  lesson: 300,
  carHire: 500,
  truckHire: 650
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];


// Launch loader + subtle scroll progress.
const siteLoader = $("#site-loader");
const pageHeader = $(".site-header");
const scrollProgress = document.createElement("div");
scrollProgress.className = "scroll-progress";
scrollProgress.setAttribute("aria-hidden", "true");
document.body.appendChild(scrollProgress);

function hideSiteLoader() {
  if (!siteLoader || siteLoader.classList.contains("is-hidden")) return;
  siteLoader.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
  window.setTimeout(() => siteLoader.remove(), 500);
}

window.addEventListener("load", () => window.setTimeout(hideSiteLoader, 260), { once: true });
window.setTimeout(hideSiteLoader, 1800);

function updateScrollUI() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollTop / maxScroll))})`;
  pageHeader?.classList.toggle("is-scrolled", scrollTop > 24);
}
updateScrollUI();
window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("resize", updateScrollUI);

function showToast(message, duration = 3500) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), duration);
}

// Mobile menu
const menuButton = $(".menu-toggle");
const mainNav = $(".main-nav");
if (menuButton && mainNav) {
  menuButton.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  $$("a", mainNav).forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", event => {
    if (!mainNav.classList.contains("open")) return;
    if (mainNav.contains(event.target) || menuButton.contains(event.target)) return;
    mainNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
}

// Reveal animation
const revealItems = $$(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("visible"));
}

// Current year
const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

// Image fallback for owner/student placeholders.
$$('img[data-fallback]').forEach(img => {
  img.addEventListener("error", () => {
    if (img.dataset.fallbackApplied === "true") return;
    img.dataset.fallbackApplied = "true";
    img.src = img.dataset.fallback;
  });
});

// Minimum booking date = today
const preferredDate = $("#preferred-date");
if (preferredDate) {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  preferredDate.min = local;
}

// Booking page service selection
const serviceSelect = $("#service-select");
const quickServiceButtons = $$('[data-pick-service]');

function selectService(service) {
  if (!serviceSelect || !service) return;
  const optionExists = [...serviceSelect.options].some(option => option.value === service);
  if (optionExists) serviceSelect.value = service;
  quickServiceButtons.forEach(button => button.classList.toggle("active", button.dataset.pickService === service));
}

quickServiceButtons.forEach(button => {
  button.addEventListener("click", () => selectService(button.dataset.pickService));
});

serviceSelect?.addEventListener("change", () => {
  quickServiceButtons.forEach(button => button.classList.toggle("active", button.dataset.pickService === serviceSelect.value));
});

// Example: booking.html?service=Code%208%20Full%20Course
if (serviceSelect) {
  const params = new URLSearchParams(window.location.search);
  const requestedService = params.get("service");
  if (requestedService) selectService(requestedService);
}

// Study note placeholder protection.
// If you have not replaced PASTE-YOUR-... in study.html, prevent a broken 404.
$$('.material-link').forEach(link => {
  link.addEventListener("click", event => {
    const href = link.getAttribute("href") || "";
    if (href.includes("PASTE-YOUR-")) {
      event.preventDefault();
      showToast("This study link is ready for your PDF. Open study.html and search for 'STUDY LINKS — EDIT HERE'.", 5000);
    }
  });
});

// Booking form -> FormSubmit + Make.com
const bookingForm = $("#booking-form");
const submitBtn = $("#submit-btn");
const formStatus = $("#form-status");

function setFormStatus(message, type) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = `form-status show ${type}`;
}

function formToObject(formData) {
  const obj = {};
  for (const [key, value] of formData.entries()) {
    if (obj[key]) obj[key] = `${obj[key]}, ${value}`;
    else obj[key] = value;
  }
  return obj;
}

async function sendToMake(payload) {
  if (!CONFIG.makeWebhookUrl || CONFIG.makeWebhookUrl.includes("PASTE_YOUR_")) {
    return { skipped: true };
  }

  const body = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => body.append(key, String(value ?? "")));

  await fetch(CONFIG.makeWebhookUrl, {
    method: "POST",
    mode: "no-cors",
    body,
    keepalive: true
  });
  return { sent: true };
}

async function sendToFormSubmit(formData) {
  formData.append("_subject", "New Sir Kabs Driving School Booking");
  formData.append("_template", "table");
  formData.append("_captcha", "false");
  formData.append("submitted_at", new Date().toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }));

  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(CONFIG.formSubmitEmail)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Accept": "application/json" },
    body: formData
  });

  if (!response.ok) throw new Error("FormSubmit request failed");
  return response.json().catch(() => ({ success: true }));
}

bookingForm?.addEventListener("submit", async event => {
  event.preventDefault();
  formStatus?.classList.remove("show", "success", "error");

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    setFormStatus("Please complete the required fields before sending your request.", "error");
    return;
  }

  // Basic spam trap
  if (bookingForm.elements.website?.value) return;

  const originalText = submitBtn?.innerHTML || "Send booking request";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending booking…";
  }

  const rawFormData = new FormData(bookingForm);
  const payload = formToObject(rawFormData);
  payload.page_url = window.location.href;
  payload.submitted_at_iso = new Date().toISOString();

  try {
    const [formSubmitResult, makeResult] = await Promise.allSettled([
      sendToFormSubmit(new FormData(bookingForm)),
      sendToMake(payload)
    ]);

    if (formSubmitResult.status === "rejected") throw formSubmitResult.reason;
    if (makeResult.status === "rejected") console.warn("Make.com webhook failed:", makeResult.reason);

    const selected = bookingForm.elements.service?.value || "booking";
    bookingForm.reset();
    quickServiceButtons.forEach(button => button.classList.remove("active"));
    showToast("Booking request sent successfully.");
    window.location.href = `thank.html?service=${encodeURIComponent(selected)}`;
  } catch (error) {
    console.error(error);
    setFormStatus("We could not send the booking online. Please try again, or use the WhatsApp button to contact Sir Kabs directly.", "error");
    showToast("Booking not sent — please try again or use WhatsApp.", 5000);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }
});

/* ======================================================================
   HOMEPAGE HERO SLIDER
   Automatic on desktop and mobile. No visible arrow/dot buttons.
   Mobile users can still swipe left/right naturally.
   ====================================================================== */
const heroSlider = $('[data-hero-slider]');
if (heroSlider) {
  const slides = $$('.hero-slide', heroSlider);
  const progress = $('.hero-slider-progress span', heroSlider);
  let currentSlide = 0;
  let heroTimer;
  let touchStartX = 0;

  const restartProgress = () => {
    if (!progress) return;
    progress.style.animation = 'none';
    void progress.offsetWidth;
    progress.style.animation = '';
  };

  const showHeroSlide = index => {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === currentSlide));
    restartProgress();
  };

  const stopHeroSlider = () => {
    clearInterval(heroTimer);
    heroSlider.classList.add('is-paused');
  };

  const startHeroSlider = () => {
    clearInterval(heroTimer);
    heroSlider.classList.remove('is-paused');
    heroTimer = setInterval(() => showHeroSlide(currentSlide + 1), 4800);
  };

  heroSlider.addEventListener('mouseenter', stopHeroSlider);
  heroSlider.addEventListener('mouseleave', startHeroSlider);
  heroSlider.addEventListener('focusin', stopHeroSlider);
  heroSlider.addEventListener('focusout', startHeroSlider);

  heroSlider.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches?.[0]?.clientX ?? 0;
    stopHeroSlider();
  }, { passive: true });

  heroSlider.addEventListener('touchend', event => {
    const touchEndX = event.changedTouches?.[0]?.clientX ?? touchStartX;
    const distance = touchEndX - touchStartX;
    if (Math.abs(distance) > 45) showHeroSlide(currentSlide + (distance < 0 ? 1 : -1));
    startHeroSlider();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHeroSlider();
    else startHeroSlider();
  });

  showHeroSlide(0);
  startHeroSlider();
}

/* ======================================================================
   BUILD-YOUR-OWN PACKAGE CALCULATOR
   Prices come from the Sir Kabs packages flyer (see PRICES above):
   Code 8 R6,500, Code 10 R7,650, Learner's Licence R800,
   extra lessons R300 each, car hire R500, truck hire R650.
   Code 8 and Code 10 packages already include vehicle hire, so the
   separate hire options are switched off when one of them is selected.
   ====================================================================== */
const packageBuilder = $('[data-package-builder]');
if (packageBuilder) {
  const baseSelect = $('#package-base');
  const hoursInput = $('#package-hours');
  const hoursValue = $('#package-hours-value');
  const studyInput = $('#package-study');
  const summaryText = $('#package-summary-text');
  const totalText = $('#package-total');
  const bookButton = $('#package-book-button');
  const includedNote = $('#package-included-note');
  const vehicleInputs = $$('input[name="package_vehicle"]', packageBuilder);

  const money = value => `R${Number(value).toLocaleString('en-ZA')}`;

  const updatePackage = () => {
    const basePrice = Number(baseSelect?.value || 0);
    const baseLabel = baseSelect?.selectedOptions?.[0]?.dataset.label || 'Lessons only';
    const hireIncluded = basePrice === PRICES.code8 || basePrice === PRICES.code10;

    // Vehicle hire is included in the full packages, so lock it out there.
    if (hireIncluded) {
      const none = vehicleInputs.find(input => Number(input.value) === 0);
      if (none) none.checked = true;
    }
    vehicleInputs.forEach(input => { input.disabled = hireIncluded && Number(input.value) !== 0; });
    if (includedNote) includedNote.hidden = !hireIncluded;

    const lessons = Number(hoursInput?.value || 0);
    const lessonsPrice = lessons * PRICES.lesson;
    const vehicle = vehicleInputs.find(input => input.checked);
    const vehiclePrice = Number(vehicle?.value || 0);
    const vehicleLabel = vehicle?.dataset.label || 'No vehicle hire';
    const addStudy = Boolean(studyInput?.checked);
    const total = basePrice + lessonsPrice + vehiclePrice;

    if (hoursValue) hoursValue.textContent = String(lessons);

    const parts = [];
    if (basePrice > 0) parts.push(baseLabel);
    if (lessons > 0) parts.push(`${lessons} extra lesson${lessons === 1 ? '' : 's'}`);
    if (vehiclePrice > 0) parts.push(vehicleLabel);
    if (addStudy) parts.push('Learner / study support (price to confirm)');
    if (!parts.length) parts.push('Custom request — details to confirm');

    const plan = parts.join(' + ');
    if (summaryText) summaryText.textContent = plan;
    if (totalText) totalText.textContent = total > 0 ? money(total) : 'To confirm';

    if (bookButton) {
      const params = new URLSearchParams({
        service: 'Custom Package',
        custom: plan,
        total: total > 0 ? String(total) : ''
      });
      bookButton.href = `booking.html?${params.toString()}`;
    }
  };

  baseSelect?.addEventListener('change', updatePackage);
  hoursInput?.addEventListener('input', updatePackage);
  studyInput?.addEventListener('change', updatePackage);
  vehicleInputs.forEach(input => input.addEventListener('change', updatePackage));
  updatePackage();
}

/* ======================================================================
   SHOW A CUSTOM PACKAGE ON THE BOOKING PAGE
   The package is also copied into hidden form fields so both FormSubmit
   and Make.com receive it with the booking.
   ====================================================================== */
if (bookingForm) {
  const bookingParams = new URLSearchParams(window.location.search);
  const customPlan = bookingParams.get('custom');
  const customTotal = bookingParams.get('total');
  const customPlanField = $('#custom-plan-field');
  const customTotalField = $('#custom-total-field');
  const customSummary = $('#custom-package-summary');
  const customSummaryText = $('#custom-package-summary-text');
  const customSummaryTotal = $('#custom-package-summary-total');

  if (customPlan) {
    selectService('Custom Package');
    if (customPlanField) customPlanField.value = customPlan;
    if (customTotalField) customTotalField.value = customTotal ? `R${Number(customTotal).toLocaleString('en-ZA')}` : 'To confirm';
    if (customSummaryText) customSummaryText.textContent = customPlan;
    if (customSummaryTotal) customSummaryTotal.textContent = customTotal ? `Estimated total: R${Number(customTotal).toLocaleString('en-ZA')}` : 'Estimated total: To be confirmed';
    if (customSummary) customSummary.hidden = false;
  }
}
