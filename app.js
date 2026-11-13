// app.js — shared across all Sahyog pages (v3 — polished for demo)

// ── Role switcher ──────────────────────────────────────────
var ROLE_KEY = 'sahyog_role';
var currentRole = localStorage.getItem(ROLE_KEY) || 'donor';

function applyRole(role) {
  currentRole = role;
  localStorage.setItem(ROLE_KEY, role);
  document.body.dataset.role = role;

  // Update all role buttons on the page
  document.querySelectorAll('.role-btn').forEach(function(btn) {
    var isActive = btn.dataset.role === role;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  // Notify page scripts
  document.dispatchEvent(new CustomEvent('rolechange', { detail: { role: role } }));
}

function initRoleSwitcher() {
  document.querySelectorAll('.role-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      applyRole(btn.dataset.role);
      var roleName = btn.dataset.role === 'donor' ? 'Donor' : btn.dataset.role === 'volunteer' ? 'Volunteer' : 'Shelter Manager';
      showToast('Switched to ' + roleName + ' view', 'success');
    });
  });
  applyRole(currentRole);
}

// ── Bottom tabs active state ──────────────────────────────
function initTabs() {
  var page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.tab-item').forEach(function(tab) {
    var href = (tab.getAttribute('href') || '').split('/').pop();
    var isActive = href === page || (page === '' && href === 'index.html');
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

// ── Toast helper ──────────────────────────────────────────
function showToast(msg, type) {
  type = type || '';
  var container = document.getElementById('toast-container');
  if (!container) return;
  var t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.setAttribute('role', 'status');
  t.setAttribute('aria-live', 'polite');
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(function() {
    t.style.opacity = '0';
    t.style.transform = 'translateX(110%)';
    setTimeout(function() { t.remove(); }, 320);
  }, 2800);
}

// ── Skip to main content link (a11y) ─────────────────────
function initSkipLink() {
  var skip = document.getElementById('skip-to-main');
  if (skip) {
    skip.addEventListener('click', function(e) {
      e.preventDefault();
      var main = document.getElementById('main-content') ||
                 document.getElementById('donate-form-screen') ||
                 document.querySelector('main');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
        main.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// ── Demo Guided Tour ──────────────────────────────────────
var TOUR_STEPS = [
  {
    selector: '#cta-donate',
    fallbackSelector: 'a[href="donate.html"]',
    title: '① List Surplus in 30 Seconds',
    text: 'Restaurants, sweet shops & caterers select food category, tap quantity, verify hygiene, and post in under 30 seconds.',
    position: 'bottom'
  },
  {
    selector: 'a[href="map.html"]',
    fallbackSelector: '#cta-volunteer',
    title: '② Live Map & Urgency Clocks',
    text: 'Surplus appears immediately with green, orange, or pulsing red urgency pins and real-time spoilage countdown rings.',
    position: 'top'
  },
  {
    selector: '#listings-container',
    fallbackSelector: '.stats-strip',
    title: '③ Claim & Safe Handoff',
    text: 'Volunteers claim pickups, route to the nearest night shelter, and verify collection with a 4-digit secure handoff code.',
    position: 'top'
  },
  {
    selector: 'a[href="impact.html"]',
    fallbackSelector: '#stat-meals',
    title: '④ Live Community Impact',
    text: 'Every rescued meal updates meals saved, kg food diverted, and CO₂ emissions avoided with downloadable summary cards.',
    position: 'top'
  }
];

var tourIndex = 0;
var tourOverlay = null;

function startTour() {
  tourIndex = 0;
  showTourStep();
}

function showTourStep() {
  removeTourStep();
  if (tourIndex >= TOUR_STEPS.length) {
    showToast('🎉 Tour complete! Ready to explore Sahyog.', 'success');
    return;
  }

  var step = TOUR_STEPS[tourIndex];
  var target = document.querySelector(step.selector) || document.querySelector(step.fallbackSelector);

  // Overlay
  tourOverlay = document.createElement('div');
  tourOverlay.className = 'tour-overlay';
  tourOverlay.setAttribute('role', 'dialog');
  tourOverlay.setAttribute('aria-modal', 'true');
  tourOverlay.setAttribute('aria-label', 'Demo Tour Step ' + (tourIndex + 1) + ' of ' + TOUR_STEPS.length);
  document.body.appendChild(tourOverlay);

  // Tooltip card
  var tip = document.createElement('div');
  tip.className = 'tour-tooltip';
  tip.innerHTML =
    '<div class="tour-header">' +
      '<span class="tour-step-badge">Step ' + (tourIndex + 1) + ' of ' + TOUR_STEPS.length + '</span>' +
      '<button class="tour-close-btn" id="tour-close" aria-label="Close tour">✕</button>' +
    '</div>' +
    '<h3 class="tour-title">' + step.title + '</h3>' +
    '<p class="tour-text">' + step.text + '</p>' +
    '<div class="tour-actions">' +
      '<button class="tour-skip" id="tour-skip" aria-label="Skip guided tour">Skip</button>' +
      (tourIndex > 0 ? '<button class="tour-prev" id="tour-prev">← Back</button>' : '') +
      '<button class="tour-next" id="tour-next">' +
        (tourIndex < TOUR_STEPS.length - 1 ? 'Next →' : 'Finish ✓') +
      '</button>' +
    '</div>';
  document.body.appendChild(tip);

  // Scroll target into view gently if needed
  if (target) {
    target.classList.add('tour-highlight');
    var isFixed = false;
    var p = target;
    while (p && p !== document.body) {
      var pos = window.getComputedStyle(p).position;
      if (pos === 'fixed') { isFixed = true; break; }
      p = p.parentElement;
    }

    var rect = target.getBoundingClientRect();

    if (isFixed || step.position === 'top') {
      // For fixed bottom navigation or elements near bottom, position card nicely above
      tip.style.position = 'fixed';
      tip.style.bottom = Math.max(76, (window.innerHeight - rect.top + 16)) + 'px';
      tip.style.left = '50%';
      tip.style.transform = 'translateX(-50%)';
    } else {
      tip.style.position = 'fixed';
      tip.style.top = Math.min(window.innerHeight - 240, Math.max(80, rect.bottom + 16)) + 'px';
      tip.style.left = '50%';
      tip.style.transform = 'translateX(-50%)';
    }
  } else {
    tip.style.position = 'fixed';
    tip.style.top = '50%';
    tip.style.left = '50%';
    tip.style.transform = 'translate(-50%, -50%)';
  }

  // Button actions
  var nextBtn  = document.getElementById('tour-next');
  var prevBtn  = document.getElementById('tour-prev');
  var skipBtn  = document.getElementById('tour-skip');
  var closeBtn = document.getElementById('tour-close');

  if (nextBtn)  nextBtn.addEventListener('click', function() { tourIndex++; showTourStep(); });
  if (prevBtn)  prevBtn.addEventListener('click', function() { tourIndex--; showTourStep(); });
  if (skipBtn)  skipBtn.addEventListener('click', removeTourStep);
  if (closeBtn) closeBtn.addEventListener('click', removeTourStep);
  if (tourOverlay) tourOverlay.addEventListener('click', removeTourStep);

  if (nextBtn) nextBtn.focus();

  // Escape key handler
  function escHandler(e) {
    if (e.key === 'Escape') {
      removeTourStep();
      document.removeEventListener('keydown', escHandler);
    }
  }
  document.addEventListener('keydown', escHandler);
}

function removeTourStep() {
  var elements = document.querySelectorAll('.tour-tooltip, .tour-overlay');
  elements.forEach(function(el) { el.remove(); });
  document.querySelectorAll('.tour-highlight').forEach(function(el) {
    el.classList.remove('tour-highlight');
  });
  tourOverlay = null;
}

// ── Demo Reset ────────────────────────────────────────────
function resetDemoData() {
  // Clear all sahyog_ keys
  var keys = [];
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (k && k.indexOf('sahyog_') === 0) keys.push(k);
  }
  keys.forEach(function(k) { localStorage.removeItem(k); });

  showToast('Mock data reset to default.', 'success');

  // Check if already on index.html
  var currentPage = location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'index.html' || currentPage === '') {
    // Re-render local page data
    if (typeof updateStats === 'function') updateStats();
    if (typeof renderListings === 'function') renderListings();
    setTimeout(startTour, 600);
  } else {
    // Set pending tour flag and redirect to index.html
    localStorage.setItem('sahyog_start_tour', '1');
    window.location.href = 'index.html';
  }
}

// ── Auto-start tour if redirected ─────────────────────────
function checkPendingTour() {
  if (localStorage.getItem('sahyog_start_tour') === '1' || new URLSearchParams(window.location.search).get('tour') === '1') {
    localStorage.removeItem('sahyog_start_tour');
    setTimeout(startTour, 500);
  }
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initSkipLink();
  initRoleSwitcher();
  initTabs();
  checkPendingTour();

  // Demo mode footer button
  var demoBtn = document.getElementById('btn-demo-mode');
  if (demoBtn) {
    demoBtn.addEventListener('click', function() {
      resetDemoData();
    });
  }
});
