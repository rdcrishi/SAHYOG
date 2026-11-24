// pages/donate.js — Sahyog Donate page logic

// ── State ──────────────────────────────────────────────────
const state = {
  foodType: null,
  foodEmoji: null,
  quantity: 10,
  unit: 'plates',
  expiryHours: 4,
  hygieneChecks: { fresh: false, covered: false, unserved: false },
  locationName: 'Brij Bhumi Dhaba',
  locationAddress: 'Near Vishram Ghat, Mathura, UP 281001',
  locationLat: 27.4924,
  locationLng: 77.6737,
  note: '',
  startTime: null,
  timerInterval: null,
  elapsedSeconds: 0
};

// ── Progress: 4 signals ────────────────────────────────────
function getProgress() {
  let done = 0;
  if (state.foodType) done++;
  if (state.quantity > 0) done++;   // always satisfied (starts 10)
  if (state.expiryHours) done++;
  if (state.hygieneChecks.fresh || state.hygieneChecks.covered || state.hygieneChecks.unserved) done++;
  return Math.round((done / 4) * 100);
}

function updateProgress() {
  const pct = getProgress();
  document.getElementById('progress-fill').style.width = pct + '%';
  const canPost = !!state.foodType && !!state.expiryHours;
  const btn = document.getElementById('btn-post-surplus');
  btn.disabled = !canPost;
  document.getElementById('post-btn-text').textContent = canPost
    ? '\uD83C\uDF3F Post Surplus \u2014 ' + state.quantity + ' ' + state.unit + ' of ' + state.foodType
    : 'Select food type & expiry to post';
}

// ── Timer ─────────────────────────────────────────────────
function startTimer() {
  if (state.timerInterval) return;
  state.startTime = Date.now();
  state.timerInterval = setInterval(function() {
    state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
    document.getElementById('listing-timer').textContent = state.elapsedSeconds + 's';
  }, 500);
}

// ── Food type tiles ───────────────────────────────────────
function initFoodTiles() {
  document.querySelectorAll('.food-tile').forEach(function(tile) {
    tile.addEventListener('click', function() {
      document.querySelectorAll('.food-tile').forEach(function(t) { t.classList.remove('selected'); });
      tile.classList.add('selected');
      state.foodType = tile.dataset.type;
      state.foodEmoji = tile.dataset.emoji;
      startTimer();
      tile.classList.add('tile-bounce');
      setTimeout(function() { tile.classList.remove('tile-bounce'); }, 300);
      updateProgress();
    });
  });
}

// ── Quantity ──────────────────────────────────────────────
function updateQtyDisplay() {
  document.getElementById('qty-value').textContent = state.quantity;
  document.getElementById('qty-unit-display').textContent = state.unit;
  document.getElementById('qty-minus').disabled = state.quantity <= 1;
}

function initQuantity() {
  document.getElementById('qty-minus').addEventListener('click', function() {
    if (state.quantity > 1) {
      state.quantity = Math.max(1, state.quantity - (state.quantity > 20 ? 5 : 1));
      updateQtyDisplay(); updateProgress(); startTimer();
    }
  });
  document.getElementById('qty-plus').addEventListener('click', function() {
    state.quantity += state.quantity >= 100 ? 10 : state.quantity >= 20 ? 5 : 1;
    updateQtyDisplay(); updateProgress(); startTimer();
  });

  // Unit chips
  document.querySelectorAll('#unit-chips .chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      document.querySelectorAll('#unit-chips .chip').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');
      state.unit = chip.dataset.unit;
      updateQtyDisplay(); updateProgress(); startTimer();
    });
  });

  // Quick picks
  document.querySelectorAll('.chip-quick').forEach(function(chip) {
    chip.addEventListener('click', function() {
      state.quantity = parseInt(chip.dataset.qty);
      updateQtyDisplay(); updateProgress(); startTimer();
      chip.classList.add('chip-flash');
      setTimeout(function() { chip.classList.remove('chip-flash'); }, 220);
    });
  });

  updateQtyDisplay();
}

// ── Expiry chips ──────────────────────────────────────────
function initExpiry() {
  document.querySelectorAll('#expiry-chips .chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      document.querySelectorAll('#expiry-chips .chip').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');
      state.expiryHours = parseInt(chip.dataset.hours);
      updateProgress(); startTimer();
    });
  });
}

// ── Hygiene toggles ───────────────────────────────────────
function updateSafetyBadge() {
  var all3 = state.hygieneChecks.fresh && state.hygieneChecks.covered && state.hygieneChecks.unserved;
  var badge = document.getElementById('safety-badge');
  if (all3) {
    badge.style.display = 'inline-flex';
    badge.classList.add('badge-pop');
    setTimeout(function() { badge.classList.remove('badge-pop'); }, 400);
  } else {
    badge.style.display = 'none';
  }
}

function initHygiene() {
  document.getElementById('hygiene-fresh').addEventListener('change', function(e) {
    state.hygieneChecks.fresh = e.target.checked; updateSafetyBadge(); updateProgress(); startTimer();
  });
  document.getElementById('hygiene-covered').addEventListener('change', function(e) {
    state.hygieneChecks.covered = e.target.checked; updateSafetyBadge(); updateProgress(); startTimer();
  });
  document.getElementById('hygiene-unserved').addEventListener('change', function(e) {
    state.hygieneChecks.unserved = e.target.checked; updateSafetyBadge(); updateProgress(); startTimer();
  });
}

// ── Mini map ──────────────────────────────────────────────
var miniMap = null;
var miniMarker = null;

function initMiniMap() {
  if (miniMap) return;
  miniMap = L.map('mini-map', {
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    attributionControl: false
  }).setView([state.locationLat, state.locationLng], 15);

  var miniTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(miniMap);

  miniTiles.on('tileerror', function(error) {
    if (error && error.tile && error.tile.src && error.tile.src.indexOf('openstreetmap.fr') === -1) {
      error.tile.src = error.tile.src.replace('tile.openstreetmap.org', 'a.tile.openstreetmap.fr/hot');
    }
  });

  var greenIcon = L.divIcon({
    className: '',
    html: '<div style="width:26px;height:26px;background:#1F7A4D;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
    iconSize: [26, 26],
    iconAnchor: [13, 26]
  });

  miniMarker = L.marker([state.locationLat, state.locationLng], { icon: greenIcon }).addTo(miniMap);

  // Allow tapping map to reposition pin
  miniMap.on('click', function(e) {
    state.locationLat = parseFloat(e.latlng.lat.toFixed(5));
    state.locationLng = parseFloat(e.latlng.lng.toFixed(5));
    miniMarker.setLatLng([state.locationLat, state.locationLng]);
    document.getElementById('location-address').textContent =
      state.locationLat + '\u00B0N, ' + state.locationLng + '\u00B0E (custom pin)';
    showToast('\uD83D\uDCCD Pickup location updated', 'success');
  });

  // Enable dragging to let user pan
  setTimeout(function() { miniMap.dragging.enable(); }, 600);
}

function initLocation() {
  document.getElementById('location-edit-btn').addEventListener('click', function() {
    var newName = prompt('Enter pickup location name:', state.locationName);
    if (newName && newName.trim()) {
      state.locationName = newName.trim();
      document.getElementById('location-name').textContent = state.locationName;
      showToast('Location updated', 'success');
    }
  });
  setTimeout(initMiniMap, 120);
}

// ── Post surplus ──────────────────────────────────────────
function generateId() {
  return 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function postListing() {
  if (!state.foodType || !state.expiryHours) return;

  clearInterval(state.timerInterval);
  var elapsed = state.elapsedSeconds || 0;

  var hygieneNotes = [];
  if (state.hygieneChecks.fresh)    hygieneNotes.push('freshly prepared');
  if (state.hygieneChecks.covered)  hygieneNotes.push('stored covered');
  if (state.hygieneChecks.unserved) hygieneNotes.push('not previously served');

  var safetyVerified = state.hygieneChecks.fresh && state.hygieneChecks.covered && state.hygieneChecks.unserved;
  var descParts = [];
  if (state.note.trim()) descParts.push(state.note.trim());
  if (hygieneNotes.length) descParts.push('Safety: ' + hygieneNotes.join(', ') + '.');

  var isUrgent = state.expiryHours <= 2;

  var newListing = {
    id: generateId(),
    donorId: 'd1',
    title: state.foodEmoji + ' ' + state.foodType + ' (' + state.quantity + ' ' + state.unit + ')',
    quantity: state.quantity,
    unit: state.unit,
    expiresAt: Date.now() + state.expiryHours * 3600 * 1000,
    status: 'available',
    urgent: isUrgent,
    createdAt: Date.now(),
    description: descParts.join(' ') || state.foodType + ' surplus, ' + state.quantity + ' ' + state.unit + '.',
    safetyVerified: safetyVerified,
    lat: state.locationLat,
    lng: state.locationLng,
    locationName: state.locationName
  };

  // Persist
  var listings = getListings();
  listings.unshift(newListing);
  saveListings(listings);

  // Bump impact
  var impact = getImpact();
  var mealEst = state.unit === 'plates' ? state.quantity : state.unit === 'kg' ? state.quantity * 4 : state.quantity * 2;
  impact.mealsSavedToday += Math.round(mealEst);
  impact.totalMealsSaved += Math.round(mealEst);
  impact.activeListings = listings.filter(function(l) { return l.status === 'available'; }).length;
  saveImpact(impact);

  showSuccessScreen(newListing, elapsed);
}

function showSuccessScreen(listing, elapsed) {
  var formScreen = document.getElementById('donate-form-screen') || document.getElementById('main-content');
  if (formScreen) formScreen.style.display = 'none';

  var pWrap = document.getElementById('progress-bar-wrap');
  if (pWrap) pWrap.style.display = 'none';

  var screen = document.getElementById('success-screen');
  if (!screen) return;
  screen.style.display = 'flex';

  // Time badge
  var timeBadge = document.getElementById('success-time-badge');
  if (timeBadge) {
    timeBadge.textContent = elapsed > 0 ? 'Listed in ' + elapsed + 's! ⚡' : 'Listed instantly! ⚡';
  }

  // Summary card
  var expiryH = Math.round((listing.expiresAt - Date.now()) / 3600000);
  var safetyHTML = listing.safetyVerified
    ? '<div class="summary-safety">\u2705 Safety verified</div>' : '';

  document.getElementById('success-summary-card').innerHTML =
    '<div class="summary-row">' +
      '<span class="summary-emoji">' + (listing.title.split(' ')[0] || '\uD83C\uDF71') + '</span>' +
      '<div class="summary-details">' +
        '<div class="summary-title">' + listing.title + '</div>' +
        '<div class="summary-meta">' +
          '<span>\u23F1 Good for ' + expiryH + 'h</span>' +
          '<span>\uD83D\uDCCD ' + listing.locationName + '</span>' +
        '</div>' +
        safetyHTML +
      '</div>' +
    '</div>';

  // Trigger ring animations after a tick
  setTimeout(function() {
    var r1 = screen.querySelector('.success-ring-1');
    var r2 = screen.querySelector('.success-ring-2');
    if (r1) r1.classList.add('ring-expand');
    if (r2) r2.classList.add('ring-expand-2');
  }, 80);
}

// ── Post another reset ────────────────────────────────────
function resetForm() {
  state.foodType = null; state.foodEmoji = null;
  state.quantity = 10; state.unit = 'plates'; state.expiryHours = 4;
  state.hygieneChecks = { fresh: false, covered: false, unserved: false };
  state.note = ''; state.startTime = null; state.timerInterval = null; state.elapsedSeconds = 0;

  document.querySelectorAll('.food-tile').forEach(function(t) { t.classList.remove('selected'); });
  document.querySelectorAll('#unit-chips .chip').forEach(function(c) { c.classList.remove('active'); });
  var platesChip = document.querySelector('#unit-chips .chip[data-unit="plates"]');
  if (platesChip) platesChip.classList.add('active');
  document.querySelectorAll('#expiry-chips .chip').forEach(function(c) { c.classList.remove('active'); });
  var defaultExpiry = document.querySelector('#expiry-chips .chip[data-hours="4"]');
  if (defaultExpiry) defaultExpiry.classList.add('active');
  document.querySelectorAll('.hygiene-toggle input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
  document.getElementById('safety-badge').style.display = 'none';
  document.getElementById('donate-note').value = '';
  document.getElementById('listing-timer').textContent = '0s';

  updateQtyDisplay();
  updateProgress();

  var sScreen = document.getElementById('success-screen');
  if (sScreen) sScreen.style.display = 'none';

  var formScreen = document.getElementById('donate-form-screen') || document.getElementById('main-content');
  if (formScreen) formScreen.style.display = 'block';

  var pWrap = document.getElementById('progress-bar-wrap');
  if (pWrap) pWrap.style.display = 'flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initFoodTiles();
  initQuantity();
  initExpiry();
  initHygiene();
  initLocation();

  document.getElementById('btn-post-surplus').addEventListener('click', postListing);
  document.getElementById('btn-post-another').addEventListener('click', resetForm);

  document.getElementById('donate-note').addEventListener('input', function(e) {
    state.note = e.target.value;
    startTimer();
  });

  updateProgress();
});
