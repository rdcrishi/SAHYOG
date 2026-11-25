import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class ProjectFilePDF(FPDF):
    def header(self):
        self.set_fill_color(31, 122, 77)
        self.rect(0, 0, 210, 15, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 10)
        self.set_xy(12, 3.5)
        self.cell(120, 8, 'PROJECT FILE RECORD: SAHYOG FOOD REDISTRIBUTION', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.set_font('Helvetica', '', 8.5)
        self.cell(66, 8, 'Web Technology & Social Computing Project', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='R')
        self.ln(5)

    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(130, 130, 130)
        self.cell(100, 6, 'Sahyog Project File Record -- Deployed at: sahyog-rdcrishi.vercel.app', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.cell(86, 6, f'Page {self.page_no()}', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='R')

pdf = ProjectFilePDF(orientation='P', unit='mm', format='A4')
pdf.set_auto_page_break(auto=True, margin=14)
pdf.set_margins(12, 12, 12)
pdf.add_page()

# Title Section
pdf.set_font('Helvetica', 'B', 15)
pdf.set_text_color(31, 122, 77)
pdf.cell(0, 7.5, 'PROJECT REPORT: SAHYOG (HYPER-LOCAL FOOD RESCUE)', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

pdf.set_font('Helvetica', 'I', 9)
pdf.set_text_color(80, 80, 80)
pdf.cell(0, 5, 'A Spoilage-Aware Urban Food Redistribution System (Kota, Rajasthan)', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

# Project Metadata Box
pdf.ln(1)
pdf.set_fill_color(248, 250, 248)
pdf.set_draw_color(210, 225, 215)
pdf.set_line_width(0.3)
pdf.rect(12, pdf.get_y(), 186, 11, 'DF')
pdf.set_xy(15, pdf.get_y() + 1.5)
pdf.set_font('Helvetica', 'B', 8.2)
pdf.set_text_color(22, 92, 56)
pdf.cell(30, 4, 'Live Deployed URL:', new_x=XPos.RIGHT, new_y=YPos.TOP)
pdf.set_font('Helvetica', '', 8.2)
pdf.set_text_color(20, 80, 160)
pdf.cell(64, 4, 'https://sahyog-rdcrishi.vercel.app', new_x=XPos.RIGHT, new_y=YPos.TOP)
pdf.set_font('Helvetica', 'B', 8.2)
pdf.set_text_color(22, 92, 56)
pdf.cell(24, 4, 'Source Code:', new_x=XPos.RIGHT, new_y=YPos.TOP)
pdf.set_font('Helvetica', '', 8.2)
pdf.set_text_color(20, 80, 160)
pdf.cell(60, 4, 'https://github.com/rdcrishi/SAHYOG', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.set_xy(12, pdf.get_y() + 5.5)

def sec(title):
    pdf.set_font('Helvetica', 'B', 9.5)
    pdf.set_fill_color(232, 245, 238)
    pdf.set_text_color(22, 92, 56)
    pdf.cell(0, 5.5, '  ' + title, new_x=XPos.LMARGIN, new_y=YPos.NEXT, fill=True)
    pdf.ln(1.5)

def sub(title):
    pdf.set_font('Helvetica', 'B', 8.8)
    pdf.set_text_color(26, 26, 26)
    pdf.cell(0, 4.5, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

def p(text):
    pdf.set_font('Helvetica', '', 8.2)
    pdf.set_text_color(45, 45, 45)
    pdf.multi_cell(0, 4, text)
    pdf.ln(0.8)

def bullet(bold_txt, detail):
    pdf.set_font('Helvetica', 'B', 8.2)
    pdf.set_text_color(31, 122, 77)
    pdf.cell(4, 4, '-', new_x=XPos.RIGHT, new_y=YPos.TOP)
    w = pdf.get_string_width(bold_txt) + 1.2
    pdf.cell(w, 4, bold_txt, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.set_font('Helvetica', '', 8.2)
    pdf.set_text_color(45, 45, 45)
    pdf.multi_cell(0, 4, ' ' + detail)
    pdf.ln(0.6)

# 1. Abstract
sec('1. ABSTRACT & PROJECT SUMMARY')
p('Urban food waste and malnutrition coexist as a stark paradox across Indian cities. In educational and commercial hubs like Kota, Rajasthan, restaurants, dhabas, sweet shops, and student hostel messes produce substantial volumes of clean surplus food each day. Simultaneously, local night shelters and community kitchens experience acute food shortages. Conventional food donation workflows rely on phone calls and slow manual logistics, causing hot cooked food (which perishes within 2 to 6 hours) to spoil before rescue. Sahyog is a zero-build, client-side web application that solves this coordination bottleneck through 30-second rapid listing, dynamic urgency-based Leaflet mapping, real-time SVG countdown clocks, a 4-digit Safe Handoff verification protocol, and demand-driven shelter heatmaps.')

# 2. Problem Statement
sec('2. PROBLEM STATEMENT & MOTIVATION')
bullet('The Urban Paradox:', 'India wastes an estimated 68 million metric tons of food annually, even as community shelters face daily meal shortfalls. In Kota, hundreds of student messes and banquet halls dispose of surplus portions nightly.')
bullet('Perishability Window:', 'Unlike packaged groceries, cooked meals must be redistributed within a strict 2 to 6 hour window. Standard NGO collection pipelines cannot mobilize quickly enough.')
bullet('Lack of Trust & Verification:', 'Donors worry about liability and food safety, while recipient shelters fear receiving spoiled or unhygienic donations.')
bullet('The Sahyog Objective:', 'To create an ultra-fast, zero-overhead digital bridge enabling instant food surplus posting, volunteer routing, and demand matching with full hygiene and handoff verification.')

# 3. System Architecture & Key Modules
sec('3. SYSTEM ARCHITECTURE & CORE MODULES')

sub('Module 1: Rapid 30-Second Donor Listing Engine (donate.html)')
p('Designed for fast-paced commercial kitchens where staff cannot navigate multi-step forms. Donors select a food category tile (Cooked, Bakery, Produce, Packaged, Sweets), tap quantity quick-chips (10, 20, 50, 100) or +/- steppers, select a perishability window (1h, 2h, 4h, 6h, 12h), and complete a 3-point hygiene verification checklist. This generates a verifiable "Safety Verified" credential and pins their coordinates on an interactive mini-map.')

sub('Module 2: Live Urgency Map & Spoilage Tracking (map.html)')
p('Built on Leaflet.js v1.9.4 and OpenStreetMap tiles centered on Kota (25.1760 N, 75.8400 E). Listings are categorized into three visual urgency tiers: Green (>3 hours), Amber (1 to 3 hours), and Pulsing Red (<1 hour). Each feed item features a circular SVG progress ring updating every second as food approaches expiry.')

sub('Module 3: Volunteer Logistics & Safe Handoff Verification')
p('A 4-step slide-up workflow drawer (Claimed -> Picked Up -> On the Way -> Delivered). Calculates a Spoilage Safe travel buffer comparing remaining shelf life against transit time. Generates a 4-digit Safe Handoff Code verified between donor and volunteer to eliminate fraudulent or mistaken pickups.')

sub('Module 4: Demand Heatmap & Smart Matching Algorithm')
p('Night shelter operators log tonight\'s required meal count and urgency tier (Low, Medium, High, Critical). The system renders soft glowing radial heatmaps over Kota shelters. The Smart Match engine evaluates distance, urgency, and recipient demand to suggest the optimal delivery destination.')

sub('Module 5: Social & Environmental Impact Dashboard (impact.html)')
p('Tracks cumulative meals rescued, kilograms diverted, and avoided carbon emissions (standard: 2.5 kg CO2 avoided per 1 kg food rescued). Renders rolling 7-day analytics via Chart.js and generates exportable summary graphics via HTML5 Canvas.')

# 4. Mathematical Formulations & Heuristics
sec('4. MATHEMATICAL FORMULATIONS & LOGICAL MODELS')
bullet('1. SVG Spoilage Offset:', 'Clock Offset = 2 * pi * r * (1 - (ExpiresAt - CurrentTime) / TotalWindow). Line stroke shifts from green (#1F7A4D) to amber (#F59E0B) to red (#EF4444).')
bullet('2. Spoilage Safe Buffer:', 'Buffer (mins) = Remaining Shelf Life - Estimated Transit Time. If Buffer > 20 mins, status = Spoilage Safe; otherwise marked Critical Rush.')
bullet('3. Smart Match Score:', 'Score = (Weight_Demand * DemandTier) + (Weight_Urgency / ShelfLife) - (Weight_Dist * HaversineDistance). Matches listings to the shelter where utility is maximized.')
bullet('4. Ecological Impact:', 'CO2 Avoided (kg) = Total Rescued Food (kg) * 2.5 kg CO2/kg.')

# 5. Technology Stack Rationale
sec('5. TECHNOLOGY STACK & DESIGN RATIONALE')
bullet('Pure Vanilla HTML5 / CSS3 / ES6+:', 'Zero build chains (no npm, webpack, or Babel). Instant execution on budget mobile browsers with ultra-low latency.')
bullet('Leaflet.js & OpenStreetMap:', 'Lightweight open-source mapping requiring zero external proprietary API keys or paid quotas.')
bullet('LocalStorage Persistence:', 'Client-side state management with automatic stale/expired listing eviction and geographic validation.')
bullet('WCAG AA Accessibility:', 'Fluid clamp() font scaling, minimum 44x44px touch targets, skip navigation links, and full keyboard focus rings.')

# 6. Conclusion
sec('6. CONCLUSION & FUTURE SCOPE')
p('Sahyog demonstrates that urban food recovery is fundamentally an information routing challenge. By pairing hyper-local spatial mapping with spoilage countdown clocks and verified volunteer handoffs, surplus meals can be rescued and delivered in under 45 minutes. Future enhancements include WebSockets/Firebase push alerts, automated SMS notifications for non-smartphone shelter coordinators, and route batching for multi-donor pickups.')

out_path = 'c:/D Drive/shreya/WEB/sahyog/Sahyog_Project_File_Writeup.pdf'
pdf.output(out_path)
print(f'Successfully generated Project File Writeup at {out_path} ({pdf.page_no()} pages)')
