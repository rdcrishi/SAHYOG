// data.js — Sahyog central mock dataset & storage helpers

const SAHYOG_DATA = {
  donors: [
    { id: 'd1', name: 'Brij Bhumi Dhaba', type: 'Restaurant', lat: 27.5042, lng: 77.6845, contact: '+91-9876543210', active: true },
    { id: 'd2', name: 'Krishna Sweets & Farsan', type: 'Sweet Shop', lat: 27.5015, lng: 77.6795, contact: '+91-9988776655', active: true },
    { id: 'd3', name: 'Radha Banquet Hall', type: 'Wedding Venue', lat: 27.4788, lng: 77.6880, contact: '+91-9765432109', active: false },
    { id: 'd4', name: 'Mathura Fresh Mart', type: 'Grocery Store', lat: 27.4930, lng: 77.6740, contact: '+91-9654321098', active: true },
    { id: 'd5', name: 'Govind Caterers', type: 'Catering', lat: 27.5110, lng: 77.6690, contact: '+91-9543210987', active: true }
  ],
  volunteers: [
    { id: 'v1', name: 'Arjun Sharma', role: 'Student', lat: 27.4870, lng: 77.6750, online: true, tripsDone: 34 },
    { id: 'v2', name: 'Priya Verma', role: 'NGO Worker', lat: 27.5020, lng: 77.6640, online: true, tripsDone: 89 },
    { id: 'v3', name: 'Rohit Gupta', role: 'Student', lat: 27.4910, lng: 77.6810, online: false, tripsDone: 12 },
    { id: 'v4', name: 'Sunita Devi', role: 'NGO Worker', lat: 27.5080, lng: 77.6560, online: true, tripsDone: 156 },
    { id: 'v5', name: 'Karan Yadav', role: 'Student', lat: 27.4830, lng: 77.6900, online: true, tripsDone: 23 }
  ],
  pickupPoints: [
    { id: 'p1', name: 'Yamuna Kinara Night Shelter', type: 'Night Shelter', lat: 27.4760, lng: 77.6820, capacity: 80 },
    { id: 'p2', name: 'Seva Bharati Community Kitchen', type: 'Community Kitchen', lat: 27.5030, lng: 77.6680, capacity: 150 },
    { id: 'p3', name: 'Mathura Railway Station Aid Point', type: 'Aid Point', lat: 27.4950, lng: 77.6650, capacity: 60 },
    { id: 'p4', name: 'Vrindavan Ashram Kitchen', type: 'Ashram', lat: 27.5750, lng: 77.6950, capacity: 200 }
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

// ── Initial Seeded Listings: 8 listings spread across Mathura (~3 km radius) ──
function getInitialSeededListings() {
  var now = Date.now();
  return [
    {
      id: 'l1',
      donorId: 'd1',
      title: '🍛 Dal Makhani & Roti (45 servings)',
      quantity: 45,
      unit: 'servings',
      lat: 27.5042,
      lng: 77.6845,
      locationName: 'Vishram Ghat, Mathura',
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
      title: '🍮 Mathura Peda & Besan Laddoo (15 kg)',
      quantity: 15,
      unit: 'kg',
      lat: 27.5015,
      lng: 77.6795,
      locationName: 'Chhatta Bazaar, Holi Gate',
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
      lat: 27.5110,
      lng: 77.6690,
      locationName: 'Govind Nagar, Janmabhoomi Marg',
      createdAt: now - 50 * 60 * 1000,
      expiresAt: now + 35 * 60 * 1000, // 35m left (urgent!)
      status: 'available',
      urgent: true,
      safetyVerified: true,
      description: 'Post-event catering surplus, kept hot and fresh.'
    },
    {
      id: 'l4',
      donorId: 'd4',
      title: '🥦 Fresh Apples, Bananas & Spinach (25 kg)',
      quantity: 25,
      unit: 'kg',
      lat: 27.4930,
      lng: 77.6740,
      locationName: 'Dampier Nagar, Civil Lines',
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
      title: '🍞 Fresh Milk Bread & Pav Buns (40 packets)',
      quantity: 40,
      unit: 'packets',
      lat: 27.4870,
      lng: 77.6610,
      locationName: 'Krishna Nagar Market',
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
      title: '🍛 Chole Kulche & Veg Pulao (35 plates)',
      quantity: 35,
      unit: 'plates',
      lat: 27.4820,
      lng: 77.6675,
      locationName: 'Mathura Junction Station Road',
      createdAt: now - 40 * 60 * 1000,
      expiresAt: now + 50 * 60 * 1000, // 50m left (urgent!)
      status: 'available',
      urgent: true,
      safetyVerified: true,
      description: 'Prepared for railway tour group, freshly packed.'
    },
    {
      id: 'l7',
      donorId: 'd4',
      title: '📦 Atta Bags & Marie Biscuit Boxes (18 packets)',
      quantity: 18,
      unit: 'packets',
      lat: 27.5180,
      lng: 77.6780,
      locationName: 'Masani Chowk, Mathura North',
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
      title: '🍮 Gulab Jamun & Rasgulla Tins (12 kg)',
      quantity: 12,
      unit: 'kg',
      lat: 27.4740,
      lng: 77.6720,
      locationName: 'Dhauli Pyau, Mathura Cantt',
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
    // 1. Remove expired listings
    valid = stored.filter(function(l) {
      return l && l.expiresAt && (l.expiresAt > now);
    });
  }

  // 2. If no valid unexpired listings exist, reseed with 8 fresh Mathura listings
  if (valid.length === 0) {
    valid = getInitialSeededListings();
    saveListings(valid);
  } else {
    // 3. Cap active listings at 15 maximum
    if (valid.length > 15) {
      valid = valid.slice(0, 15);
    }
    // If any expired were pruned or capped, persist back
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
  p1: { needLevel: 'High',     mealsNeeded: 60,  label: 'Yamuna Kinara Night Shelter' },
  p2: { needLevel: 'Medium',   mealsNeeded: 40,  label: 'Seva Bharati Community Kitchen' },
  p3: { needLevel: 'Critical', mealsNeeded: 85,  label: 'Railway Station Aid Point' },
  p4: { needLevel: 'Low',      mealsNeeded: 20,  label: 'Vrindavan Ashram Kitchen' }
};

function getNeedData() {
  return loadFromStorage('need_data', DEFAULT_NEED_DATA);
}

function saveNeedData(d) {
  saveToStorage('need_data', d);
}
