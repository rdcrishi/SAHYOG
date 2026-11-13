// pages/heatmap.js — Need Heatmap, Smart Match, Shelter form
// Loads after map.js and claim-flow.js; uses their globals freely.

// ── Need level visual config ───────────────────────────────
var NEED_CFG = {
  Low:      { color: '#22C55E', outerM: 350, innerM: 160, outerOp: 0.13, innerOp: 0.30, score: 1,  label: 'Low',      emoji: '🟢' },
  Medium:   { color: '#F59E0B', outerM: 480, innerM: 210, outerOp: 0.17, innerOp: 0.35, score: 2,  label: 'Medium',   emoji: '🟡' },
  High:     { color: '#F97316', outerM: 610, innerM: 260, outerOp: 0.21, innerOp: 0.40, score: 3,  label: 'High',     emoji: '🟠' },
  Critical: { color: '#EF4444', outerM: 740, innerM: 310, outerOp: 0.25, innerOp: 0.48, score: 4,  label: 'Critical', emoji: '🔴' }
};

// ── Heatmap state ──────────────────────────────────────────
var hmVisible = false;
var hmLayers  = [];   // Leaflet circle layers

// ── TOGGLE ────────────────────────────────────────────────
function setHeatmap(on) {
  hmVisible = on;
  var chk = document.getElementById('heatmap-toggle');
  if (chk) chk.checked = on;
  var row = document.getElementById('heatmap-row');
  if (row) row.classList.toggle('hm-on', on);
  on ? drawHeatmap() : clearHeatmap();
}

function drawHeatmap() {
  clearHeatmap();
  if (typeof leafletMap === 'undefined') return;
  var needData = getNeedData();

  SAHYOG_DATA.pickupPoints.forEach(function(p) {
    var nd  = needData[p.id] || { needLevel: 'Low', mealsNeeded: 20 };
    var cfg = NEED_CFG[nd.needLevel] || NEED_CFG.Low;
    var ll  = [p.lat, p.lng];

    // Outer glow
    var outer = L.circle(ll, {
      radius:      cfg.outerM,
      fillColor:   cfg.color,
      fillOpacity: cfg.outerOp,
      stroke:      false,
      interactive: false,
      pane:        'overlayPane'
    }).addTo(leafletMap);

    // Inner core — interactive, shows tooltip
    var inner = L.circle(ll, {
      radius:      cfg.innerM,
      fillColor:   cfg.color,
      fillOpacity: cfg.innerOp,
      color:       cfg.color,
      weight:      2,
      opacity:     0.5,
      pane:        'overlayPane'
    }).addTo(leafletMap);

    var ttHTML =
      '<div style="font-family:Inter,sans-serif;min-width:140px;">' +
        '<div style="font-size:12px;font-weight:800;color:#1A1A1A;margin-bottom:3px;">' + p.name + '</div>' +
        '<div style="font-size:11px;color:' + cfg.color + ';font-weight:700;">' +
          cfg.emoji + ' ' + nd.needLevel + ' need &nbsp;·&nbsp; ' + nd.mealsNeeded + ' meals tonight' +
        '</div>' +
        '<div style="font-size:10px;color:#6B7280;margin-top:2px;">' + p.type + '</div>' +
      '</div>';
    inner.bindTooltip(ttHTML, { sticky: true, opacity: 1, className: 'need-tooltip' });

    // Permanent label marker
    var lblIcon = L.divIcon({
      className: '',
      html: '<div class="need-bubble need-' + nd.needLevel.toLowerCase() + '">' +
              '<span class="nb-meals">' + nd.mealsNeeded + '</span>' +
              '<span class="nb-unit">meals</span>' +
            '</div>',
      iconSize:   [56, 36],
      iconAnchor: [28, 56]
    });
    var lbl = L.marker(ll, { icon: lblIcon, interactive: false, zIndexOffset: -100 })
      .addTo(leafletMap);

    hmLayers.push(outer, inner, lbl);
  });
}

function clearHeatmap() {
  if (typeof leafletMap === 'undefined') return;
  hmLayers.forEach(function(l) { leafletMap.removeLayer(l); });
  hmLayers = [];
}

// ── SMART MATCH algorithm ─────────────────────────────────
// Score = needScore × mealsNeeded / (1 + 3×dist) × urgencyBoost
// Higher = better match for this listing

function computeMatch(listing) {
  var dlat, dlng;
  if (listing.lat && listing.lng) { dlat = listing.lat; dlng = listing.lng; }
  else {
    var d = SAHYOG_DATA.donors.find(function(x) { return x.id === listing.donorId; });
    dlat = d ? d.lat : 27.4924;
    dlng = d ? d.lng : 77.6737;
  }

  var timeLeftMin = Math.max(1, (listing.expiresAt - Date.now()) / 60000);
  var urgBoost    = timeLeftMin < 60 ? 1.6 : 1.0;
  var needData    = getNeedData();
  var best = null, bestScore = -Infinity;

  SAHYOG_DATA.pickupPoints.forEach(function(p) {
    var nd   = needData[p.id] || { needLevel: 'Low', mealsNeeded: 20 };
    var cfg  = NEED_CFG[nd.needLevel] || NEED_CFG.Low;
    var dist = haversine(dlat, dlng, p.lat, p.lng);   // km
    // Estimated delivery: cycling at 18 km/h, +3 min buffer
    var estMin = Math.round((dist / 18) * 60) + 3;
    var score  = (cfg.score * nd.mealsNeeded * urgBoost) / (1 + dist * 2.5);
    if (score > bestScore) {
      bestScore = score;
      best = {
        point:    p,
        nd:       nd,
        cfg:      cfg,
        dist:     dist,
        estMin:   estMin,
        bufMin:   Math.floor(timeLeftMin) - estMin,
        score:    score
      };
    }
  });
  return best;
}

// ── SMART MATCH UI ─────────────────────────────────────────
var openSmId = null;   // currently-expanded listing id

function showSmartMatch(listingId) {
  var el = document.getElementById('sm-' + listingId);
  if (!el) return;

  // Toggle off
  if (openSmId === listingId) {
    el.innerHTML = '';
    el.classList.remove('sm-open');
    openSmId = null;
    return;
  }

  // Close previous
  if (openSmId) {
    var prev = document.getElementById('sm-' + openSmId);
    if (prev) { prev.innerHTML = ''; prev.classList.remove('sm-open'); }
  }
  openSmId = listingId;

  var listing = getListings().find(function(l) { return l.id === listingId; });
  if (!listing) return;
  var m = computeMatch(listing);
  if (!m)       return;

  var distStr  = m.dist < 1 ? Math.round(m.dist * 1000) + 'm' : m.dist.toFixed(1) + 'km';
  var timeMin  = Math.max(0, Math.floor((listing.expiresAt - Date.now()) / 60000));
  var bufColor = m.bufMin > 30 ? '#1F7A4D' : m.bufMin > 10 ? '#F59E0B' : '#EF4444';
  var bufText  = m.bufMin > 0
    ? m.bufMin + ' min buffer'
    : 'Very tight!';

  // One-line explanation
  var explain =
    m.point.name.split(' ').slice(0, 4).join(' ') + ': ' +
    distStr + ' away, needs ' + m.nd.mealsNeeded + ' meals, you have ' + timeMin + ' min';

  // Flash on heatmap
  if (typeof leafletMap !== 'undefined') {
    leafletMap.setView([m.point.lat, m.point.lng], 14, { animate: true });
    // Brief pulse: add a temporary circle
    var pulse = L.circle([m.point.lat, m.point.lng], {
      radius: 180, fillColor: m.cfg.color, fillOpacity: 0.5,
      color: m.cfg.color, weight: 3, opacity: 0.9
    }).addTo(leafletMap);
    setTimeout(function() { leafletMap.removeLayer(pulse); }, 1800);
  }

  el.classList.add('sm-open');
  el.innerHTML =
    '<div class="sm-card">' +
      '<div class="sm-explain-line">' + explain + '</div>' +
      '<div class="sm-detail-row">' +
        '<div class="sm-detail">' +
          '<div class="sm-detail-val" style="color:' + m.cfg.color + '">' +
            m.cfg.emoji + ' ' + m.nd.needLevel +
          '</div>' +
          '<div class="sm-detail-lbl">Need</div>' +
        '</div>' +
        '<div class="sm-detail">' +
          '<div class="sm-detail-val">' + m.nd.mealsNeeded + '</div>' +
          '<div class="sm-detail-lbl">Meals needed</div>' +
        '</div>' +
        '<div class="sm-detail">' +
          '<div class="sm-detail-val">' + distStr + '</div>' +
          '<div class="sm-detail-lbl">Distance</div>' +
        '</div>' +
        '<div class="sm-detail">' +
          '<div class="sm-detail-val" style="color:' + bufColor + '">' + bufText + '</div>' +
          '<div class="sm-detail-lbl">Safety buffer</div>' +
        '</div>' +
      '</div>' +
      '<div class="sm-destination-row">' +
        '<div class="sm-dest-pin">🏠</div>' +
        '<div class="sm-dest-info">' +
          '<div class="sm-dest-name">' + m.point.name + '</div>' +
          '<div class="sm-dest-type">' + m.point.type + ' · Capacity ' + m.point.capacity + '</div>' +
        '</div>' +
      '</div>' +
      '<button class="sm-claim-btn" onclick="claimById(\'' + listingId + '\');event.stopPropagation()">' +
        '🚴 Claim & Route here' +
      '</button>' +
    '</div>';
}

// ── SHELTER FORM ───────────────────────────────────────────
var shelterSelectedId = null;

function initShelterForm() {
  var sel = document.getElementById('shelter-select');
  if (!sel) return;

  // Populate dropdown
  SAHYOG_DATA.pickupPoints.forEach(function(p) {
    var o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.name;
    sel.appendChild(o);
  });

  shelterSelectedId = SAHYOG_DATA.pickupPoints[0].id;
  sel.addEventListener('change', function() {
    shelterSelectedId = this.value;
    loadShelterCurrentNeed();
  });

  loadShelterCurrentNeed();
  initShelterStepperEvents();

  // Need level buttons
  document.querySelectorAll('.nl-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.nl-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  // Preset buttons
  document.querySelectorAll('.shelter-preset').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var v = document.getElementById('shelter-qty');
      if (v) v.textContent = this.dataset.n;
    });
  });
}

function loadShelterCurrentNeed() {
  if (!shelterSelectedId) return;
  var nd   = getNeedData()[shelterSelectedId] || { needLevel: 'Medium', mealsNeeded: 40 };
  var qEl  = document.getElementById('shelter-qty');
  if (qEl) qEl.textContent = nd.mealsNeeded;
  document.querySelectorAll('.nl-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.level === nd.needLevel);
  });
  // Update "current" display
  var curEl = document.getElementById('shelter-current-display');
  var cfg   = NEED_CFG[nd.needLevel] || NEED_CFG.Low;
  if (curEl) {
    curEl.textContent = cfg.emoji + ' Currently: ' + nd.needLevel + ' need · ' + nd.mealsNeeded + ' meals';
    curEl.style.color = cfg.color;
  }
}

function initShelterStepperEvents() {
  var minus = document.getElementById('shelter-minus');
  var plus  = document.getElementById('shelter-plus');
  var val   = document.getElementById('shelter-qty');
  if (minus && plus && val) {
    minus.addEventListener('click', function() {
      var v = parseInt(val.textContent) || 20;
      val.textContent = Math.max(5, v - 5);
    });
    plus.addEventListener('click', function() {
      var v = parseInt(val.textContent) || 20;
      val.textContent = Math.min(300, v + 5);
    });
  }
}

function submitNeedUpdate() {
  if (!shelterSelectedId) return;
  var meals    = parseInt(document.getElementById('shelter-qty').textContent) || 40;
  var lvlBtn   = document.querySelector('.nl-btn.active');
  var level    = lvlBtn ? lvlBtn.dataset.level : 'Medium';

  var nd = getNeedData();
  nd[shelterSelectedId] = { needLevel: level, mealsNeeded: meals };
  saveNeedData(nd);

  // Refresh heatmap if visible
  if (hmVisible) { clearHeatmap(); drawHeatmap(); }
  loadShelterCurrentNeed();

  var btn = document.getElementById('shelter-submit');
  if (btn) {
    var orig = btn.innerHTML;
    btn.innerHTML = '✅ Updated!';
    btn.style.background = '#22C55E';
    setTimeout(function() { btn.innerHTML = orig; btn.style.background = ''; }, 2200);
  }

  showToast('✅ Need updated: ' + level + ' · ' + meals + ' meals tonight', 'success');
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Heatmap toggle
  var chk = document.getElementById('heatmap-toggle');
  if (chk) {
    chk.addEventListener('change', function() { setHeatmap(this.checked); });
  }

  // Auto-enable heatmap when switching to Shelter role
  document.addEventListener('rolechange', function(e) {
    var role = e.detail ? e.detail.role : currentRole;
    if (role === 'shelter') {
      setHeatmap(true);
    }
    // Show/hide feed vs shelter form already handled by CSS body[data-role]
  });

  initShelterForm();
});
