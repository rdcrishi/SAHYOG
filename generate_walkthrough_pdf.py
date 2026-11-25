import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class WalkthroughPDF(FPDF):
    def header(self):
        self.set_fill_color(31, 122, 77) # #1F7A4D primary brand green
        self.rect(0, 0, 210, 16, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 10)
        self.set_xy(12, 4)
        self.cell(125, 8, 'SAHYOG: LIVE WALKTHROUGH & PRESENTATION GUIDE', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.set_font('Helvetica', 'B', 8.5)
        self.cell(61, 8, 'LIVE: sahyog-rdcrishi.vercel.app', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='R')
        self.ln(6)

    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(130, 130, 130)
        self.cell(100, 6, 'Sahyog Project Presentation Guide | Kota, Rajasthan', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.cell(86, 6, f'Page {self.page_no()}', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='R')

pdf = WalkthroughPDF(orientation='P', unit='mm', format='A4')
pdf.set_auto_page_break(auto=True, margin=14)
pdf.set_margins(12, 12, 12)
pdf.add_page()

# Title banner
pdf.set_font('Helvetica', 'B', 15)
pdf.set_text_color(31, 122, 77)
pdf.cell(0, 7.5, 'Sahyog Project Walkthrough & Teacher/Team Demo Script', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

pdf.set_font('Helvetica', 'I', 9)
pdf.set_text_color(80, 80, 80)
pdf.cell(0, 5, 'Hyper-Local Spoilage-Aware Surplus Food Recovery Platform (Kota, Rajasthan)', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

# URL callout box
pdf.ln(1.5)
pdf.set_fill_color(240, 249, 244)
pdf.set_draw_color(31, 122, 77)
pdf.set_line_width(0.4)
pdf.rect(12, pdf.get_y(), 186, 12, 'DF')
pdf.set_xy(15, pdf.get_y() + 1.8)
pdf.set_font('Helvetica', 'B', 8.5)
pdf.set_text_color(22, 92, 56)
pdf.cell(42, 4.2, 'Deployed Website URL:', new_x=XPos.RIGHT, new_y=YPos.TOP)
pdf.set_font('Helvetica', '', 8.5)
pdf.set_text_color(20, 80, 160)
pdf.cell(70, 4.2, 'https://sahyog-rdcrishi.vercel.app', new_x=XPos.RIGHT, new_y=YPos.TOP)
pdf.set_font('Helvetica', 'B', 8.5)
pdf.set_text_color(22, 92, 56)
pdf.cell(24, 4.2, 'GitHub Repo:', new_x=XPos.RIGHT, new_y=YPos.TOP)
pdf.set_font('Helvetica', '', 8.5)
pdf.set_text_color(20, 80, 160)
pdf.cell(50, 4.2, 'https://github.com/rdcrishi/SAHYOG', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.set_xy(12, pdf.get_y() + 6)

def section_hdr(title):
    pdf.set_font('Helvetica', 'B', 9.5)
    pdf.set_fill_color(232, 245, 238)
    pdf.set_text_color(22, 92, 56)
    pdf.cell(0, 5.5, '  ' + title, new_x=XPos.LMARGIN, new_y=YPos.NEXT, fill=True)
    pdf.ln(1.5)

def step_hdr(step_num, title, page_name):
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(26, 26, 26)
    pdf.cell(0, 4.8, f'{step_num}. {title} [{page_name}]', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

def say_box(text):
    pdf.set_font('Helvetica', 'I', 8.2)
    pdf.set_text_color(55, 65, 81)
    pdf.multi_cell(0, 3.9, 'What to Say: "' + text + '"')
    pdf.ln(0.8)

def action_bullet(label, detail):
    pdf.set_font('Helvetica', 'B', 8.2)
    pdf.set_text_color(31, 122, 77)
    pdf.cell(4, 4, '-', new_x=XPos.RIGHT, new_y=YPos.TOP)
    w = pdf.get_string_width(label) + 1.2
    pdf.cell(w, 4, label, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.set_font('Helvetica', '', 8.2)
    pdf.set_text_color(45, 45, 45)
    pdf.multi_cell(0, 4, ' ' + detail)
    pdf.ln(0.6)

# 1. Opening Hook
section_hdr('1. OPENING PITCH (45 SECONDS - BEFORE TOUCHING SCREEN)')
say_box('Good morning Ma\'am/Sir and teammates. Our project is Sahyog, a hyper-local surplus food redistribution platform engineered for cities like Kota. India loses millions of tons of edible food while night shelters struggle daily. The core bottleneck is not supply or empathy; it is speed of coordination. Cooked meals perish in 2 to 6 hours. Sahyog solves this with three pillars: 30-second rapid listing, real-time spoilage clocks, and verified volunteer handoffs. Here is how it functions live.')
pdf.ln(1.5)

# 2. Live Demo Steps
section_hdr('2. STEP-BY-STEP LIVE DEMONSTRATION WALKTHROUGH')

step_hdr('Step 1', 'Landing Page & Live Community Activity', 'index.html')
action_bullet('Show on screen:', 'Point to Kota, Rajasthan header, live animated stats strip (Meals Saved, Active Listings, Volunteers Online), and 3-way Role Switcher (Donor, Volunteer, Shelter).')
say_box('Here on the home page, community members see live rescue stats updated dynamically. Notice our top 3-way Role Switcher: instead of requiring three logins, our interface instantaneously adapts based on who is using it.')

step_hdr('Step 2', '30-Second Rapid Donor Flow', 'donate.html')
action_bullet('Action:', 'Tap "+ Post Surplus Food" or "Donate" in bottom navigation.')
action_bullet('Show on screen:', 'Tap "Cooked Meals" tile -> tap "+20 plates" stepper -> select "2 hrs" shelf-life chip -> check all 3 hygiene boxes (Safety Verified badge appears) -> show pre-filled Kota GPS mini-map -> tap "Post Surplus".')
say_box('A busy dhaba manager will not fill out complex forms. In 30 seconds: they pick a food category, tap quantity, select an expiry window, complete a 3-point hygiene verification for a Safety Verified badge, and publish.')

step_hdr('Step 3', 'Urgency Pins & Spoilage Clocks', 'map.html')
action_bullet('Action:', 'Open Live Map page. Point to colored map pins and right-side feed.')
action_bullet('Show on screen:', 'Pin Legend (Green >3h, Amber 1-3h, Pulsing Red <1h). Highlight circular SVG countdown rings in feed cards ticking down in real time. Click filter chips (Cooked, Groceries, Under 1 hr).')
say_box('On the live map, pins reflect urgency. If shelf life drops under 1 hour, pins pulse red to prioritize immediate volunteer rescue. Each feed card features dynamic SVG countdown clocks.')

step_hdr('Step 4', 'Volunteer Claim & Safe Handoff Protocol', 'map.html')
action_bullet('Action:', 'In Volunteer role, click "Claim" on any active listing.')
action_bullet('Show on screen:', 'Claim drawer slides up -> point to route line between restaurant and shelter -> highlight "Spoilage Safe Buffer" calculation -> open 4-digit Safe Handoff OTP -> step through Picked Up -> watch animated courier move -> Confirm Delivery.')
say_box('When a volunteer claims a pickup, the algorithm checks the Spoilage Safe buffer. To guarantee integrity, a 4-digit OTP code ensures authorized transfer from the donor.')

step_hdr('Step 5', 'Shelter Manager View & Live Demand Heatmap', 'map.html')
action_bullet('Action:', 'Switch top role switcher to "Shelter". Notice feed turns into Shelter Manager Portal.')
action_bullet('Show on screen:', 'Select "Chambal Kinara Night Shelter" -> set needed meals to 60 with "Critical" urgency -> click "Update Tonight\'s Need" -> see glowing radius circle update on map -> switch to Volunteer and click "Smart Match".')
say_box('Shelters do not search for food; they declare their nightly need. When updated, a glowing demand heatmap alerts volunteers. The Smart Match algorithm calculates distance, shelf life, and urgency to pair listings with the highest-need shelter.')

step_hdr('Step 6', 'Impact Dashboard & Social Proof', 'impact.html')
action_bullet('Action:', 'Open Impact page. Show 7-day Chart.js rescue chart, donor/volunteer leaderboards, and HTML5 Canvas summary tile.')
say_box('Every rescue saves 2.5 kg CO2 per kg food rescued. Volunteers can download verified summary cards to share on social media.')
pdf.ln(1.5)

# 3. Technical Highlights
section_hdr('3. TECHNICAL ARCHITECTURE (FOR EXAMINERS & TEACHERS)')
action_bullet('Zero-Build Vanilla Stack:', 'Semantic HTML5, CSS3 Custom Properties, and Vanilla ES6+ JS. No node_modules, webpack, or build lag. Instant mobile execution.')
action_bullet('Mapping Engine:', 'Leaflet.js v1.9.4 + OpenStreetMap tiles. Zero external proprietary API key cost.')
action_bullet('State Persistence:', 'Namespaced localStorage with automated stale/expired listing eviction and auto-reseeding for Kota coordinates.')
action_bullet('Responsive & Accessible:', 'WCAG AA 4.5:1 contrast, fluid clamp typography, full keyboard navigation, down to 375px mobile screens.')
pdf.ln(1.5)

# 4. Viva Voce Q&A
section_hdr('4. ANTICIPATED VIVA QUESTIONS & INSTANT ANSWERS')
action_bullet('Q: How is food contamination prevented?', 'A: Mandatory 3-point hygiene verification, real-time SVG countdown clocks, and travel buffer checks before dispatch.')
action_bullet('Q: Why Vanilla JS over React/Angular?', 'A: Zero build dependencies, 1-second load time on low-cost mobile devices, and seamless edge hosting on Vercel.')
action_bullet('Q: How does Smart Match work?', 'A: A heuristic weighing Haversine distance, remaining shelf life, and shelter demand priority (Critical/High/Medium/Low).')
action_bullet('Q: What prevents fake pickups?', 'A: A verified 4-digit handoff code shown on the volunteer\'s phone and confirmed by the donor.')

out_path = 'c:/D Drive/shreya/WEB/sahyog/Sahyog_Walkthrough_Guide.pdf'
pdf.output(out_path)
print(f'Successfully generated Walkthrough Guide at {out_path} ({pdf.page_no()} pages)')
