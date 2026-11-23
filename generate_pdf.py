import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class NotebookPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            self.set_fill_color(31, 122, 77) # #1F7A4D deep green
            self.rect(0, 0, 210, 16, 'F')
            self.set_text_color(255, 255, 255)
            self.set_font('Helvetica', 'B', 10.5)
            self.set_xy(12, 4)
            self.cell(130, 8, 'PROJECT NOTEBOOK SCRIPT: SAHYOG (FOOD REDISTRIBUTION)', new_x=XPos.RIGHT, new_y=YPos.TOP)
            self.set_font('Helvetica', '', 8.5)
            self.cell(56, 8, 'Mathura, UP | Web Tech Project', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='R')
            self.ln(6)
        else:
            self.set_fill_color(248, 250, 248)
            self.rect(0, 0, 210, 10, 'F')
            self.set_text_color(100, 110, 120)
            self.set_font('Helvetica', 'I', 8)
            self.set_xy(12, 1.5)
            self.cell(130, 7, 'Sahyog - Surplus Food Redistribution Platform | Project Script & Notes', new_x=XPos.RIGHT, new_y=YPos.TOP)
            self.cell(56, 7, f'Page {self.page_no()} of 2', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='R')
            self.ln(5)

    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(130, 130, 130)
        self.cell(0, 6, f'Sahyog Project Documentation -- Page {self.page_no()} of 2', new_x=XPos.RIGHT, new_y=YPos.TOP, align='C')

pdf = NotebookPDF(orientation='P', unit='mm', format='A4')
pdf.set_auto_page_break(auto=True, margin=14)
pdf.set_margins(12, 12, 12)
pdf.add_page()

# Title Section
pdf.set_font('Helvetica', 'B', 16)
pdf.set_text_color(31, 122, 77)
pdf.cell(0, 8, 'SAHYOG: Hyper-Local Surplus Food Redistribution', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

pdf.set_font('Helvetica', 'I', 9.5)
pdf.set_text_color(107, 114, 128)
pdf.cell(0, 5, 'Real-Time Spoilage-Aware Food Recovery & Volunteer Logistics Platform (Mathura, UP)', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.ln(2)

# Divider
pdf.set_draw_color(229, 231, 235)
pdf.set_line_width(0.5)
pdf.line(12, pdf.get_y(), 198, pdf.get_y())
pdf.ln(3)

def section_title(title):
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_fill_color(232, 245, 238) # Light green #E8F5EE
    pdf.set_text_color(22, 92, 56)     # Dark green #165C38
    pdf.cell(0, 6, '  ' + title, new_x=XPos.LMARGIN, new_y=YPos.NEXT, fill=True)
    pdf.ln(1.5)

def sub_title(title):
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(26, 26, 26)
    pdf.cell(0, 5, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

def body_text(txt):
    pdf.set_font('Helvetica', '', 8.5)
    pdf.set_text_color(45, 45, 45)
    pdf.multi_cell(0, 4.3, txt)
    pdf.ln(1)

def bullet_point(bold_prefix, txt):
    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.set_text_color(31, 122, 77)
    pdf.cell(4, 4.3, '-', new_x=XPos.RIGHT, new_y=YPos.TOP)
    prefix_len = pdf.get_string_width(bold_prefix) + 1.5
    pdf.cell(prefix_len, 4.3, bold_prefix, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.set_font('Helvetica', '', 8.5)
    pdf.set_text_color(45, 45, 45)
    pdf.multi_cell(0, 4.3, ' ' + txt)
    pdf.ln(0.8)

# 1. Project Overview & Problem Statement
section_title('1. PROJECT OVERVIEW & PROBLEM STATEMENT')
bullet_point('The Paradox:', 'India wastes an estimated 68 million tons of food annually while malnutrition remains persistent. In pilgrimage hubs like Mathura, restaurants, dhabas, sweet shops, and wedding venues generate high volumes of surplus meals daily.')
bullet_point('The Critical Bottleneck:', 'Cooked surplus food perishes rapidly (within 2 to 6 hours). Traditional charity models fail because phone-based coordination and lengthy paperwork take too long, allowing food to spoil before it can be collected.')
bullet_point('The Sahyog Solution:', 'Sahyog is a hyper-local, real-time web application engineered to enable 30-second surplus food listing, live spoilage tracking, and rapid volunteer dispatch to nearby night shelters and community kitchens.')

pdf.ln(1.5)

# 2. Key Modules
section_title('2. CORE MODULES & ARCHITECTURAL FEATURES')

sub_title('A. 30-Second Rapid Donor Flow (One-Screen Listing)')
bullet_point('Category Tiles:', 'Cooked Meals, Bakery, Fresh Produce, Packaged Groceries, and Sweets.')
bullet_point('Quantity & Unit Stepper:', 'Quick-tap chips (10, 20, 50, 100) and +/- stepper with units (Plates, Kg, Packets).')
bullet_point('Perishability Window:', 'Single-tap expiry buttons (1h, 2h, 4h, 6h, 12h) to establish dispatch priority.')
bullet_point('Hygiene Verification:', '3-point mandatory checklist (Freshly prepared, Stored covered, Not previously served) granting a verifiable Safety Verified badge on the live listing.')
bullet_point('Automated Location:', 'Auto-filled donor GPS coordinates with an interactive Leaflet mini-map pin adjuster.')

sub_title('B. Spoilage Clocks & Live Interactive Map')
bullet_point('CARTO Positron Mapping:', 'Integrated Leaflet.js with clean vector-style CARTO tiles for high-contrast viewing.')
bullet_point('Urgency Pin Visualization:', 'Color-coded markers based on remaining shelf life: Green (>3 hrs), Amber (1 to 3 hrs), and Pulsing Red (<1 hr) for immediate volunteer awareness.')
bullet_point('SVG Spoilage Clocks:', 'Feed cards feature dynamic countdown SVG rings updating every second from green to orange to red.')
bullet_point('Real-Time Simulation:', 'Simulates a living ecosystem with incoming mock listings and automated expiry fading.')

sub_title('C. Volunteer Claim-and-Deliver Engine')
bullet_point('4-Stage Tracker:', 'Workflow drawer tracking status: Claimed -> Picked Up -> On the Way -> Delivered.')
bullet_point('Dynamic Route & Buffer:', 'Draws route between donor and destination, computing a Spoilage Safe buffer (e.g., Deliver in 12 min, 48 min buffer).')
bullet_point('Safe Handoff OTP:', 'Generates an instantaneous 4-digit verification code that donors verify at pickup to ensure authentic volunteer transfer.')
bullet_point('Animated Dispatch:', 'Simulated courier marker actively travelling along the delivery polyline.')

sub_title('D. Need Heatmap & Smart Matching Engine')
bullet_point('Shelter Demand Heatmap:', 'Displays night shelters and aid points as soft glowing radius circles sized and colored by need (Low, Medium, High, Critical).')
bullet_point('Shelter Manager Portal:', 'Allows shelter operators to update required meal counts with a single tap.')
bullet_point('Smart Match Algorithm:', 'Multi-criteria evaluation combining Haversine distance, remaining shelf life, and recipient demand to suggest optimal distribution targets.')

# 3. Environmental & Social Impact
section_title('3. IMPACT METRICS & DATA-DRIVEN TRANSPARENCY')
bullet_point('Ecological Formula:', 'Calculates avoided carbon emissions using the benchmark standard: 2.5 kg CO2 avoided per 1 kg food rescued.')
bullet_point('Real-Time Dashboards:', 'Animated count-up counters showing Meals Saved, Kg Rescued, Volunteers Online, and Active Donors.')
bullet_point('Trend Analytics:', '7-day rolling rescue history rendered via Chart.js bar diagrams.')
bullet_point('Gamification & Recognition:', 'Leaderboards featuring milestone badges (First Rescue, 100 Meals Hero, Zero Waste Champion).')
bullet_point('Shareable Impact Tile:', 'Generates an exportable HTML5 summary graphic for social media advocacy.')

# 4. Technical Architecture
section_title('4. TECHNICAL STACK & ARCHITECTURAL HIGHLIGHTS')
bullet_point('Frontend Stack:', 'Pure Semantic HTML5, CSS3 Custom Properties (CSS variables), Vanilla JavaScript (ES6+).')
bullet_point('Zero Build Dependencies:', 'Runs natively in any browser without npm build chains, Webpack, or framework overhead.')
bullet_point('Mapping & Data Visualization:', 'Leaflet.js v1.9.4 with CARTO Positron tiles + Chart.js via high-speed CDN.')
bullet_point('State Management & Offline:', 'Decoupled localStorage persistence layer with automatic stale/expired listing pruning.')
bullet_point('Accessibility & Responsiveness:', 'WCAG AA compliant contrast ratios, full keyboard navigation, aria-labels, and fluid mobile scaling down to 375px.')

# 5. Presentation / Viva Voce Script
section_title('5. NOTEBOOK PRESENTATION SCRIPT (FOR VIVA / DEMO)')
body_text('"Good morning/afternoon. My project is Sahyog, a hyper-local surplus food redistribution web application designed to eliminate urban food waste and hunger in Mathura.')
body_text('The core problem in food charity is not food availability, but speed of coordination. Cooked meals perish within 2 to 6 hours. Sahyog solves this with three key innovations:')
bullet_point('1. Rapid Listing:', 'Donors post food surplus in under 30 seconds with category tiles, quantity steppers, and a 3-point hygiene safety verification.')
bullet_point('2. Spoilage-Aware Logistics:', 'Live Leaflet map with pulsing urgency pins, SVG spoilage countdown clocks, and a Smart Match engine connecting food to the closest high-need shelter.')
bullet_point('3. Verified Volunteer Handoff:', 'Volunteers claim pickups with turn-by-turn route tracking, safety buffer calculations, and a 4-digit handoff OTP.')
body_text('Technically, Sahyog is engineered with pure Vanilla HTML5/CSS3/JavaScript, Leaflet.js, and Chart.js, making it exceptionally lightweight, mobile-responsive, and instantly deployable with zero build friction."')

# 6. Key Viva Questions & Answers
section_title('6. KEY VIVA QUESTIONS & SHORT ANSWERS')
bullet_point('Q1: How does Sahyog prevent food contamination or stale delivery?', 'Through the mandatory 3-point Hygiene Checklist before listing, real-time SVG countdown clocks, and the Spoilage Safe buffer calculation during volunteer routing.')
bullet_point('Q2: Why use Vanilla JavaScript instead of React or Angular?', 'To ensure zero build setup, ultra-fast initial load times on mobile 4G networks, and effortless deployment on static edge hosts like Vercel or GitHub Pages.')
bullet_point('Q3: What algorithm powers the Smart Match feature?', 'It balances Haversine geographic distance, listing shelf life, and recipient shelter priority (Critical/High/Medium/Low) to suggest the highest-impact destination.')

output_path = 'c:/D Drive/shreya/WEB/sahyog/Sahyog_Project_Notebook_Script.pdf'
pdf.output(output_path)
print(f'Successfully generated PDF at: {output_path}')
print(f'Total pages: {pdf.page_no()}')
