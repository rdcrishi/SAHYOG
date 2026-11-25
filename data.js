// data.js — Sahyog central mock dataset & storage helpers (Kota, Rajasthan)

const SAHYOG_DATA = {
  donors: [
    { id: 'd1', name: 'Chambal Dhaba & Family Restaurant', type: 'Restaurant', lat: 25.1735, lng: 75.8480, contact: '+91-9876543210', active: true },
    { id: 'd2', name: 'Jodhpur Sweets & Namkeen', type: 'Sweet Shop', lat: 25.1865, lng: 75.8420, contact: '+91-9988776655', active: true },
    { id: 'd3', name: 'Hadoti Banquet & Resort', type: 'Wedding Venue', lat: 25.1480, lng: 75.8560, contact: '+91-9765432109', active: false },
    { id: 'd4', name: 'Kota Fresh Mart', type: 'Grocery Store', lat: 25.1460, lng: 75.8380, contact: '+91-9654321098', active: true },
    { id: 'd5', name: 'Radhey Caterers & Mess', type: 'Catering & Mess', lat: 25.1380, lng: 75.8320, contact: '+91-9543210987', active: true }
  ],
  volunteers: [
    { id: 'v1', name: 'Arjun Sharma', role: 'Student (Talwandi)', lat: 25.1410, lng: 75.8350, online: true, tripsDone: 38 },
    { id: 'v2', name: 'Priya Verma', role: 'NGO Worker (Dadabari)', lat: 25.1620, lng: 75.8310, online: true, tripsDone: 94 },
    { id: 'v3', name: 'Rohit Gupta', role: 'Student (Vigyan Nagar)', lat: 25.1490, lng: 75.8420, online: false, tripsDone: 15 },
    { id: 'v4', name: 'Sunita Devi', role: 'Social Worker (Gumanpura)', lat: 25.1740, lng: 75.8490, online: true, tripsDone: 162 },
    { id: 'v5', name: 'Karan Meena', role: 'Student (Nayapura)', lat: 25.1850, lng: 75.8440, online: true, tripsDone: 29 }
  ],
  pickupPoints: [
    { id: 'p1', name: 'Chambal Kinara Night Shelter', type: 'Night Shelter', lat: 25.1890, lng: 75.8360, capacity: 90 },
    { id: 'p2', name: 'Seva Bharati Community Kitchen', type: 'Community Kitchen', lat: 25.1610, lng: 75.8280, capacity: 160 },
    { id: 'p3', name: 'Kota Junction Railway Station Aid Point', type: 'Aid Point', lat: 25.2180, lng: 75.8640, capacity: 75 },
    { id: 'p4', name: 'Kishorepura Community Kitchen', type: 'Community Kitchen', lat: 25.1770, lng: 75.8240, capacity: 120 }
  ],
  impact: {
    mealsSavedToday: 342,
    totalMealsSaved: 18740,
    activeListings: 8,
    volunteersOnline: 4,
    co2Saved: 1250,
    activeDonors: 5
  }
};

// ── Initial Seeded Listings: 8 listings spread across Kota (~3 km radius) ──
function getInitialSeededListings() {
  var now = Date.now();
  return [
    {
      id: 'l1',
      donorId: 'd1',
      title: '🍛 Dal Baati Churma & Gatte (45 servings)',
      quantity: 45,
      unit: 'servings',
      lat: 25.1735,
      lng: 75.8480,
      locationName: 'Gumanpura Main Market, Kota',
      createdAt: now - 25 * 60 * 1000,
      expiresAt: now + 105 * 60 * 1000, // 1h 45m left
      status: 'available',
      urgent: false,
      safetyVerified: true,
      description: 'Fresh lunch surplus, covered stainless steel vessels.'
    },
    {
      id: 'l2',
      donorId: 'd2',
      title: '🍮 Kota Kachori & Ghewar Box (15 kg)',
      quantity: 15,
      unit: 'kg',
      lat: 25.1865,
      lng: 75.8420,
      locationName: 'Nayapura Circle, Kota',
      createdAt: now - 30 * 60 * 1000,
      expiresAt: now + 270 * 60 * 1000, // 4h 30m left
      status: 'available',
      urgent: false,
      safetyVerified: true,
      description: 'Morning sweets batch in sealed trays, excellent quality.'
    },
    {
      id: 'l3',
      donorId: 'd5',
      title: '🍛 Shahi Paneer & Jeera Rice (60 servings)',
      quantity: 60,
      unit: 'servings',
      lat: 25.1380,
      lng: 75.8320,
      locationName: 'Talwandi Commerce Hub, Kota',
      createdAt: now - 50 * 60 * 1000,
      expiresAt: now + 35 * 60 * 1000, // 35m left (urgent!)
      status: 'available',
      urgent: true,
      safetyVerified: true,
      description: 'Hostel mess dinner surplus, kept piping hot and fresh.'
    },
    {
      id: 'l4',
      donorId: 'd4',
      title: '🥦 Fresh Apples, Papaya & Spinach (25 kg)',
      quantity: 25,
      unit: 'kg',
      lat: 25.1460,
      lng: 75.8380,
      locationName: 'Vigyan Nagar Market, Kota',
      createdAt: now - 45 * 60 * 1000,
      expiresAt: now + 195 * 60 * 1000, // 3h 15m left
      status: 'available',
      urgent: false,
      safetyVerified: true,
      description: 'Unsold retail produce, fresh and undamaged.'
    },
    {
      id: 'l5',
      donorId: 'd1',
      title: '🍞 Fresh Pav Buns & Sandwich Bread (40 packets)',
      quantity: 40,
      unit: 'packets',
      lat: 25.1610,
      lng: 75.8330,
      locationName: 'Dadabari Chauraha, Kota',
      createdAt: now - 15 * 60 * 1000,
      expiresAt: now + 130 * 60 * 1000, // 2h 10m left
      status: 'available',
      urgent: false,
      safetyVerified: true,
      description: 'Bakery batch baked today, sealed packaging.'
    },
    {
      id: 'l6',
      donorId: 'd5',
      title: '🍛 Chole Bhature & Veg Pulao (35 plates)',
      quantity: 35,
      unit: 'plates',
      lat: 25.1420,
      lng: 75.8470,
      locationName: 'Mahaveer Nagar Extension, Kota',
      createdAt: now - 40 * 60 * 1000,
      expiresAt: now + 50 * 60 * 1000, // 50m left (urgent!)
      status: 'available',
      urgent: true,
      safetyVerified: true,
      description: 'Prepared for student batch lunch, freshly packed.'
    },
    {
      id: 'l7',
      donorId: 'd4',
      title: '📦 Atta Bags & Marie Biscuit Boxes (18 packets)',
      quantity: 18,
      unit: 'packets',
      lat: 25.2180,
      lng: 75.8640,
      locationName: 'Station Road, Kota Junction',
      createdAt: now - 10 * 60 * 1000,
      expiresAt: now + 290 * 60 * 1000, // 4h 50m left
      status: 'available',
      urgent: false,
      safetyVerified: true,
      description: 'Intact packaged staples surplus from grocery stock.'
    },
    {
      id: 'l8',
      donorId: 'd2',
      title: '🍮 Moong Dal Halwa & Gulab Jamun (12 kg)',
      quantity: 12,
      unit: 'kg',
      lat: 25.1660,
      lng: 75.8410,
      locationName: 'Aerodrome Circle, Kota',
      createdAt: now - 35 * 60 * 1000,
      expiresAt: now + 165 * 60 * 1000, // 2h 45m left
      status: 'available',
      urgent: false,
      safetyVerified: true,
      description: 'Fresh festive sweets prepared this afternoon.'
    }
  ];
}

// ── Storage helpers ─────────────────────────────────────────
function saveToStorage(key, data) {
  try { localStorage.setItem('sahyog_' + key, JSON.stringify(data)); } catch(e) {}
}

function loadFromStorage(key, fallback) {
  try {
    const v = localStorage.getItem('sahyog_' + key);
    return v ? JSON.parse(v) : fallback;
  } catch(e) { return fallback; }
}

// ── Listings with expiry cleanup & 15 max cap ───────────────
function getListings() {
  var stored = loadFromStorage('listings', null);
  var now = Date.now();
  var valid = [];

  if (stored && Array.isArray(stored)) {
    // 1. Remove expired listings or old non-Kota listings
    valid = stored.filter(function(l) {
      var isKota = l && l.lat && (l.lat > 24.5 && l.lat < 26.0);
      return l && l.expiresAt && (l.expiresAt > now) && isKota;
    });
  }

  // 2. If no valid unexpired Kota listings exist, reseed with 8 fresh Kota listings
  if (valid.length === 0) {
    valid = getInitialSeededListings();
    saveListings(valid);
  } else {
    // 3. Cap active listings at 15 maximum
    if (valid.length > 15) {
      valid = valid.slice(0, 15);
    }
    // If any expired or non-Kota were pruned or capped, persist back
    if (!stored || valid.length !== stored.length) {
      saveListings(valid);
    }
  }

  return valid;
}

function saveListings(listings) {
  if (Array.isArray(listings)) {
    // Ensure cap of 15 when saving
    var capped = listings.filter(function(l) {
      return l && l.expiresAt && l.expiresAt > Date.now();
    }).slice(0, 15);
    saveToStorage('listings', capped);
  } else {
    saveToStorage('listings', listings);
  }
}

function getImpact() {
  return loadFromStorage('impact', SAHYOG_DATA.impact);
}

function saveImpact(impact) {
  saveToStorage('impact', impact);
}

// ── Need data (for heatmap & smart match) ─────────────────
var DEFAULT_NEED_DATA = {
  p1: { needLevel: 'High',     mealsNeeded: 65,  label: 'Chambal Kinara Night Shelter' },
  p2: { needLevel: 'Medium',   mealsNeeded: 45,  label: 'Seva Bharati Community Kitchen' },
  p3: { needLevel: 'Critical', mealsNeeded: 90,  label: 'Kota Junction Aid Point' },
  p4: { needLevel: 'Low',      mealsNeeded: 25,  label: 'Kishorepura Community Kitchen' }
};

function getNeedData() {
  var d = loadFromStorage('need_data', null);
  // Auto-upgrade if empty or old Mathura data
  if (!d || !d.p1 || (d.p1.label && d.p1.label.indexOf('Yamuna') !== -1)) {
    d = DEFAULT_NEED_DATA;
    saveNeedData(d);
  }
  return d;
}

function saveNeedData(d) {
  saveToStorage('need_data', d);
}
