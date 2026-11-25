// pages/claim-flow.js — Volunteer claim & deliver flow

// ── Shared utilities (uses globals from map.js & app.js) ──
// USER_LAT, USER_LNG, leafletMap, markerMap, haversine,
// donorName, renderFeed, currentRole  — all global from map.js

// ── Storage ────────────────────────────────────────────────
function getMyDrops() { return loadFromStorage('my_drops', []); }
function saveMyDrops(d) { saveToStorage('my_drops', d); }

// ── Step config ────────────────────────────────────────────
var STEPS = [
  { label: 'Claimed',    icon: '📋', btnText: null },
  { label: 'Picked Up',  icon: '📦', btnText: '📦 Mark as Picked Up' },
  { label: 'On the Way', icon: '🚴', btnText: '🚴 I\'m On the Way!' },
  { label: 'Delivered',  icon: '✅', btnText: '✅ Mark as Delivered' }
];

// ── Active state ───────────────────────────────────────────
var activeClaim      = null;
var routeLayer       = null;
var volunteerMarker  = null;
var animInterval     = null;

// ── Utility: nearest pickup point ─────────────────────────
function nearestPickup(lat, lng) {
  var pts = SAHYOG_DATA.pickupPoints;
  var best = pts[0], bestD = Infinity;
  pts.forEach(function(p) {
    var d = haversine(lat, lng, p.lat, p.lng);
    if (d < bestD) { bestD = d; best = p; }
  });
  return { point: best, distKm: bestD };
}

// ── Utility: generate 4-digit code ─────────────────────────
function genCode() { return String(1000 + Math.floor(Math.random() * 9000)); }

// ── Utility: build route coords (3-point arc) ──────────────
function buildRouteCoords(lat1, lng1, lat2, lng2) {
  var midLat = (lat1 + lat2) / 2 + (Math.random() - 0.5) * 0.006;
  var midLng = (lng1 + lng2) / 2 + (Math.random() - 0.5) * 0.006;
  return [[lat1, lng1], [midLat, midLng], [lat2, lng2]];
}

// ── Utility: interpolate route for animation ───────────────
function interpolatePts(coords, totalSteps) {
  var pts = [];
  var segs = coords.length - 1;
  var perSeg = Math.ceil(totalSteps / segs);
  for (var i = 0; i < segs; i++) {
    var from = coords[i], to = coords[i + 1];
    for (var j = 0; j < perSeg; j++) {
      var t = j / perSeg;
      pts.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);
    }
  }
  pts.push(coords[coords.length - 1]);
  return pts;
}

// ── Utility: estimate delivery minutes ────────────────────
function estMinutes(distKm) { return Math.max(4, Math.round((distKm / 20) * 60)); }

// ── OPEN CLAIM DRAWER ─────────────────────────────────────
function openClaimDrawer(listingId) {
  var listing = getListings().find(function(l) { return l.id === listingId; });
  if (!listing) { showToast('Listing not found.', ''); return; }
  if (listing.status === 'claimed') { showToast('Already claimed!', ''); return; }

  // Resolve donor coords
  var dlat, dlng;
  if (listing.lat && listing.lng) { dlat = listing.lat; dlng = listing.lng; }
  else {
    var donor = SAHYOG_DATA.donors.find(function(d) { return d.id === listing.donorId; });
    dlat = donor ? donor.lat : 27.4924;
    dlng = donor ? donor.lng : 77.6737;
  }

  var nn      = nearestPickup(dlat, dlng);
  var pickup  = nn.point;
  var distKm  = nn.distKm + 0.4; // add vol-to-donor buffer
  var estMin  = estMinutes(distKm);
  var shelfMin = Math.max(0, Math.floor((listing.expiresAt - Date.now()) / 60000));
  var bufMin  = shelfMin - estMin;
  var route   = buildRouteCoords(dlat, dlng, pickup.lat, pickup.lng);
  var code    = genCode();
  var meals   = listing.unit === 'plates' ? listing.quantity
              : listing.unit === 'kg' ? listing.quantity * 4
              : listing.quantity * 2;
  var emoji   = listing.title ? (listing.title.match(/\p{Emoji}/u) || ['🍱'])[0] : '🍱';

  // Mark as claimed in storage
  var listings = getListings();
  var idx = listings.findIndex(function(l) { return l.id === listingId; });
  if (idx !== -1) { listings[idx].status = 'claimed'; saveListings(listings); }

  // Build claim object (step 0 = Claimed)
  activeClaim = {
    id:          'claim_' + Date.now().toString(36),
    listingId:   listingId,
    listing:     listing,
    emoji:       emoji,
    donorName:   donorName(listing.donorId),
    pickup:      pickup,
    claimedAt:   Date.now(),
    handoffCode: code,
    step:        0,
    estMin:      estMin,
    shelfMin:    shelfMin,
    bufMin:      bufMin,
    routeCoords: route,
    mealCount:   meals,
    dlat:        dlat,
    dlng:        dlng
  };

  // Persist
  var drops = getMyDrops();
  drops.unshift(activeClaim);
  saveMyDrops(drops);

  // Store pending handoff code for donor
  saveToStorage('pending_code', { code: code, listingId: listingId });

  // Update map
  drawRouteOnMap(route);
  if (typeof leafletMap !== 'undefined') {
    if (markerMap && markerMap[listingId]) {
      leafletMap.removeLayer(markerMap[listingId]);
      delete markerMap[listingId];
    }
    leafletMap.closePopup();
  }

  // Remove from feed
  removeFeedCard(listingId);

  // Impact: decrement active count
  var impact = getImpact();
  impact.activeListings = Math.max(0, (impact.activeListings || 1) - 1);
  saveImpact(impact);

  // Open drawer
  renderDrawerContent();
  openDrawer();
  updateMyDropsBadge();
}

// ── ROUTE: draw dashed polyline ────────────────────────────
function drawRouteOnMap(coords) {
  clearRouteFromMap();
  if (typeof leafletMap === 'undefined') return;
  routeLayer = L.polyline(coords, {
    color:     '#1F7A4D',
    weight:    5,
    dashArray: '12, 8',
    lineCap:   'round',
    opacity:   0.88
  }).addTo(leafletMap);
  leafletMap.fitBounds(routeLayer.getBounds(), { padding: [50, 50], animate: true, maxZoom: 15 });

  // Add endpoint markers
  var donorEnd = L.circleMarker(coords[0], { radius: 8, fillColor: '#1F7A4D', color: '#fff', weight: 2.5, fillOpacity: 1 })
    .addTo(leafletMap).bindTooltip('📦 Donor', { permanent: false });
  var pickupEnd = L.circleMarker(coords[coords.length - 1], { radius: 8, fillColor: '#F59E0B', color: '#fff', weight: 2.5, fillOpacity: 1 })
    .addTo(leafletMap).bindTooltip('🏠 Pickup Point', { permanent: false });

  // Store so we can remove them
  if (!window._routeEndMarkers) window._routeEndMarkers = [];
  window._routeEndMarkers.push(donorEnd, pickupEnd);
}

function clearRouteFromMap() {
  if (routeLayer && typeof leafletMap !== 'undefined') {
    leafletMap.removeLayer(routeLayer);
    routeLayer = null;
  }
  if (window._routeEndMarkers) {
    window._routeEndMarkers.forEach(function(m) {
      if (typeof leafletMap !== 'undefined') leafletMap.removeLayer(m);
    });
    window._routeEndMarkers = [];
  }
}

// ── VOLUNTEER MARKER ANIMATION ─────────────────────────────
function startVolAnimation(coords) {
  if (typeof leafletMap === 'undefined') return;
  clearVolMarker();
  var icon = L.divIcon({
    className: '',
    html: '<div class="vol-marker-wrap"><span class="vol-marker-emoji">🚴</span></div>',
    iconSize:   [36, 36],
    iconAnchor: [18, 18]
  });
  var pts = interpolatePts(coords, 48);  // 48 steps × 500ms = 24 s
  var step = 0;
  volunteerMarker = L.marker(pts[0], { icon: icon, zIndexOffset: 1200 }).addTo(leafletMap);
  animInterval = setInterval(function() {
    step++;
    if (step >= pts.length) { clearInterval(animInterval); animInterval = null; return; }
    volunteerMarker.setLatLng(pts[step]);
  }, 500);
}

function clearVolMarker() {
  if (animInterval) { clearInterval(animInterval); animInterval = null; }
  if (volunteerMarker && typeof leafletMap !== 'undefined') {
    leafletMap.removeLayer(volunteerMarker);
    volunteerMarker = null;
  }
}

// ── REMOVE CARD FROM FEED ──────────────────────────────────
function removeFeedCard(id) {
  var card = document.getElementById('card-' + id);
  if (card) {
    card.classList.add('card-fading');
    setTimeout(function() { card.remove(); }, 650);
  }
  var cntEl = document.getElementById('feed-count');
  if (cntEl) {
    var n = parseInt(cntEl.textContent) || 1;
    var r = Math.max(0, n - 1);
    cntEl.textContent = r + ' listing' + (r !== 1 ? 's' : '');
  }
}

// ── RENDER DRAWER CONTENT ──────────────────────────────────
function renderDrawerContent() {
  var el = document.getElementById('claim-drawer-body');
  if (!el || !activeClaim) return;
  var c    = activeClaim;
  var step = c.step;

  /* ─ Tracker ─ */
  var trackerHTML = '<div class="tracker">';
  for (var i = 0; i < STEPS.length; i++) {
    var isDone   = i < step;
    var isActive = i === step;
    var cls = 'tracker-step' + (isDone ? ' done' : isActive ? ' active' : '');
    trackerHTML +=
      '<div class="' + cls + '">' +
        '<div class="tracker-dot">' + (isDone ? '✓' : STEPS[i].icon) + '</div>' +
        (i < STEPS.length - 1 ? '<div class="tracker-line' + (isDone ? ' done' : '') + '"></div>' : '') +
        '<div class="tracker-lbl">' + STEPS[i].label + '</div>' +
      '</div>';
  }
  trackerHTML += '</div>';

  /* ─ Listing summary ─ */
  var listHTML =
    '<div class="drawer-listing-card">' +
      '<span class="drawer-listing-emoji">' + c.emoji + '</span>' +
      '<div class="drawer-listing-info">' +
        '<div class="drawer-listing-title">' + c.listing.title + '</div>' +
        '<div class="drawer-listing-sub">~' + c.mealCount + ' meals · ' + c.donorName + '</div>' +
        (c.listing.safetyVerified ? '<span class="feed-safety" style="margin-top:4px;display:inline-flex;">✅ Safety verified</span>' : '') +
      '</div>' +
    '</div>';

  /* ─ Route info ─ */
  var routeHTML =
    '<div class="route-block">' +
      '<div class="route-node">' +
        '<div class="route-dot green-dot"></div>' +
        '<div class="route-node-info">' +
          '<div class="route-node-label">Collect from</div>' +
          '<div class="route-node-name">' + c.donorName + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="route-vline"></div>' +
      '<div class="route-node">' +
        '<div class="route-dot orange-dot"></div>' +
        '<div class="route-node-info">' +
          '<div class="route-node-label">Deliver to</div>' +
          '<div class="route-node-name">' + c.pickup.name + '</div>' +
          '<div class="route-node-sub">' + c.pickup.type + ' · Capacity ' + c.pickup.capacity + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  /* ─ Spoilage safe indicator ─ */
  var buf     = c.bufMin;
  var bufClr  = buf > 30 ? '#1F7A4D' : buf > 10 ? '#F59E0B' : '#EF4444';
  var bufIcon = buf > 30 ? '✅' : buf > 10 ? '⚠️' : '🚨';
  var bufTxt  = buf > 0
    ? 'Deliver in ~<strong>' + c.estMin + ' min</strong>, <strong>' + buf + ' min buffer</strong>'
    : '🚨 Tight! Only ' + c.shelfMin + ' min of shelf time left';
  var barPct  = c.shelfMin > 0 ? Math.min(100, Math.max(5, (buf / c.shelfMin) * 100)) : 5;

  var spoilHTML =
    '<div class="spoil-block" style="border-left-color:' + bufClr + ';">' +
      '<div class="spoil-title" style="color:' + bufClr + '">' + bufIcon + ' Spoilage Safe?</div>' +
      '<div class="spoil-text">' + bufTxt + '</div>' +
      '<div class="spoil-bar-bg">' +
        '<div class="spoil-bar-fill" style="width:' + barPct + '%;background:' + bufClr + ';"></div>' +
      '</div>' +
      '<div class="spoil-times">' +
        '<span>Est. delivery: ' + c.estMin + ' min</span>' +
        '<span>Shelf left: ' + c.shelfMin + ' min</span>' +
      '</div>' +
    '</div>';

  /* ─ Handoff code (shown until picked up) ─ */
  var codeHTML = '';
  if (step < 2) {
    codeHTML =
      '<div class="handoff-block">' +
        '<div class="handoff-block-title">🔐 Safe Handoff Code</div>' +
        '<div class="handoff-digits">' +
          c.handoffCode.split('').map(function(d) {
            return '<span class="handoff-digit">' + d + '</span>';
          }).join('') +
        '</div>' +
        '<div class="handoff-hint">Show this 4-digit code to the donor when you arrive.</div>' +
        (currentRole === 'donor'
          ? '<button class="btn-sm btn-outline" style="margin-top:10px;width:100%;" onclick="openCodeModal()">📲 Donor: Verify volunteer code</button>'
          : '<button class="btn-sm btn-outline" style="margin-top:10px;width:100%;font-size:12px;" onclick="openCodeModal()">🧪 Demo: Try donor code entry</button>'
        ) +
      '</div>';
  }

  /* ─ Action button ─ */
  var actionHTML = '';
  if (step < STEPS.length - 1) {
    var nextStep = step + 1;
    var isOnWay  = nextStep === 2;
    actionHTML =
      '<button class="drawer-action-btn' + (isOnWay ? ' on-way' : '') + '" onclick="advanceStep()">' +
        STEPS[nextStep].icon + ' ' + STEPS[nextStep].btnText +
      '</button>';
  }

  el.innerHTML =
    '<div class="drawer-header-inner">' +
      '<div class="drawer-h-title">🙋 Active Drop</div>' +
      '<button class="drawer-close-btn" onclick="closeDrawer()">✕</button>' +
    '</div>' +
    trackerHTML +
    listHTML +
    routeHTML +
    spoilHTML +
    codeHTML +
    actionHTML;
}

// ── ADVANCE STEP ───────────────────────────────────────────
function advanceStep() {
  if (!activeClaim) return;
  activeClaim.step++;

  // Persist
  var drops = getMyDrops();
  var i = drops.findIndex(function(d) { return d.id === activeClaim.id; });
  if (i !== -1) { drops[i].step = activeClaim.step; saveMyDrops(drops); }

  if (activeClaim.step === 2) {
    // On the way → animate volunteer marker
    startVolAnimation(activeClaim.routeCoords);
    showToast('🚴 Volunteer marker moving on map!', 'success');
    renderDrawerContent();
  } else if (activeClaim.step === 3) {
    // Delivered
    clearVolMarker();
    clearRouteFromMap();
    showDelivered();
    updateMyDropsBadge();
  } else {
    renderDrawerContent();
  }
}

// ── DELIVERED SCREEN ───────────────────────────────────────
function showDelivered() {
  var c   = activeClaim;
  var el  = document.getElementById('claim-drawer-body');
  if (!el) return;

  // Bump impact totals
  var imp = getImpact();
  imp.mealsSavedToday = (imp.mealsSavedToday || 0) + c.mealCount;
  imp.totalMealsSaved = (imp.totalMealsSaved || 0) + c.mealCount;
  imp.co2Saved        = (imp.co2Saved        || 0) + Math.round(c.mealCount * 0.5);
  saveImpact(imp);

  el.innerHTML =
    '<div class="delivered-wrap">' +
      '<div class="delivered-icon-row">' +
        '<div class="delivered-ring dr1"></div>' +
        '<div class="delivered-ring dr2"></div>' +
        '<div class="delivered-star">🌟</div>' +
      '</div>' +
      '<div class="delivered-hl-pill">Drop complete!</div>' +
      '<div class="delivered-big">' + c.mealCount + '</div>' +
      '<div class="delivered-big-label">people fed tonight</div>' +
      '<p class="delivered-msg">You helped feed <strong>' + c.mealCount + ' people</strong> in Mathura.<br>Every trip matters. Thank you! 🙏</p>' +
      '<div class="delivered-stats-row">' +
        '<div class="del-stat"><div class="del-stat-val">' + c.mealCount + '</div><div class="del-stat-lbl">Meals</div></div>' +
        '<div class="del-stat"><div class="del-stat-val">~' + (Math.round(c.mealCount * 0.25 * 2.5 * 10) / 10) + ' kg</div><div class="del-stat-lbl">CO₂ avoided</div></div>' +
        '<div class="del-stat"><div class="del-stat-val">' + c.estMin + 'm</div><div class="del-stat-lbl">Trip</div></div>' +
      '</div>' +
      '<div class="delivered-actions">' +
        '<button class="drawer-action-btn" onclick="closeAndReset()">+ Do another drop</button>' +
        '<a href="impact.html" class="btn-sm btn-outline" style="text-decoration:none;justify-content:center;margin-top:8px;">📊 See total impact</a>' +
      '</div>' +
    '</div>';

  setTimeout(function() {
    var r1 = el.querySelector('.dr1');
    var r2 = el.querySelector('.dr2');
    if (r1) r1.classList.add('dr-expand');
    if (r2) r2.classList.add('dr-expand-2');
  }, 80);

  renderMyDropsPanel();
}

// ── DRAWER OPEN/CLOSE ──────────────────────────────────────
function openDrawer() {
  document.getElementById('claim-drawer').classList.add('open');
  document.getElementById('drawer-backdrop').classList.add('visible');
}
function closeDrawer() {
  document.getElementById('claim-drawer').classList.remove('open');
  document.getElementById('drawer-backdrop').classList.remove('visible');
}
function closeAndReset() {
  activeClaim = null;
  closeDrawer();
  renderFeed();   // from map.js
}

// ── DONOR CODE MODAL ───────────────────────────────────────
function openCodeModal() {
  var m = document.getElementById('code-modal');
  if (!m) return;
  m.classList.add('open');
  document.getElementById('code-modal-input').value = '';
  document.getElementById('code-modal-err').style.display  = 'none';
  document.getElementById('code-modal-ok').style.display   = 'none';
}
function closeCodeModal() {
  var m = document.getElementById('code-modal');
  if (m) m.classList.remove('open');
}
function submitCode() {
  var val     = (document.getElementById('code-modal-input').value || '').trim();
  var pending = loadFromStorage('pending_code', null);
  var errEl   = document.getElementById('code-modal-err');
  var okEl    = document.getElementById('code-modal-ok');

  if (!pending) { errEl.textContent = 'No pending claim found.'; errEl.style.display = 'block'; return; }

  if (val === pending.code) {
    errEl.style.display = 'none';
    okEl.style.display  = 'flex';
    showToast('✅ Handoff code verified! Volunteer confirmed.', 'success');
    setTimeout(closeCodeModal, 2000);
  } else {
    okEl.style.display   = 'none';
    errEl.textContent    = '❌ Wrong code. The volunteer will show you a 4-digit number.';
    errEl.style.display  = 'block';
    var inp = document.getElementById('code-modal-input');
    inp.classList.add('input-shake');
    setTimeout(function() { inp.classList.remove('input-shake'); }, 500);
  }
}

// ── MY DROPS PANEL ─────────────────────────────────────────
function renderMyDropsPanel() {
  var panel = document.getElementById('my-drops-list');
  if (!panel) return;
  var drops = getMyDrops();
  if (drops.length === 0) {
    panel.innerHTML = '<div class="drops-empty">No drops yet. Switch to Volunteer and claim a listing!</div>';
    return;
  }
  panel.innerHTML = drops.slice(0, 8).map(function(d) {
    var stepCfg = STEPS[Math.min(d.step, 3)];
    var age     = Date.now() - d.claimedAt;
    var ageStr  = age < 3600000 ? Math.round(age / 60000) + 'm ago' : Math.round(age / 3600000) + 'h ago';
    var isDone  = d.step >= 3;
    return '<div class="drop-row' + (isDone ? ' drop-done' : '') + '" onclick="' + (isDone ? '' : 'reopenDrop(\'' + d.id + '\')') + '">' +
      '<div class="drop-row-icon">' + stepCfg.icon + '</div>' +
      '<div class="drop-row-info">' +
        '<div class="drop-row-title">' + (d.listing ? d.listing.title : d.listingId) + '</div>' +
        '<div class="drop-row-meta">' + ageStr + (d.pickup ? ' · ' + d.pickup.name.split(' ').slice(0,3).join(' ') : '') + '</div>' +
      '</div>' +
      '<div class="drop-status-pill step' + d.step + '">' + stepCfg.label + '</div>' +
    '</div>';
  }).join('');
}

function reopenDrop(id) {
  var drops = getMyDrops();
  var drop  = drops.find(function(d) { return d.id === id; });
  if (!drop || drop.step >= 3) return;
  activeClaim = drop;
  if (activeClaim.routeCoords) drawRouteOnMap(activeClaim.routeCoords);
  renderDrawerContent();
  openDrawer();
}

function updateMyDropsBadge() {
  var drops  = getMyDrops();
  var active = drops.filter(function(d) { return d.step < 3; }).length;
  var badge  = document.getElementById('my-drops-badge');
  if (badge) {
    badge.textContent    = active > 0 ? active : '';
    badge.style.display  = active > 0 ? 'flex' : 'none';
  }
}

function toggleMyDrops() {
  var panel = document.getElementById('my-drops-panel');
  if (!panel) return;
  var open = panel.classList.toggle('open');
  if (open) renderMyDropsPanel();
}

// ── OVERRIDE claimById from map.js ─────────────────────────
// (this file loads after map.js, so this definition wins)
function claimById(id) {        // eslint-disable-line no-redeclare
  if (currentRole !== 'volunteer') {
    applyRole('volunteer');
  }
  openClaimDrawer(id);
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  updateMyDropsBadge();
  renderMyDropsPanel();

  // Enter code on number-pad Enter key
  var codeInput = document.getElementById('code-modal-input');
  if (codeInput) {
    codeInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') submitCode();
    });
  }

  // Backdrop click closes drawer (not modal)
  var backdrop = document.getElementById('drawer-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }

  // Role changes
  document.addEventListener('rolechange', function() {
    if (activeClaim) renderDrawerContent();
  });

  // Check if opened from Home page or external link with a target claim
  try {
    var urlParams = new URLSearchParams(window.location.search);
    var targetClaimId = urlParams.get('claim') || sessionStorage.getItem('sahyog_open_claim');
    if (targetClaimId) {
      sessionStorage.removeItem('sahyog_open_claim');
      setTimeout(function() {
        claimById(targetClaimId);
      }, 500);
    }
  } catch(e) {}
});
