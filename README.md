# 🌿 Sahyog — Hyper-Local Surplus Food Redistribution

> *"Food that's surplus to you is a meal to someone."*

Sahyog is a hyper-local surplus food redistribution web app prototype connecting surplus food donors (restaurants, caterers, grocery stores, wedding venues) with volunteers and community pickup points (night shelters, community kitchens) in **Mathura, Uttar Pradesh**.

---

## 🎯 The Problem

Every evening in cities across India, surplus food from lunch services, banquets, and shops is thrown away due to a lack of immediate hyper-local coordination. At the same time, nearby night shelters and community kitchens scramble to prepare meals for people in need. The bottleneck is neither supply nor empathy — it is **speed, coordination, and trust**.

## 💡 The Solution

Sahyog bridges this gap in four seamless steps:

1. **Donors post surplus in under 30 seconds** — rapid icon selector, quick unit steppers, shelf-life chips, and a hygiene self-check. No tedious forms.
2. **Volunteers spot urgency on a Live Map** — colour-coded pins reflect shelf life (green &gt;3h, orange 1–3h, pulsing red &lt;1h) alongside real-time circular spoilage countdown clocks.
3. **Safe Claim & Turn-by-Turn Delivery** — volunteers claim a pickup, verify with a 4-digit Safe Handoff Code at pickup, and deliver to the nearest shelter with route visualization.
4. **Demand-Driven Smart Matching & Heatmaps** — night shelter managers update nightly meal needs in one tap; smart match algorithms suggest optimal destinations based on distance, need level, and remaining shelf life.

---

## ✨ Complete Feature Tour

| Page | Key Features |
|------|--------------|
| **Home (`index.html`)** | Hero with Mathura context; live animated stats strip (meals saved today, active listings, volunteers online); 3-way role switcher (`Donor`, `Volunteer`, `Shelter`); listings feed with skeletons, empty &amp; error states; role-specific callouts. |
| **Donate (`donate.html`)** | Fast 1-screen listing flow; category icon tiles (Cooked, Bakery, Produce, Packaged, Sweets); +/- stepper + quick picks (10, 20, 50, 100); shelf-life chips; interactive mini-map pin repositioning; 3-point hygiene checklist generating a **"Safety verified"** badge; live progress bar + listing timer; celebratory success card. |
| **Live Map (`map.html`)** | Leaflet.js + OpenStreetMap with Mathura coordinates; urgency-based custom map markers with pulsing red pins; community pickup point icons; scrollable feed with dynamic SVG spoilage countdown rings; real-time listing simulation every 20–40s; map &amp; feed loading skeletons, friendly error states, and empty states. |
| **Claim & Deliver Flow** | 4-step slide-up drawer (`Claimed` → `Picked Up` → `On the Way` → `Delivered`); route line drawn between donor and nearest shelter; animated volunteer courier marker; "Spoilage Safe?" buffer calculation; 4-digit PIN verification modal; persistent "My Drops" history. |
| **Need Heatmap & Smart Match** | Soft glowing circles sized and coloured by shelter need (Low, Medium, High, Critical); Shelter Manager role form to update tonight's meal requirement; "Smart Match" button with one-line heuristic justification. |
| **Impact Dashboard (`impact.html`)** | Animated count-up statistics; Chart.js 7-day daily meals bar chart; Top Donors leaderboard with medal ranks (🥇, 🥈, 🥉) and badges (*Community Star*, *100 Meals Hero*, *Zero Waste Champion*); Top Volunteers leaderboard; community milestones; downloadable PNG summary tile generated via native HTML5 Canvas. |
| **Demo Mode & Tour** | Footer bar with `↺ Reset & Tour` button that resets mock data in `localStorage` and guides evaluators through 4 interactive step tooltips explaining the core value loop. |

---

## 🛠 Tech Stack

Designed to run immediately in any modern browser without npm, node, webpack, or any build step:

- **Markup:** Semantic HTML5 (`<main>`, `<nav>`, `<article>`, `<section>`, `<header>`, `<footer>`) with full ARIA attributes.
- **Styling:** Vanilla CSS3 with CSS custom properties (variables), Flexbox, CSS Grid, smooth transitions, and `@media` queries optimized down to 375px mobile screens.
- **Client Logic:** Vanilla JavaScript (ES5/ES6 compatible).
- **Mapping:** [Leaflet.js 1.9.4](https://leafletjs.com) + OpenStreetMap tiles.
- **Data Visualizations:** [Chart.js 4.4](https://www.chartjs.org) (CDN).
- **Image Generation:** Native HTML5 2D Canvas (zero external image libraries).
- **Persistence:** In-memory mock data with `localStorage` persistence under the `sahyog_` namespace.

---

## 🚀 How to Run

No installations, build steps, or dependencies required!

### Method 1 — Direct File Opening
Double click or open `index.html` directly in any web browser:
```
c:\D Drive\shreya\WEB\sahyog\index.html
```

### Method 2 — Local Development Server (Recommended for Map Tiles)
Running over a local HTTP server ensures smooth tile loading from OpenStreetMap:

**With Python:**
```bash
cd "c:\D Drive\shreya\WEB\sahyog"
python -m http.server 8080
```
Then navigate to: [http://localhost:8080](http://localhost:8080)

**With Node.js / npx:**
```bash
cd "c:\D Drive\shreya\WEB\sahyog"
npx serve .
```

---

## 🎮 How to Demo Sahyog

1. **Role Switcher:** Tap **Donor**, **Volunteer**, or **Shelter** in the top navbar on any page to switch perspectives.
2. **Reset & Tour:** Tap **"↺ Reset & Tour"** in the footer bar at any time to restore default mock data and walk through the 4-step guided tour.
3. **List Food:** Open the **Donate** tab, choose *Cooked Meals*, tap *20 plates*, select *2 hrs*, check all 3 hygiene boxes for the *Safety Verified* badge, and tap **Post Surplus**.
4. **Track Live Map:** Open **Live Map** to see the newly created listing appear as an orange/red urgency pin with a ticking spoilage clock.
5. **Claim Delivery:** Switch to **Volunteer** role, click **Claim**, inspect the route and buffer time, step through *Picked Up*, *On the Way* (watch the volunteer marker cycle along the route), and *Delivered*.
6. **Shelter Need:** Switch to **Shelter** role on the Live Map, pick a night shelter, change tonight's need to *60 meals / High*, and submit. Notice the glowing heatmap circle update!
7. **View & Share Impact:** Open **Impact** to see meals saved count up, inspect the 7-day chart, and click **Download Image** to export a verified community summary tile.

---

## ♿ Accessibility & Design System

- **Color Palette:**
  - Background: `#FDFAF5` (warm off-white)
  - Primary Green: `#1F7A4D` (exceeds WCAG AA 4.5:1 contrast against light backgrounds)
  - Primary Dark: `#165C38`
  - Urgency Accent: `#F59E0B` (saffron)
  - Text Primary: `#1A1A1A`
  - Text Muted: `#52525B` (5.5:1+ contrast)
- **Typography:** Inter Google Font with clean font scaling (`clamp`).
- **Keyboard Navigation:**
  - Skip-to-main link (`#skip-to-main`) on every page.
  - Visible focus rings (`:focus-visible { outline: 3px solid #F59E0B; }`).
  - `Escape` dismisses claim drawer, code modal, and guided tour.
- **Mobile Responsive:**
  - Tested on 375px viewports (iPhone SE/standard smartphones).
  - Minimum touch targets of 44×44px.

---

## 📂 Project Structure

```
sahyog/
├── index.html          # Home landing page with live stats and active listings
├── donate.html         # Rapid 30-second surplus donation form
├── map.html            # Split Live Map, claim drawer, and shelter heatmap
├── impact.html         # Impact metrics, 7-day chart, leaderboards, share tile
├── style.css           # Global stylesheet and responsive design system
├── data.js             # Mathura mock dataset & localStorage state helpers
├── app.js              # Shared navbar, 3-way role switcher, toast, and guided demo tour
├── README.md           # Project documentation and demo guide
└── pages/
    ├── home.js         # Home listings renderer and stats animation
    ├── donate.js       # Stepper, tiles, mini-map, and post form logic
    ├── map.js          # Leaflet map pins, filters, spoilage clocks, real-time simulation
    ├── claim-flow.js   # Volunteer 4-step claim drawer, route animation, handoff PIN
    ├── heatmap.js      # Need heatmap overlays, shelter need update form, Smart Match
    └── impact.js       # Animated counters, Chart.js bar chart, native canvas share tile
```
