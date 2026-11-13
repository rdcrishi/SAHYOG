// pages/home.js — polished v2

function formatTimeLeft(ms) {
  if (ms <= 0) return 'Expired';
  var totalSec = Math.floor(ms / 1000);
  if (totalSec < 120) return totalSec + 's left';
  var h = Math.floor(totalSec / 3600);
  var m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return h + 'h ' + (m > 0 ? m + 'm' : '0m') + ' left';
  return m + 'm left';
}

function getDonorName(donorId) {
  var d = SAHYOG_DATA.donors.find(function(x) { return x.id === donorId; });
  return d ? d.name : 'Unknown';
}

function renderListings() {
  var all = getListings();
  var listings = all.filter(function(l) {
    return l.status !== 'claimed' || currentRole === 'volunteer';
  });
  var container = document.getElementById('listings-container');
  var skeleton  = document.getElementById('listings-skeleton');
  var emptyEl   = document.getElementById('listings-empty');
  if (!container) return;

  // Hide skeleton once we render
  if (skeleton) skeleton.style.display = 'none';

  var toShow = listings.filter(function(l) {
    return l.expiresAt > Date.now();
  }).slice(0, 4);

  if (toShow.length === 0) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  container.innerHTML = toShow.map(function(l) {
    var timeLeft = l.expiresAt - Date.now();
    var isUrgent = l.urgent || timeLeft < 2 * 3600 * 1000;
    var isClaimed = l.status === 'claimed';
    var donorName = getDonorName(l.donorId);

    var badge = isClaimed
      ? '<span class="badge badge-claimed" aria-label="Status: Claimed">✓ Claimed</span>'
      : isUrgent
        ? '<span class="badge badge-urgent" aria-label="Status: Urgent">⚡ Urgent</span>'
        : '<span class="badge badge-available" aria-label="Status: Available">✓ Available</span>';

    var actionBtn = isClaimed
      ? ''
      : currentRole === 'volunteer'
        ? '<button class="btn-sm btn-primary" onclick="claimListing(\'' + l.id + '\')" aria-label="Claim pickup for ' + l.title + '">🙋 Claim Pickup</button>'
        : '<button class="btn-sm btn-primary" onclick="editListing(\'' + l.id + '\')" aria-label="Edit listing ' + l.title + '">✏️ Edit</button>';

    return '<article class="card listing-card ' + (isUrgent ? 'urgent' : 'available') + '" id="listing-' + l.id + '" aria-label="' + l.title + '">' +
      '<div class="listing-header">' +
        '<div class="listing-title">' + l.title + '</div>' +
        badge +
      '</div>' +
      '<div class="listing-meta">' +
        '<span class="meta-item" aria-label="Donor: ' + donorName + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>' +
          donorName +
        '</span>' +
        '<span class="meta-item" aria-label="Time left: ' + formatTimeLeft(timeLeft) + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
          formatTimeLeft(timeLeft) +
        '</span>' +
        '<span class="meta-item" aria-label="Quantity: ' + l.quantity + ' ' + l.unit + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' +
          l.quantity + ' ' + l.unit +
        '</span>' +
      '</div>' +
      '<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">' + l.description + '</p>' +
      '<div class="listing-actions">' +
        actionBtn +
        '<a href="map.html" class="btn-sm btn-outline" aria-label="View ' + l.title + ' on map">🗺 View Map</a>' +
      '</div>' +
    '</article>';
  }).join('');
}

function claimListing(id) {
  var listings = getListings();
  var idx = listings.findIndex(function(l) { return l.id === id; });
  if (idx === -1) return;
  listings[idx].status = 'claimed';
  saveListings(listings);
  showToast('🎉 Pickup claimed! Head over to collect.', 'success');
  renderListings();
  updateStats();
}

function editListing(id) {
  window.location.href = 'donate.html';
}

function updateStats() {
  var impact = getImpact();
  var listings = getListings();
  var activeCount = listings.filter(function(l) { return l.status === 'available'; }).length;
  var onlineVols = SAHYOG_DATA.volunteers.filter(function(v) { return v.online; }).length;

  var mealsEl    = document.getElementById('stat-meals');
  var listingsEl = document.getElementById('stat-listings');
  var volsEl     = document.getElementById('stat-volunteers');
  var volCount   = document.getElementById('vol-listings-count');

  if (mealsEl) {
    // Animate count-up
    var target = impact.mealsSavedToday;
    var start  = parseInt(mealsEl.textContent) || 0;
    var t0     = performance.now();
    var dur    = 900;
    function tick(now) {
      var p = Math.min((now - t0) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      mealsEl.textContent = Math.round(start + (target - start) * ease);
      mealsEl.setAttribute('aria-label', 'Meals saved today: ' + mealsEl.textContent);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (listingsEl) listingsEl.textContent = activeCount;
  if (volsEl)     volsEl.textContent     = onlineVols;
  if (volCount)   volCount.textContent   = activeCount;
}

document.addEventListener('DOMContentLoaded', function() {
  updateStats();
  renderListings();

  // Re-render on role change
  document.addEventListener('rolechange', function() {
    renderListings();
  });
});
