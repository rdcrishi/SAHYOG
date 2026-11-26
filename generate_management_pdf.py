import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class ManagementPitchPDF(FPDF):
    def header(self):
        self.set_fill_color(22, 92, 56) # Deep forest green
        self.rect(0, 0, 210, 16, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 10)
        self.set_xy(12, 4)
        self.cell(125, 8, 'SAHYOG: MANAGEMENT EVALUATION, PITCH & VIVA GUIDE', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.set_font('Helvetica', 'B', 8.5)
        self.cell(61, 8, 'LIVE: sahyog-rdcrishi.vercel.app', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='R')
        self.ln(6)

    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(130, 130, 130)
        self.cell(110, 6, 'Sahyog Project -- Social Entrepreneurship & Operations Management Pitch Guide', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.cell(76, 6, f'Page {self.page_no()}', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='R')

pdf = ManagementPitchPDF(orientation='P', unit='mm', format='A4')
pdf.set_auto_page_break(auto=True, margin=14)
pdf.set_margins(12, 12, 12)
pdf.add_page()

# Title
pdf.set_font('Helvetica', 'B', 15)
pdf.set_text_color(22, 92, 56)
pdf.cell(0, 7.5, 'Sahyog: Social Impact Pitch & Management Evaluation Guide', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

pdf.set_font('Helvetica', 'I', 9)
pdf.set_text_color(80, 80, 80)
pdf.cell(0, 5, 'Strategic Management, Operations Logistics, and Social Entrepreneurship Defense', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

# URL box
pdf.ln(1)
pdf.set_fill_color(240, 249, 244)
pdf.set_draw_color(31, 122, 77)
pdf.set_line_width(0.3)
pdf.rect(12, pdf.get_y(), 186, 11, 'DF')
pdf.set_xy(15, pdf.get_y() + 1.5)
pdf.set_font('Helvetica', 'B', 8.2)
pdf.set_text_color(22, 92, 56)
pdf.cell(28, 4, 'Live Deployed URL:', new_x=XPos.RIGHT, new_y=YPos.TOP)
pdf.set_font('Helvetica', '', 8.2)
pdf.set_text_color(20, 80, 160)
pdf.cell(66, 4, 'https://sahyog-rdcrishi.vercel.app', new_x=XPos.RIGHT, new_y=YPos.TOP)
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
    pdf.set_x(12)
    pdf.set_font('Helvetica', '', 8.2)
    pdf.set_text_color(45, 45, 45)
    pdf.multi_cell(186, 4, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(0.8)

def bullet(bold_txt, detail):
    pdf.set_x(12)
    pdf.set_font('Helvetica', 'B', 8.2)
    pdf.set_text_color(31, 122, 77)
    pdf.cell(4, 4, '-', new_x=XPos.RIGHT, new_y=YPos.TOP)
    w = pdf.get_string_width(bold_txt) + 1.5
    if w > 40:
        pdf.cell(182, 4, bold_txt, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_x(16)
        pdf.set_font('Helvetica', '', 8.2)
        pdf.set_text_color(45, 45, 45)
        pdf.multi_cell(182, 3.9, detail, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    else:
        pdf.cell(w, 4, bold_txt, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font('Helvetica', '', 8.2)
        pdf.set_text_color(45, 45, 45)
        rem_w = 186 - 4 - w
        pdf.multi_cell(rem_w, 3.9, ' ' + detail, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(0.6)

def qna(q, a):
    pdf.set_x(12)
    pdf.set_font('Helvetica', 'B', 8.4)
    pdf.set_text_color(160, 40, 15) # Rust red for question
    pdf.multi_cell(186, 4.1, 'Q: ' + q, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(12)
    pdf.set_font('Helvetica', '', 8.2)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(186, 4, 'Model Answer: ' + a, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1.2)

# 1. Social Core
sec('1. THE CORE SOCIAL MOTIVE & STRATEGIC PROBLEM DEFINITION')
p('The driving purpose of Sahyog is to eliminate the severe socioeconomic paradox occurring daily in Indian cities: massive edible food wastage occurring simultaneously with acute urban hunger and malnutrition. In educational and commercial centers like Kota, hundreds of student messes, dhabas, caterers, and banquet halls discard nutritious surplus portions every night. At the exact same time, nearby night shelters (Rain Baseras) and community kitchens struggle with severe meal shortfalls.')
p('From a Management & Systems perspective, this is neither a food deficit nor an empathy failure. It is an Operations & Coordination Breakdown: cooked surplus meals perish in 2 to 6 hours. Traditional charity relies on manual calls, delayed scheduling, and opaque logistics. Sahyog applies hyper-local agile operations, live spoilage clocks, and trust engineering to bridge supply and demand in under 45 minutes.')

# 2. Executive Pitch Script
sec('2. EXECUTIVE PITCH SCRIPT (FOR FACULTY & EVALUATION PANELS)')
p('Opening Hook (30s): "Respected Professor and Panel, 68 million tons of food is wasted annually in India while millions sleep hungry. In Kota, hundreds of hostel kitchens and restaurants throw away surplus meals every evening. Why? Because cooked food has a strict 2-to-6 hour perishability window, and traditional charities simply cannot coordinate pickups in time. Sahyog solves this with three managerial innovations:"')
bullet('1. Ultra-Low Friction Donor Onboarding:', 'A 30-second rapid listing engine with mandatory 3-point hygiene verification giving donors legal confidence and a Safety Verified badge.')
bullet('2. Spoilage-Aware Routing & Smart Matching:', 'A live Leaflet map with urgency pins (Green/Amber/Pulsing Red) paired with a heuristic matching algorithm that routes food to the highest-need shelters.')
bullet('3. Zero-Fraud Safe Handoff Protocol:', 'A 4-digit OTP exchange between donor and verified volunteer, ensuring reliable custody and transit.')

# 3. Operations & Management Pillars
sec('3. CORE MANAGEMENT PILLARS EMBEDDED IN SAHYOG')
bullet('A. Supply Chain Velocity (Lead Time Reduction):', 'Replaces multi-hour telephone delays with an instantaneous push broadcast across active neighborhood volunteer networks.')
bullet('B. Quality Control & Risk Mitigation:', 'Enforces hygiene screening at the point of origin, displays real-time countdown spoilage rings, and calculates a Spoilage Safe buffer before dispatch.')
bullet('C. Demand-Pull Operations (JIT Model):', 'Rather than dumping random supplies, shelters declare tonight\'s exact meal deficit and priority tier on a glowing live heatmap.')
bullet('D. Environmental & Social Governance (ESG) Metrics:', 'Quantifies avoided carbon emissions (2.5 kg CO2 per kg food rescued) and produces automated verified impact dashboards.')

# 4. Rigorous Management Viva Questions & Model Answers
sec('4. RIGOROUS MANAGEMENT VIVA QUESTIONS & MODEL ANSWERS')

qna('As a manager, how do you handle food safety liability if a beneficiary falls sick from donated food?',
    'We adopt a two-tier defense: First, operational preventative controls via the mandatory 3-point hygiene checklist (freshly prepared, covered, unserved) and strict perishability time-caps. Second, alignment with India\'s FSSAI "Save Food, Share Food" initiative and the Good Samaritan legal protection, which insulates bona fide donors from liability provided basic safety protocols are maintained. Furthermore, the 4-digit OTP ensures unbroken chain-of-custody tracking.')

qna('What is the incentive for busy restaurant and mess managers to take time to post on Sahyog?',
    'We reduced transaction costs to near-zero: a single-screen interface that takes under 30 seconds with quick steppers. On the value side, Sahyog provides tangible CSR and brand reputation: our Impact Dashboard awards verified donor badges (Zero Waste Champion, Community Star) and generates downloadable social media summary tiles that businesses use for customer goodwill.')

qna('How do you manage the "Volunteer Drop-off" problem where volunteers are unavailable during odd hours?',
    'Sahyog uses urgency visual cues (pulsing red pins under 1 hour) that trigger acute psychological urgency. Additionally, because the platform is hyper-local (within 2-3 km radii in Kota), trips take under 15 minutes. Future iterations incorporate micro-incentives (recognition leaderboards, college volunteer social credits, and sponsored fuel vouchers from partner CSR funds).')

qna('How does Sahyog achieve financial sustainability without charging impoverished shelters or donors?',
    'The tech architecture was intentionally built with zero marginal operating cost: vanilla HTML/CSS/JS, free OpenStreetMap tiles, and serverless hosting on Vercel. For scaling, our revenue model targets Corporate Social Responsibility (CSR) grants from local corporations, sponsored corporate donor leaderboards, and municipal partnerships with urban local bodies (Kota Municipal Corporation).')

qna('How does your Smart Match algorithm prevent "winner-takes-all" where one popular shelter gets all the food?',
    'Our heuristic incorporates dynamic demand thresholds. Once a shelter\'s nightly meal target is met, its glowing need radius transitions from Critical (Red) to Satisfied, diminishing its attraction weight in the Smart Match scoring function and routing subsequent food to secondary shelters.')

qna('What are the key KPIs (Key Performance Indicators) you would track as the platform manager?',
    '1. Average Rescue Cycle Time (Target: <45 min from post to drop). 2. Food Spoilage Rate (Target: <3% expired before claim). 3. Volunteer Fulfillment Rate (Listings claimed vs total posted). 4. Meal Deficit Coverage Ratio at partner shelters. 5. Cumulative Avoided Carbon Emissions (kg CO2).')

out_path = 'c:/D Drive/shreya/WEB/sahyog/Sahyog_Management_Pitch_Viva.pdf'
pdf.output(out_path)
print(f'Successfully generated Management Pitch & Viva PDF at: {out_path} ({pdf.page_no()} pages)')
