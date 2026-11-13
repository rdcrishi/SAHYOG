// pages/impact.js — Impact Dashboard for Sahyog

// ── Mock data ──────────────────────────────────────────────────────
var DONOR_STATS = [
  { id: 'd1', name: 'Brij Bhumi Dhaba',       type: 'Restaurant',    meals: 1240, drops: 32, badges: ['communityStar', 'hundredMeals', 'zeroWaste'] },
  { id: 'd2', name: 'Krishna Sweets & Farsan', type: 'Sweet Shop',    meals: 980,  drops: 28, badges: ['hundredMeals', 'speedDonor'] },
  { id: 'd5', name: 'Govind Caterers',          type: 'Catering',      meals: 840,  drops: 24, badges: ['hundredMeals', 'firstRescue'] },
  { id: 'd4', name: 'Mathura Fresh Mart',       type: 'Grocery Store', meals: 620,  drops: 18, badges: ['firstRescue', 'speedDonor'] },
  { id: 'd3', name: 'Radha Banquet Hall',       type: 'Wedding Venue', meals: 390,  drops: 11, badges: ['firstRescue'] }
];

var BADGES = {
  communityStar: { icon: '🌟', label: 'Community Star' },
  hundredMeals:  { icon: '🍱', label: '100 Meals Hero' },
  zeroWaste:     { icon: '♻️', label: 'Zero Waste Champion' },
  speedDonor:    { icon: '⚡', label: 'Speed Donor' },
  firstRescue:   { icon: '🌱', label: 'First Rescue' }
};

var WEEKLY_BASE = [185, 240, 310, 195, 420, 380];
var DAY_LABELS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

var impactChart = null;

// ── Animated count-up ──────────────────────────────────────────────
function animateCount(el, target, duration, suffix) {
  if (!el) return;
  duration = duration || 1200;
  suffix   = suffix   || '';
  var start     = 0;
  var startTime = null;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function step(ts) {
    if (!startTime) startTime = ts;
    var progress = Math.min((ts - startTime) / duration, 1);
    var value    = Math.round(easeOut(progress) * target);
    el.textContent = value.toLocaleString('en-IN') + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Stats section ──────────────────────────────────────────────────
function initStats() {
  var impact        = getImpact();
  var kgRescued     = Math.round(impact.totalMealsSaved / 4);
  var co2Avoided    = Math.round(kgRescued * 2.5);
  var volsOnline    = SAHYOG_DATA.volunteers.filter(function(v) { return v.online; }).length;
  var donorsWeek    = SAHYOG_DATA.donors.filter(function(d) { return d.active; }).length;

  animateCount(document.getElementById('stat-meals-today'),  impact.mealsSavedToday, 900);
  animateCount(document.getElementById('stat-kg-rescued'),   kgRescued,  1100);
  animateCount(document.getElementById('stat-co2-avoided'),  co2Avoided, 1300);
  animateCount(document.getElementById('stat-vols-online'),  volsOnline, 700);
  animateCount(document.getElementById('stat-donors-week'),  donorsWeek, 700);
  animateCount(document.getElementById('stat-total-meals'),  impact.totalMealsSaved, 1400);

  // Populate share tile numbers too
  var weekly = getWeeklyData();
  var weeklyTotal = weekly.reduce(function(a, b) { return a + b; }, 0);
  var shareTotal  = document.getElementById('share-meals-total');
  var shareKg     = document.getElementById('share-kg');
  var shareCo2    = document.getElementById('share-co2');
  var shareVols   = document.getElementById('share-vols');
  var shareWeekEl = document.getElementById('share-week-label');
  if (shareTotal)  shareTotal.textContent  = weeklyTotal.toLocaleString('en-IN');
  if (shareKg)     shareKg.textContent     = kgRescued.toLocaleString('en-IN') + ' kg';
  if (shareCo2)    shareCo2.textContent    = co2Avoided.toLocaleString('en-IN') + ' kg CO₂';
  if (shareVols)   shareVols.textContent   = volsOnline + ' volunteers';
  if (shareWeekEl) shareWeekEl.textContent = weeklyTotal.toLocaleString('en-IN');
}

// ── Chart ──────────────────────────────────────────────────────────
function getWeeklyData() {
  var impact  = getImpact();
  var data    = WEEKLY_BASE.slice();
  data.push(impact.mealsSavedToday);
  return data;
}

function initChart() {
  var canvas = document.getElementById('meals-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  var ctx  = canvas.getContext('2d');
  var data = getWeeklyData();

  // Green gradient
  var grad = ctx.createLinearGradient(0, 0, 0, 280);
  grad.addColorStop(0,   'rgba(31,122,77,0.9)');
  grad.addColorStop(1,   'rgba(31,122,77,0.3)');

  impactChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DAY_LABELS,
      datasets: [{
        label: 'Meals Saved',
        data: data,
        backgroundColor: data.map(function(_, i) {
          return i === data.length - 1 ? 'rgba(245,158,11,0.85)' : grad;
        }),
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) { return ' ' + ctx.parsed.y + ' meals'; }
          },
          backgroundColor: '#1A1A1A',
          titleFont: { family: 'Inter', size: 12 },
          bodyFont:  { family: 'Inter', size: 13, weight: '700' },
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 12, weight: '600' }, color: '#6B7280' }
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { font: { family: 'Inter', size: 11 }, color: '#6B7280' },
          beginAtZero: true
        }
      },
      animation: { duration: 900, easing: 'easeOutQuart' }
    }
  });
}

// ── Donor Leaderboard ──────────────────────────────────────────────
var RANK_MEDALS = ['🥇', '🥈', '🥉'];

function renderDonorLeaderboard() {
  var container = document.getElementById('donor-board');
  if (!container) return;

  var html = DONOR_STATS.map(function(donor, i) {
    var medal   = i < 3 ? RANK_MEDALS[i] : '<span class="rank-num">' + (i + 1) + '</span>';
    var badgeHtml = donor.badges.slice(0, 3).map(function(key) {
      var b = BADGES[key];
      return '<span class="badge-chip">' + b.icon + ' ' + b.label + '</span>';
    }).join('');

    return '<div class="rank-card">' +
      '<div class="rank-medal">' + medal + '</div>' +
      '<div class="rank-info">' +
        '<div class="rank-name">' + donor.name + '</div>' +
        '<div class="rank-sub">' + donor.type + ' · ' + donor.drops + ' drops</div>' +
        '<div class="rank-badges">' + badgeHtml + '</div>' +
      '</div>' +
      '<div class="rank-stat">' +
        '<div class="rank-stat-num">' + donor.meals.toLocaleString('en-IN') + '</div>' +
        '<div class="rank-stat-label">meals</div>' +
      '</div>' +
    '</div>';
  }).join('');

  container.innerHTML = html;
}

// ── Volunteer List ─────────────────────────────────────────────────
function getVolunteerBadge(trips) {
  if (trips >= 100) return { icon: '🏆', label: 'Legend' };
  if (trips >= 50)  return { icon: '🌟', label: 'Super Volunteer' };
  if (trips >= 20)  return { icon: '💪', label: 'Hardworker' };
  if (trips >= 10)  return { icon: '🚀', label: 'Sprinter' };
  return { icon: '🌱', label: 'Newcomer' };
}

function renderVolunteerList() {
  var container = document.getElementById('volunteer-board');
  if (!container) return;

  var sorted = SAHYOG_DATA.volunteers.slice().sort(function(a, b) {
    return b.tripsDone - a.tripsDone;
  });

  var html = sorted.map(function(vol, i) {
    var medal  = i < 3 ? RANK_MEDALS[i] : '<span class="rank-num">' + (i + 1) + '</span>';
    var badge  = getVolunteerBadge(vol.tripsDone);
    var status = vol.online
      ? '<span class="vol-online-dot"></span> Online'
      : '<span class="vol-offline-dot"></span> Offline';

    return '<div class="rank-card">' +
      '<div class="rank-medal">' + medal + '</div>' +
      '<div class="rank-info">' +
        '<div class="rank-name">' + vol.name + '</div>' +
        '<div class="rank-sub">' + vol.role + ' · ' + status + '</div>' +
        '<div class="rank-badges">' +
          '<span class="badge-chip">' + badge.icon + ' ' + badge.label + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="rank-stat">' +
        '<div class="rank-stat-num">' + vol.tripsDone + '</div>' +
        '<div class="rank-stat-label">trips</div>' +
      '</div>' +
    '</div>';
  }).join('');

  container.innerHTML = html;
}

// ── Milestones ─────────────────────────────────────────────────────
function renderMilestones() {
  var impact = getImpact();
  var milestones = [
    { icon: '🎯', title: '10,000 meals milestone',   desc: 'Sahyog hit 10,000 meals saved in just 3 months!',   done: impact.totalMealsSaved >= 10000 },
    { icon: '🚴', title: '300 volunteer trips',       desc: 'Our volunteers have collectively cycled 300 trips.',  done: true },
    { icon: '🌍', title: '5,000 kg food rescued',     desc: 'Over 5 tonnes of food diverted from landfill.',      done: Math.round(impact.totalMealsSaved / 4) >= 5000 }
  ];

  var container = document.getElementById('milestones-strip');
  if (!container) return;

  container.innerHTML = milestones.map(function(m) {
    return '<div class="milestone-card ' + (m.done ? 'done' : 'pending') + '">' +
      '<div class="milestone-icon">' + m.icon + '</div>' +
      '<div class="milestone-body">' +
        '<div class="milestone-title">' + m.title + '</div>' +
        '<div class="milestone-desc">' + m.desc + '</div>' +
      '</div>' +
      '<div class="milestone-check">' + (m.done ? '✅' : '🔒') + '</div>' +
    '</div>';
  }).join('');
}

// ── Share card ─────────────────────────────────────────────────────
function initShareCard() {
  var dlBtn   = document.getElementById('btn-download-img');
  var copyBtn = document.getElementById('btn-copy-text');

  if (dlBtn) {
    dlBtn.addEventListener('click', function() {
      downloadShareImage();
    });
  }
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      copyShareText();
    });
  }
}

function downloadShareImage() {
  var dlBtn = document.getElementById('btn-download-img');
  if (dlBtn) { dlBtn.textContent = '⏳ Generating...'; dlBtn.disabled = true; }

  try {
    var impact = getImpact();
    var weekly = getWeeklyData();
    var total  = weekly.reduce(function(a, b) { return a + b; }, 0);
    var kg     = Math.round(impact.totalMealsSaved / 4);
    var co2    = Math.round(kg * 2.5);
    var vols   = SAHYOG_DATA.volunteers.filter(function(v) { return v.online; }).length;

    var canvas = document.createElement('canvas');
    canvas.width  = 960;
    canvas.height = 600;
    var ctx = canvas.getContext('2d');

    // Background gradient
    var grad = ctx.createLinearGradient(0, 0, 960, 600);
    grad.addColorStop(0, '#1F7A4D');
    grad.addColorStop(0.6, '#165C38');
    grad.addColorStop(1, '#0D3D26');
    ctx.fillStyle = grad;

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(0, 0, 960, 600, 32);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, 960, 600);
    }

    // Soft glow decorative shapes
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.beginPath();
    ctx.arc(880, 80, 160, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.arc(80, 540, 140, 0, Math.PI * 2);
    ctx.fill();

    // Brand header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Inter, -apple-system, sans-serif';
    ctx.fillText('🌿 Sahyog', 60, 85);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '600 20px Inter, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('sahyog.in · Mathura, UP', 900, 85);
    ctx.textAlign = 'left';

    // Big Meals Number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 110px Inter, -apple-system, sans-serif';
    ctx.fillText(total.toLocaleString('en-IN'), 60, 215);

    // Subtitle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '600 26px Inter, -apple-system, sans-serif';
    ctx.fillText('meals saved by neighbours this week in Mathura', 60, 268);

    // Accent line
    var lineGrad = ctx.createLinearGradient(60, 310, 900, 310);
    lineGrad.addColorStop(0, '#F59E0B');
    lineGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(60, 310, 840, 4);

    // 3 Stat cards
    var stats = [
      { val: kg.toLocaleString('en-IN') + ' kg', label: 'Food Rescued' },
      { val: co2.toLocaleString('en-IN') + ' kg CO₂', label: 'Emissions Avoided' },
      { val: vols + ' active', label: 'Volunteers This Week' }
    ];

    var boxW = 260;
    var boxH = 120;
    var startX = 60;
    var boxY = 350;
    var gap = 30;

    for (var i = 0; i < stats.length; i++) {
      var bx = startX + i * (boxW + gap);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(bx, boxY, boxW, boxH, 16);
        ctx.fill();
      } else {
        ctx.fillRect(bx, boxY, boxW, boxH);
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Inter, -apple-system, sans-serif';
      ctx.fillText(stats[i].val, bx + 22, boxY + 52);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '500 16px Inter, -apple-system, sans-serif';
      ctx.fillText(stats[i].label, bx + 22, boxY + 90);
    }

    // Tagline
    ctx.fillStyle = '#FDE68A';
    ctx.font = 'italic 500 18px Inter, -apple-system, sans-serif';
    ctx.fillText('"Food that\'s surplus to you is a meal to someone."', 60, 545);

    // Trigger download
    var link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'sahyog-impact.png';
    link.click();

    if (dlBtn) { dlBtn.textContent = '📷 Download Image'; dlBtn.disabled = false; }
    showToast('Impact image downloaded!', 'success');

  } catch (err) {
    console.warn('Canvas export note:', err);
    if (dlBtn) { dlBtn.textContent = '📷 Download Image'; dlBtn.disabled = false; }
    copyShareText();
  }
}

function copyShareText() {
  var impact  = getImpact();
  var weekly  = getWeeklyData();
  var total   = weekly.reduce(function(a, b) { return a + b; }, 0);
  var kg      = Math.round(impact.totalMealsSaved / 4);
  var co2     = Math.round(kg * 2.5);
  var text    = 'This week, Sahyog neighbours saved ' + total.toLocaleString('en-IN') + ' meals in Mathura! ' +
                'Together we rescued ' + kg.toLocaleString('en-IN') + ' kg of food and avoided ' + co2.toLocaleString('en-IN') + ' kg of CO\u2082. ' +
                'Join us at sahyog.in 🌿';

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('Copied to clipboard!', 'success');
    }).catch(function() {
      showToast('Copy failed — please copy manually.', '');
    });
  } else {
    showToast('Clipboard not supported on this device.', '');
  }
}

// ── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initStats();
  renderDonorLeaderboard();
  renderVolunteerList();
  renderMilestones();
  initShareCard();

  // Chart initialises after a short delay to ensure Chart.js is ready
  setTimeout(function() {
    initChart();
  }, 100);
});
