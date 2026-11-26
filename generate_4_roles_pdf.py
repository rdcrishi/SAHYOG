import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class ManagementRolesPDF(FPDF):
    def header(self):
        self.set_fill_color(22, 92, 56) # Deep forest green #165C38
        self.rect(0, 0, 210, 16, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 10)
        self.set_xy(12, 4)
        self.cell(125, 8, 'SAHYOG: 4-PERSON MANAGEMENT TEAM PRESENTATION GUIDE', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.set_font('Helvetica', 'B', 8.5)
        self.cell(61, 8, 'LIVE: sahyog-rdcrishi.vercel.app', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='R')
        self.ln(6)

    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(130, 130, 130)
        self.cell(110, 6, 'Sahyog: Addressing Urban Food Waste & Hunger | Management Defense Guide', new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.cell(76, 6, f'Page {self.page_no()}', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='R')

pdf = ManagementRolesPDF(orientation='P', unit='mm', format='A4')
pdf.set_auto_page_break(auto=True, margin=14)
pdf.set_margins(12, 12, 12)
pdf.add_page()

# Title banner
pdf.set_font('Helvetica', 'B', 14.5)
pdf.set_text_color(22, 92, 56)
pdf.cell(0, 7.5, 'Sahyog: 4-Role Management Team Presentation & Viva Script', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

pdf.set_font('Helvetica', 'I', 8.8)
pdf.set_text_color(80, 80, 80)
pdf.cell(0, 4.8, 'Designed for Social Problem Evaluation & Management Defense (Faculty Panel)', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

# URL box
pdf.ln(1)
pdf.set_fill_color(240, 249, 244)
pdf.set_draw_color(31, 122, 77)
pdf.set_line_width(0.3)
pdf.rect(12, pdf.get_y(), 186, 11, 'DF')
pdf.set_xy(15, pdf.get_y() + 1.5)
pdf.set_font('Helvetica', 'B', 8)
pdf.set_text_color(22, 92, 56)
pdf.cell(28, 4, 'Live Deployed URL:', new_x=XPos.RIGHT, new_y=YPos.TOP)
pdf.set_font('Helvetica', '', 8)
pdf.set_text_color(20, 80, 160)
pdf.cell(66, 4, 'https://sahyog-rdcrishi.vercel.app', new_x=XPos.RIGHT, new_y=YPos.TOP)
pdf.set_font('Helvetica', 'B', 8)
pdf.set_text_color(22, 92, 56)
pdf.cell(24, 4, 'Source Code:', new_x=XPos.RIGHT, new_y=YPos.TOP)
pdf.set_font('Helvetica', '', 8)
pdf.set_text_color(20, 80, 160)
pdf.cell(60, 4, 'https://github.com/rdcrishi/SAHYOG', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.set_xy(12, pdf.get_y() + 5.5)

def sec(title):
    pdf.set_x(12)
    pdf.set_font('Helvetica', 'B', 9.2)
    pdf.set_fill_color(232, 245, 238)
    pdf.set_text_color(22, 92, 56)
    pdf.cell(186, 5.5, '  ' + title, new_x=XPos.LMARGIN, new_y=YPos.NEXT, fill=True)
    pdf.ln(1.5)

def role_box(role_num, title, member_name):
    pdf.set_x(12)
    pdf.set_fill_color(245, 248, 245)
    pdf.set_draw_color(31, 122, 77)
    pdf.set_line_width(0.4)
    pdf.rect(12, pdf.get_y(), 186, 7.5, 'DF')
    pdf.set_xy(14, pdf.get_y() + 1.2)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(22, 92, 56)
    pdf.cell(182, 5, f'PERSON {role_num}: {title} ({member_name})', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1.5)

def sub_label(lbl):
    pdf.set_x(12)
    pdf.set_font('Helvetica', 'B', 8.4)
    pdf.set_text_color(180, 80, 20)
    pdf.cell(186, 4.2, lbl, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

def p(text):
    pdf.set_x(12)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(45, 45, 45)
    pdf.multi_cell(186, 3.8, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(0.6)

def bullet(bold_txt, detail):
    pdf.set_x(12)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(31, 122, 77)
    pdf.cell(4, 3.8, '-', new_x=XPos.RIGHT, new_y=YPos.TOP)
    w = pdf.get_string_width(bold_txt) + 1.5
    if w > 42:
        pdf.cell(182, 3.8, bold_txt, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_x(16)
        pdf.set_font('Helvetica', '', 8)
        pdf.set_text_color(45, 45, 45)
        pdf.multi_cell(182, 3.8, detail, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    else:
        pdf.cell(w, 3.8, bold_txt, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font('Helvetica', '', 8)
        pdf.set_text_color(45, 45, 45)
        rem_w = 186 - 4 - w
        pdf.multi_cell(rem_w, 3.8, ' ' + detail, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(0.5)

def say(text):
    pdf.set_x(12)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(55, 65, 81)
    pdf.multi_cell(186, 3.7, 'Presentation Script: "' + text + '"', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1)

def qna(q, a):
    pdf.set_x(12)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(160, 40, 15)
    pdf.multi_cell(186, 3.8, 'Teacher Q: ' + q, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_x(12)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(186, 3.8, 'Model Answer: ' + a, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1.2)

# --- PERSON 1 ---
role_box('1', 'PROJECT LEAD & SOCIAL RESEARCH SPECIALIST', 'You')
sub_label('What I Did (Management & Research Contribution):')
bullet('Identified Social Paradox in Kota:', 'Investigated how hundreds of coaching student hostel messes, dhabas, and caterers discard tons of clean food nightly while local night shelters (Rain Baseras) face severe meal deficits.')
bullet('Ground Interviews & Root Cause:', 'Discovered that food waste is not an empathy failure; it is a perishability and lead-time failure. Cooked meals perish in 2 to 6 hours. Traditional charities take 6 to 12 hours to respond.')
bullet('System Architecture:', 'Conceptualized Sahyog as an agile, hyper-local digital bridge connecting Donors, Volunteers, and Shelters in under 45 minutes.')

sub_label('What to Show on Screen:')
p('Open index.html -> Show Kota context -> Explain live animated stats strip -> Point to top 3-way Role Switcher (Donor, Volunteer, Shelter) explaining stakeholder adaptiveness.')

sub_label('What to Say to Teacher:')
say('Respected Ma\'am, our project addresses a severe social crisis in Indian cities: the paradox of massive food waste occurring alongside urban hunger. In Kota, hundreds of hostel messes prepare bulk meals and dump edible surplus every night. Kitchen managers told us they cannot donate because cooked food spoils in 2 to 6 hours and traditional charities take hours to coordinate. We framed this not as a charity problem, but as an Operations & Supply Chain breakdown. Sahyog compresses the rescue loop to under 45 minutes.')

sub_label('Targeted Management Viva Q&A:')
qna('Why is technology needed here? Why can\'t mess managers just call an NGO?',
    'Phone-based coordination suffers from high friction: busy kitchen managers during closing hours will not spend 20 minutes on calls. NGOs lack real-time fleet tracking and cannot mobilize within the strict 2-hour cooked food perishability window.')

pdf.ln(1)

# --- PERSON 2 ---
role_box('2', 'DONOR OPERATIONS & QUALITY ASSURANCE LEAD', 'Team Member 2')
sub_label('What I Did (Management & Quality Control Contribution):')
bullet('Supplier Friction Reduction:', 'Analyzed kitchen closing workflows and eliminated tedious forms. Built a 30-second rapid listing flow using category icon tiles, quantity steppers, and shelf-life chips.')
bullet('Risk Management & Food Safety Gate:', 'Addressed the #1 donor fear: legal and reputational liability for spoiled food. Designed a mandatory 3-point hygiene gate (Fresh, Covered, Unserved) aligned with FSSAI Good Samaritan principles.')
bullet('Supplier CSR Incentives:', 'Designed recognition badges (Zero Waste Champion) and exportable summary tiles for business PR.')

sub_label('What to Show on Screen:')
p('Click Donate (donate.html) -> Select Cooked Meals -> Tap +20 plates stepper -> Tap 2 hrs shelf-life -> Check all 3 hygiene boxes (Safety Verified seal appears) -> Show mini-map GPS pin -> Click Post Surplus.')

sub_label('What to Say to Teacher:')
say('From an operations perspective, my focus was Supplier Onboarding and Quality Assurance. If an app requires 5 minutes to list food, commercial kitchens will abandon it. We reduced listing time to under 30 seconds. To mitigate donor liability, we introduced a 3-point hygiene verification gate. Donors must certify sanitary standards before broadcast, issuing a verifiable Safety Verified badge that protects both donor reputation and recipient health.')

sub_label('Targeted Management Viva Q&A:')
qna('What prevents a donor from falsely checking the hygiene boxes for stale food?',
    'The 3-point checklist establishes formal legal accountability under FSSAI guidelines. Additionally, listings feature strict perishability countdown clocks and volunteer inspection upon pickup. Persistent negative recipient feedback results in venue blacklisting.')

pdf.ln(1)

# --- PERSON 3 ---
role_box('3', 'LOGISTICS, VOLUNTEER OPERATIONS & RISK LEAD', 'Team Member 3')
sub_label('What I Did (Management & Last-Mile Operations Contribution):')
bullet('Micro-Volunteering Logistics Model:', 'Replaced expensive delivery fleets with neighborhood community volunteers executing short, hyper-local 15-minute trips across Kota.')
bullet('Visual Urgency Dispatch:', 'Engineered color-coded urgency pins (Green >3h, Amber 1-3h, Pulsing Red <1h) and dynamic SVG countdown rings to prompt immediate volunteer pickup.')
bullet('Chain of Custody & Fraud Prevention:', 'Designed the 4-digit Safe Handoff OTP protocol to ensure food is transferred exclusively to authorized volunteers, eliminating theft or misdirection.')
bullet('Travel Buffer Monitoring:', 'Programmed transit buffer logic: transit time is subtracted from shelf life to ensure food never spoils in transit.')

sub_label('What to Show on Screen:')
p('Open map.html -> Show urgency pins and ticking SVG countdown clocks -> As Volunteer, click Claim -> Show Claim Drawer, route line, and Spoilage Safe buffer -> Open 4-digit OTP modal -> Step through Claimed, Picked Up, In Transit, Delivered -> Open My Drops ledger.')

sub_label('What to Say to Teacher:')
say('My domain was Last-Mile Logistics and Operations Risk. In perishable logistics, having food listed is meaningless without reliable transit. We solved this with visual urgency: pins pulse red under 1 hour, driving volunteer response. Furthermore, to prevent unauthorized pickups, we engineered a 4-digit Safe Handoff OTP. The donor verifies this code on the volunteer\'s screen before releasing custody, ensuring complete operational integrity.')

sub_label('Targeted Management Viva Q&A:')
qna('What if a volunteer claims food but gets stuck in traffic and the food spoils?',
    'Our Claim Drawer continuously monitors the Spoilage Safe travel buffer. If transit time exceeds the remaining safe window, the volunteer is prompted to abort or re-route. Furthermore, uncollected claims automatically reset after an operational grace period.')

pdf.ln(1)

# --- PERSON 4 ---
role_box('4', 'BENEFICIARY DEMAND & SOCIAL IMPACT (ESG) LEAD', 'Team Member 4')
sub_label('What I Did (Management & Social Impact Contribution):')
bullet('Shifted to a Demand-Pull Model:', 'Interviewed night shelter operators and discovered traditional charity dumps food unpredictably. Built the Shelter Manager Portal so shelters declare tonight\'s exact meal deficit.')
bullet('Smart Matching Allocation:', 'Designed the heuristic algorithm that balances Haversine distance, remaining shelf life, and shelter urgency tier (Critical/High) to prevent oversupplying one shelter while another starves.')
bullet('ESG & Carbon Impact Accounting:', 'Quantified environmental return using standard metrics: 2.5 kg CO2 avoided per 1 kg food rescued. Produced exportable HTML5 Canvas summary graphics.')
bullet('Financial Sustainability Model:', 'Maintained a zero-marginal-cost static infrastructure with long-term scaling via municipal partnerships and corporate CSR grants.')

sub_label('What to Show on Screen:')
p('On map.html switch role to Shelter -> Select Chambal Kinara Shelter -> Set needed meals to 60 (Critical) -> Click Update Tonight\'s Need -> Show glowing heatmap circle -> Switch to Volunteer and tap Smart Match -> Open impact.html to show 7-day Chart.js analytics and Canvas share tile.')

sub_label('What to Say to Teacher:')
say('My focus was Beneficiary Stakeholder Management and Social ROI. Traditional charity uses an inefficient Push model where donors dump food randomly. We transformed this into a Demand-Pull system: night shelter managers log their nightly meal deficit and urgency, generating a glowing demand heatmap. Our Smart Match heuristic pairs food with the highest-need shelter. Finally, we measure social and environmental return: every meal saved prevents greenhouse emissions, quantified on our public ESG dashboard.')

sub_label('Targeted Management Viva Q&A:')
qna('How will this platform sustain itself financially without charging shelters or volunteers?',
    'Sahyog was built with zero marginal tech overhead (no server costs). For operational scaling, our revenue model relies on corporate CSR grants from Kota coaching institutes and institutional partnerships with the Kota Municipal Corporation.')

# --- TIMING TABLE ---
sec('5. RECOMMENDED 6-MINUTE GROUP TIMING & TRANSITION SCRIPT')
pdf.set_x(12)
pdf.set_font('Helvetica', '', 8)
p('- 0:00 - 1:30 | Person 1: Social Problem in Kota & System Overview (index.html)')
p('  Transition: "Now, Person 2 will explain how we onboard donors and manage food safety risks."')
p('- 1:30 - 3:00 | Person 2: Donor Operations, 30-sec Form & 3-Point Hygiene Gate (donate.html)')
p('  Transition: "Now, Person 3 will demonstrate our volunteer logistics and fraud prevention protocol."')
p('- 3:00 - 4:30 | Person 3: Urgency Clocks, Safe Handoff OTP & Delivery Tracking (map.html)')
p('  Transition: "Now, Person 4 will show how shelters pull demand and how we measure ESG social impact."')
p('- 4:30 - 6:00 | Person 4: Demand-Pull Heatmap, Smart Match & ESG Carbon Dashboard (impact.html)')
p('  Closing: "That concludes our presentation on Sahyog\'s social innovation model. We welcome questions, Ma\'am."')

out_path = 'c:/D Drive/shreya/WEB/sahyog/Sahyog_Management_4_Roles_Presentation_Guide.pdf'
pdf.output(out_path)
print(f'Successfully generated 4-Role Management Guide at {out_path} ({pdf.page_no()} pages)')
