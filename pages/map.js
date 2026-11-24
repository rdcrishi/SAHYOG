// pages/map.js — Live Map page logic

// ── Simulated user location (Mathura city centre) ──────────
var USER_LAT = 27.4950;
var USER_LNG = 77.6700;

// ── State ──────────────────────────────────────────────────
var leafletMap = null;
var activeFilter = 'all';
var markerMap = {};          // listingId → Leaflet marker
var simulationTimer = null;
var clockInterval  = null;
var highlightedPin = null;

// ── Utility: urgency ───────────────────────────────────────
function getUrgency(expiresAt) {
  var left = expiresAt - Date.now();
  if (left <= 0)          return 'expired';
  if (left < 3600000)     return 'red';
  if (left < 10800000)    return 'orange';
  return 'green';
}
function urgencyColor(level) {
  return level === 'red' ? '#EF4444' : level === 'orange' ? '#F59E0B' : '#1F7A4D';
}
function urgencyBg(level) {
  return level === 'red' ? '#FEE2E2' : level === 'orange' ? '#FEF3C7' : '#D1FAE5';
}

// ── Utility: distance ──────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dL = (lat2 - lat1) * Math.PI / 180;
  var dG = (lng2 - lng1) * Math.PI / 180;
  var a  = Math.sin(dL/2)*Math.sin(dL/2) +
           Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
           Math.sin(dG/2)*Math.sin(dG/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function listingLatLng(listing) {
  if (listing.lat && listing.lng) return [listing.lat, listing.lng];
  var d = SAHYOG_DATA.donors.find(function(x){ return x.id === listing.donorId; });
  return d ? [d.lat, d.lng] : [27.4924, 77.6737];
}
function distKm(listing) {
  var ll = listingLatLng(listing);
  return haversine(USER_LAT, USER_LNG, ll[0], ll[1]);
}
function fmtDist(km) {
  return km < 1 ? Math.round(km*1000)+'m away' : km.toFixed(1)+'km away';
}

// ── Utility: time ──────────────────────────────────────────
function fmtTime(ms) {
  if (ms <= 0) return 'Expired';
  var totalSec = Math.floor(ms / 1000);
  var h = Math.floor(totalSec / 3600);
  var m = Math.floor((totalSec % 3600) / 60);
  var s = totalSec % 60;

  // Only switch to seconds when under 2 minutes (120 seconds)
  if (totalSec < 120) {
    if (m > 0) return m + 'm ' + s + 's';
    return s + 's';
  }

  // 2 minutes or more: show "1h 20m" or "45m"
  if (h > 0) {
    return h + 'h ' + (m > 0 ? m + 'm' : '0m');
  }
  return m + 'm';
}

// ── Utility: donor name & emoji ────────────────────────────
function donorName(donorId) {
  var d = SAHYOG_DATA.donors.find(function(x){ return x.id === donorId; });
  return d ? d.name : 'Unknown';
}
function listingEmoji(listing) {
  if (listing.title) {
    var emojis = ['🍛','🍞','🥦','📦','🍮'];
    for (var i = 0; i < emojis.length; i++) {
      if (listing.title.indexOf(emojis[i]) === 0) return emojis[i];
    }
  }
  var t = (listing.title||'').toLowerCase();
  if (/sweet|mithai|laddoo|burfi|pedha|gulab|kheer/.test(t)) return '🍮';
  if (/bread|bun|bakery|pav|rusk/.test(t))                   return '🍞';
  if (/veg|fruit|tomato|banana|sabzi/.test(t))               return '🥦';
  if (/pack|biscuit|namkeen|juice|pouch/.test(t))            return '📦';
  return '🍛';
}

// ── Custom Leaflet icons ───────────────────────────────────
function makePinIcon(listing) {
  var urgency = getUrgency(listing.expiresAt);
  var color   = urgencyColor(urgency);
  var border  = urgency === 'red' ? '#FCA5A5' : urgency === 'orange' ? '#FDE68A' : '#86EFAC';
  var pulse   = urgency === 'red' ? 'map-pin-pulse' : '';
  var emoji   = listingEmoji(listing);
  return L.divIcon({
    className: '',
    html:
      '<div class="map-pin-wrap '+pulse+'">' +
        '<div class="map-pin" style="background:'+color+';border-color:'+border+';">' +
          '<span class="map-pin-emoji">'+emoji+'</span>' +
        '</div>' +
        '<div class="map-pin-tail" style="border-top-color:'+color+';"></div>' +
      '</div>',
    iconSize:    [40, 50],
    iconAnchor:  [20, 50],
    popupAnchor: [0, -52]
  });
}

function makePickupIcon(point) {
  var label = point.name.split(' ').slice(0, 2).join(' ');
  return L.divIcon({
    className: '',
    html:
      '<div class="map-pickup-wrap">' +
        '<div class="map-pickup-icon">🏠</div>' +
        '<div class="map-pickup-label">'+label+'</div>' +
      '</div>',
    iconSize:    [60, 56],
    iconAnchor:  [30, 56],
    popupAnchor: [0, -58]
  });
}

// ── Popup HTML ─────────────────────────────────────────────
function popupHTML(listing) {
  var urgency  = getUrgency(listing.expiresAt);
  var color    = urgencyColor(urgency);
  var timeLeft = listing.expiresAt - Date.now();
  var emoji    = listingEmoji(listing);
  var dist     = fmtDist(distKm(listing));
  var donor    = donorName(listing.donorId);
  var safety   = listing.safetyVerified
    ? '<div style="margin:6px 0 0;display:inline-flex;align-items:center;gap:3px;background:#E8F5EE;color:#165C38;font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;">✅ Safety verified</div>'
    : '';
  var action   = listing.status === 'claimed'
    ? '<div class="popup-claimed">✓ Already claimed</div>'
    : '<button class="popup-claim-btn" onclick="claimById(\''+listing.id+'\')">🙋 Claim this pickup</button>';

  return '<div class="map-popup">'+
    '<div class="popup-header">'+
      '<span class="popup-emoji">'+emoji+'</span>'+
      '<div class="popup-title-block">'+
        '<div class="popup-title">'+listing.title+'</div>'+
        '<div class="popup-meta">'+donor+' · '+dist+'</div>'+
      '</div>'+
    '</div>'+
    '<div class="popup-time" style="color:'+color+'">⏱ '+fmtTime(timeLeft)+' left</div>'+
    safety+
    action+
  '</div>';
}

// ── Map init ───────────────────────────────────────────────
function initLeafletMap() {
  try {
    if (typeof L === 'undefined') {
      throw new Error('Leaflet library not available');
    }
    if (leafletMap) {
      leafletMap.remove();
      leafletMap = null;
    }

    leafletMap = L.map('live-map', { zoomControl: true, attributionControl: false })
      .setView([27.4924, 77.6737], 13);

    var tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(leafletMap);

    // Automatic fallback to Humanitarian OSM if tile fails
    tileLayer.on('tileerror', function(error) {
      if (error && error.tile && error.tile.src && error.tile.src.indexOf('openstreetmap.fr') === -1) {
        error.tile.src = error.tile.src.replace('tile.openstreetmap.org', 'a.tile.openstreetmap.fr/hot');
      }
    });

    // Hide map skeleton once tiles start loading
    leafletMap.once('load', function() {
      var skel = document.getElementById('map-skeleton');
      if (skel) skel.classList.add('hidden');
    });

    tileLayer.on('load', function() {
      var skel = document.getElementById('map-skeleton');
      if (skel) skel.classList.add('hidden');
    });

    // Also hide skeleton after a safe timeout
    setTimeout(function() {
      var skel = document.getElementById('map-skeleton');
      if (skel) skel.classList.add('hidden');
    }, 1200);

    // Pickup point markers
    SAHYOG_DATA.pickupPoints.forEach(function(p) {
      L.marker([p.lat, p.lng], { icon: makePickupIcon(p), alt: p.name + ' pickup point' })
        .bindPopup(
          '<div class="map-popup">' +
            '<div class="popup-header">' +
              '<span class="popup-emoji" aria-hidden="true">🏠</span>' +
              '<div class="popup-title-block">' +
                '<div class="popup-title">' + p.name + '</div>' +
                '<div class="popup-meta">' + p.type + ' · Capacity: ' + p.capacity + '</div>' +
              '</div>' +
            '</div>' +
          '</div>',
          { maxWidth: 250, className: 'sahyog-popup' }
        )
        .addTo(leafletMap);
    });

    // Hide any previous error
    var errEl = document.getElementById('map-error');
    if (errEl) errEl.style.display = 'none';

  } catch (err) {
    console.warn('Map initialization note:', err);
    var skel = document.getElementById('map-skeleton');
    if (skel) skel.classList.add('hidden');
    var errEl = document.getElementById('map-error');
    if (errEl) errEl.style.display = 'flex';
  }
}

// ── Add / refresh a listing marker ────────────────────────
function addMarker(listing) {
  if (markerMap[listing.id]) {
    leafletMap.removeLayer(markerMap[listing.id]);
    delete markerMap[listing.id];
  }
  if (listing.status === 'claimed' || getUrgency(listing.expiresAt) === 'expired') return;

  var ll   = listingLatLng(listing);
  var icon = makePinIcon(listing);
  var marker = L.marker(ll, { icon: icon })
    .bindPopup(popupHTML(listing), { maxWidth: 260, className: 'sahyog-popup' })
    .addTo(leafletMap);

  marker.on('click', function() {
    scrollToCard(listing.id);
  });

  markerMap[listing.id] = marker;
}

function renderAllMarkers(listings) {
  if (leafletMap) {
    Object.keys(markerMap).forEach(function(id) {
      if (markerMap[id]) leafletMap.removeLayer(markerMap[id]);
    });
  }
  markerMap = {};
  listings.forEach(function(l) { addMarker(l); });

  // Update map empty state pill
  var emptyPill = document.getElementById('map-empty-pill');
  if (emptyPill) {
    emptyPill.style.display = (listings.length === 0) ? 'inline-flex' : 'none';
  }
}

// ── Spoilage clock SVG values ──────────────────────────────
var CLOCK_R    = 17;
var CLOCK_CIRC = +(2 * Math.PI * CLOCK_R).toFixed(3); // 106.814

function clockOffset(listing) {
  var total = listing.expiresAt - listing.createdAt;
  if (total <= 0) return CLOCK_CIRC;
  var fraction = Math.max(0, Math.min(1, (listing.expiresAt - Date.now()) / total));
  return +(CLOCK_CIRC * (1 - fraction)).toFixed(3);
}

// ── Feed card HTML ─────────────────────────────────────────
function buildCard(listing) {
  var urgency  = getUrgency(listing.expiresAt);
  var color    = urgencyColor(urgency);
  var timeLeft = listing.expiresAt - Date.now();
  var emoji    = listingEmoji(listing);
  var dist     = fmtDist(distKm(listing));
  var donor    = donorName(listing.donorId);
  var offset   = clockOffset(listing);
  var isNew    = (Date.now() - listing.createdAt) < 12000;

  var urgClass  = urgency === 'red' ? 'card-urg-red' : urgency === 'orange' ? 'card-urg-orange' : '';
  var safetyEl  = listing.safetyVerified ? '<span class="feed-safety">✅ Safety verified</span>' : '';
  var newBadge  = isNew ? '<span class="feed-new-badge">NEW</span>' : '';
  var actionEl = listing.status === 'claimed'
    ? '<div class="feed-claimed">✓ Claimed</div>'
    : '<button class="feed-claim-btn" onclick="claimById(\'' + listing.id + '\')">🙋 Claim</button>';

  var smartMatchBtn = (listing.status !== 'claimed'
    ? '<button class="smart-match-btn" onclick="showSmartMatch(\'' + listing.id + '\');event.stopPropagation()" aria-label="Smart match best destination">' +
        '🎯 Smart Match' +
      '</button>'
    : '');

  return '<div class="feed-card ' + urgClass + '" id="card-' + listing.id + '"' +
    ' onmouseenter="pinHighlight(\'' + listing.id + '\')"' +
    ' onmouseleave="pinUnhighlight(\'' + listing.id + '\')"' +
    ' onclick="zoomToPin(\'' + listing.id + '\')"' +
  '>' +
    '<div class="feed-top">' +
      '<span class="feed-emoji">' + emoji + '</span>' +
      '<div class="feed-info">' +
        '<div class="feed-title">' + listing.title + '</div>' +
        '<div class="feed-meta">' +
          '<span>🏪 ' + donor + '</span>' +
          '<span>📍 ' + dist + '</span>' +
        '</div>' +
        safetyEl +
      '</div>' +
      newBadge +
    '</div>' +
    '<div class="feed-bottom">' +
      '<div class="spoilage-clock" title="' + fmtTime(timeLeft) + ' remaining">' +
        '<svg width="44" height="44" viewBox="0 0 44 44" class="clock-svg">' +
          '<circle cx="22" cy="22" r="' + CLOCK_R + '" fill="none" stroke="#E5E7EB" stroke-width="3.5"/>' +
          '<circle class="clock-ring" cx="22" cy="22" r="' + CLOCK_R + '"' +
            ' fill="none" stroke="' + color + '" stroke-width="3.5"' +
            ' stroke-dasharray="' + CLOCK_CIRC + '"' +
            ' stroke-dashoffset="' + offset + '"' +
            ' stroke-linecap="round"' +
            ' transform="rotate(-90 22 22)"' +
            ' data-expires="' + listing.expiresAt + '"' +
            ' data-created="' + listing.createdAt + '"' +
          '/>' +
        '</svg>' +
        '<div class="clock-label" id="clk-' + listing.id + '" style="color:' + color + '">' + fmtTime(timeLeft) + '</div>' +
      '</div>' +
      '<div class="feed-btn-row">' +
        actionEl +
        smartMatchBtn +
      '</div>' +
    '</div>' +
    '<div class="sm-expanded" id="sm-' + listing.id + '"></div>' +
  '</div>';
}

// ── Render feed ────────────────────────────────────────────
function getFiltered() {
  var all = getListings();
  return all.filter(function(l) {
    if (getUrgency(l.expiresAt) === 'expired') return false;
    var e = listingEmoji(l);
    if (activeFilter === 'cooked')    return e === '🍛';
    if (activeFilter === 'groceries') return e === '📦' || e === '🥦';
    if (activeFilter === 'under1hr')  return (l.expiresAt - Date.now()) < 3600000;
    return true;
  }).sort(function(a, b) { return a.expiresAt - b.expiresAt; }); // urgency order
}

function renderFeed() {
  var feed = document.getElementById('listing-feed');
  if (!feed) return;

  var skel = document.getElementById('feed-skeleton');
  var emptyEl = document.getElementById('feed-empty');
  var errorEl = document.getElementById('feed-error');

  try {
    var filtered = getFiltered();

    if (skel) skel.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';

    // Update counts
    var countEl = document.getElementById('feed-count');
    if (countEl) countEl.textContent = filtered.length + ' listing' + (filtered.length !== 1 ? 's' : '');
    var liveEl = document.getElementById('live-count');
    if (liveEl) liveEl.textContent = filtered.length + ' live';

    // Show/hide empty state
    if (filtered.length === 0) {
      var existingCards = feed.querySelectorAll('.feed-card');
      existingCards.forEach(function(c) { c.remove(); });
      if (emptyEl) emptyEl.style.display = 'flex';
      renderAllMarkers([]);
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    // Build new card HTML
    var existingCards = feed.querySelectorAll('.feed-card');
    existingCards.forEach(function(c) { c.remove(); });
    var fragment = document.createDocumentFragment();
    filtered.forEach(function(l) {
      var tmp = document.createElement('div');
      tmp.innerHTML = buildCard(l);
      while (tmp.firstChild) fragment.appendChild(tmp.firstChild);
    });
    feed.appendChild(fragment);
    renderAllMarkers(filtered);

  } catch (err) {
    console.warn('Feed render note:', err);
    if (skel) skel.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'flex';
  }
}

// ── Clock tick — every second ──────────────────────────────
function tickClocks() {
  document.querySelectorAll('.clock-ring').forEach(function(ring) {
    var expires = parseInt(ring.dataset.expires, 10);
    var created = parseInt(ring.dataset.created, 10);
    var timeLeft = expires - Date.now();
    var total    = expires - created;
    var fraction = Math.max(0, Math.min(1, timeLeft / total));
    var offset   = +(CLOCK_CIRC * (1 - fraction)).toFixed(3);
    ring.setAttribute('stroke-dashoffset', offset);

    var urgency = getUrgency(expires);
    var color   = urgencyColor(urgency);
    ring.setAttribute('stroke', color);

    var card = ring.closest('.feed-card');
    if (!card) return;
    var id = card.id.replace('card-', '');

    // Update label
    var label = document.getElementById('clk-' + id);
    if (label) { label.textContent = fmtTime(timeLeft); label.style.color = color; }

    // Expire: remove from both the map and the persistent data
    if (timeLeft <= 0 && !card.classList.contains('card-fading')) {
      card.classList.add('card-fading');
      setTimeout(function() {
        card.remove();
        if (markerMap[id] && leafletMap) {
          leafletMap.removeLayer(markerMap[id]);
          delete markerMap[id];
        }
        // Remove from persistent data
        var remaining = getListings().filter(function(l) { return l.id !== id && l.expiresAt > Date.now(); });
        saveListings(remaining);
        updateLiveDot();

        var filtered = getFiltered();
        var countEl = document.getElementById('feed-count');
        if (countEl) countEl.textContent = filtered.length + ' listing' + (filtered.length !== 1 ? 's' : '');
        var liveEl = document.getElementById('live-count');
        if (liveEl) liveEl.textContent = filtered.length + ' live';

        if (filtered.length === 0) {
          var emptyEl = document.getElementById('feed-empty');
          if (emptyEl) emptyEl.style.display = 'flex';
          var emptyPill = document.getElementById('map-empty-pill');
          if (emptyPill) emptyPill.style.display = 'inline-flex';
        }
      }, 700);
    }
  });
}

// ── Pin interactions ───────────────────────────────────────
function pinHighlight(id) {
  var m = markerMap[id];
  if (!m) return;
  m.openPopup();
  highlightedPin = id;
}
function pinUnhighlight(id) {
  // leave popup open — user can close it
  highlightedPin = null;
}
function zoomToPin(id) {
  var m = markerMap[id];
  if (!m) return;
  leafletMap.setView(m.getLatLng(), 15, { animate: true });
  m.openPopup();
}
function scrollToCard(id) {
  var card = document.getElementById('card-' + id);
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.add('card-hl');
  setTimeout(function() { card.classList.remove('card-hl'); }, 1800);
}

// ── Claim ──────────────────────────────────────────────────
function claimById(id) {
  var listings = getListings();
  var idx = listings.findIndex(function(l) { return l.id === id; });
  if (idx === -1) return;
  if (listings[idx].status === 'claimed') { showToast('Already claimed!', ''); return; }
  listings[idx].status = 'claimed';
  saveListings(listings);

  if (markerMap[id]) { leafletMap.removeLayer(markerMap[id]); delete markerMap[id]; }
  leafletMap.closePopup();

  var card = document.getElementById('card-' + id);
  if (card) { card.classList.add('card-fading'); setTimeout(function() { card.remove(); }, 600); }

  var impact = getImpact();
  impact.activeListings = listings.filter(function(l) { return l.status === 'available'; }).length;
  saveImpact(impact);

  showToast('🎉 Pickup claimed! Head over to collect.', 'success');
}

// ── Simulation: new listings every 20–40 s ─────────────────
var SIM_POOL = [
  { emoji:'🍛', type:'Cooked Meals', titles:['Dal & Rice','Paneer Curry','Khichdi','Rajma Chawal','Aloo Puri','Mix Veg Thali'] },
  { emoji:'🍞', type:'Bakery',       titles:['Bread & Buns','Pav Rolls','Rusks','Toast Slices'] },
  { emoji:'🥦', type:'Fruits & Veg', titles:['Mixed Vegetables','Seasonal Fruits','Tomatoes & Onions'] },
  { emoji:'📦', type:'Packaged',     titles:['Biscuit Packets','Namkeen Bags','Juice Cartons','Rice Bags'] },
  { emoji:'🍮', type:'Sweets',       titles:['Laddoo Box','Gulab Jamun','Mixed Mithai','Kheer Cups'] }
];

function spawnSimListing() {
  var activeListings = getListings().filter(function(l) {
    return l.status === 'available' && l.expiresAt > Date.now();
  });
  if (activeListings.length >= 15) return;

  var pool   = SIM_POOL[Math.floor(Math.random() * SIM_POOL.length)];
  var title  = pool.titles[Math.floor(Math.random() * pool.titles.length)];
  var donor  = SAHYOG_DATA.donors[Math.floor(Math.random() * SAHYOG_DATA.donors.length)];
  var qty    = [10,15,20,25,30,40,50][Math.floor(Math.random() * 7)];
  var units  = ['plates','kg','packets'];
  var unit   = units[Math.floor(Math.random() * 3)];
  // Realistic remaining time between 20 minutes and 5 hours (20 to 300 minutes)
  var minutes = Math.floor(20 + Math.random() * 280);

  // Realistic latitude/longitude variety across Mathura within ~3 km
  var latOffset = (Math.random() - 0.5) * 0.025;
  var lngOffset = (Math.random() - 0.5) * 0.025;

  var listing = {
    id:            'sim_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5),
    donorId:       donor.id,
    title:         pool.emoji + ' ' + title + ' (' + qty + ' ' + unit + ')',
    quantity:      qty,
    unit:          unit,
    expiresAt:     Date.now() + minutes * 60 * 1000,
    status:        'available',
    urgent:        minutes <= 60,
    createdAt:     Date.now(),
    description:   'Real-time surplus from ' + donor.name + '.',
    safetyVerified: Math.random() > 0.4,
    lat:           donor.lat + latOffset,
    lng:           donor.lng + lngOffset,
    locationName:  donor.name
  };

  // Save
  var listings = getListings();
  listings.unshift(listing);
  saveListings(listings);

  // Toast
  showToast('🆕 ' + listing.title.substring(0, 36) + '…', 'success');

  // Add marker
  addMarker(listing);

  // Prepend card to feed if filter allows
  var feed = document.getElementById('listing-feed');
  if (feed && shouldShowInFilter(listing)) {
    var tmp = document.createElement('div');
    tmp.innerHTML = buildCard(listing);
    var newCard = tmp.firstChild;
    newCard.classList.add('card-enter');
    feed.insertBefore(newCard, feed.firstChild);
    // Update count
    var countEl = document.getElementById('feed-count');
    if (countEl) {
      var n = parseInt(countEl.textContent) || 0;
      countEl.textContent = (n + 1) + ' listing' + (n + 1 !== 1 ? 's' : '');
    }
  }
}

function shouldShowInFilter(l) {
  if (activeFilter === 'all') return true;
  var e = listingEmoji(l);
  if (activeFilter === 'cooked')    return e === '🍛';
  if (activeFilter === 'groceries') return e === '📦' || e === '🥦';
  if (activeFilter === 'under1hr')  return (l.expiresAt - Date.now()) < 3600000;
  return true;
}

function scheduleNextSim() {
  var delay = 45000 + Math.random() * 15000; // 45–60 s
  simulationTimer = setTimeout(function() {
    spawnSimListing();
    scheduleNextSim();
  }, delay);
}

// ── Filters ────────────────────────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      document.querySelectorAll('.filter-chip').forEach(function(c) {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      activeFilter = chip.dataset.filter;
      renderFeed();
    });
  });
}

// ── Live dot badge ─────────────────────────────────────────
function updateLiveDot() {
  var listings = getListings();
  var active = listings.filter(function(l) {
    return l.status === 'available' && getUrgency(l.expiresAt) !== 'expired';
  }).length;
  var el = document.getElementById('live-count');
  if (el) el.textContent = active + ' live';
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initLeafletMap();
  initFilters();
  renderFeed();
  clockInterval = setInterval(tickClocks, 1000);
  scheduleNextSim();
  updateLiveDot();
  setInterval(updateLiveDot, 8000);
});
