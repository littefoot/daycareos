"""
Generate universal, browser-native PDF versions of Ontario Ministry of Education:
- Form 3041E: Statement of Medical Exemption (Child Care and Early Years Act, 2014)
- Form 3042E: Statement of Conscience or Religious Belief for Child (CCEYA s. 35(2))

Replaces dynamic Adobe XFA packets that fail with 'requires Adobe Reader 8 or higher'
in modern web browsers (Chrome, Edge, Safari, Firefox, iOS, Android).
"""
import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

BIN_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'documents', 'bin')
BACKUP_DIR = os.path.join(BIN_DIR, 'raw_adobe_xfa')

os.makedirs(BIN_DIR, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)

# 1. Back up original raw Adobe XFA files if not already backed up
for raw_name in ['Statement of Medical Exemption.pdf', 'Statement of Conscience or Religious Belief.pdf']:
    src = os.path.join(BIN_DIR, raw_name)
    dst = os.path.join(BACKUP_DIR, raw_name)
    if os.path.exists(src) and not os.path.exists(dst):
        shutil.copy2(src, dst)
        print(f"Backed up raw Adobe XFA to: {dst}")

styles = getSampleStyleSheet()

header_title_style = ParagraphStyle(
    'DocHeaderTitle',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=14,
    leading=17,
    textColor=colors.HexColor('#0f172a'),
    alignment=1
)

sub_title_style = ParagraphStyle(
    'DocSubTitle',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9,
    leading=12,
    textColor=colors.HexColor('#334155'),
    alignment=1
)

section_heading_style = ParagraphStyle(
    'SectionHeading',
    parent=styles['Heading2'],
    fontName='Helvetica-Bold',
    fontSize=10,
    leading=13,
    textColor=colors.white
)

body_text_style = ParagraphStyle(
    'DocBodyText',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor('#1e293b')
)

body_bold_style = ParagraphStyle(
    'DocBodyBold',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor('#0f172a')
)

field_label_style = ParagraphStyle(
    'FieldLabel',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=7.5,
    leading=9,
    textColor=colors.HexColor('#475569')
)

field_val_style = ParagraphStyle(
    'FieldVal',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor('#0f172a')
)

def create_medical_exemption_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    story = []

    # Ministry Header
    header_data = [
        [
            Paragraph("<b>Ontario Ministry of Education</b><br/><font size=7 color='#64748b'>Early Years and Child Care Division • Form 3041E (2016/05)</font>", styles['Normal']),
            Paragraph("<b>All Child Care Solutions (ACCS)</b><br/><font size=7 color='#64748b'>Licensed Home Child Care Agency • CCEYA s. 35</font>", ParagraphStyle('R', parent=styles['Normal'], alignment=2))
        ]
    ]
    t_head = Table(header_data, colWidths=[270, 270])
    t_head.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_head)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("Statement of Medical Exemption", header_title_style))
    story.append(Paragraph("<b>Child Care and Early Years Act, 2014 (O. Reg. 137/15, Section 35) & Immunization of School Pupils Act</b>", sub_title_style))
    story.append(Spacer(1, 10))

    # Instructions box
    notice_text = (
        "<b>Important Notice to Parents and Regulated Health Professionals:</b> Under subsection 35(2) of Ontario Regulation 137/15, "
        "every child enrolled in a licensed child care centre or home child care agency must be immunized in accordance with the local Medical "
        "Officer of Health recommendations, unless a legally certified exemption is completed. This form must be completed by a physician legally "
        "qualified to practice medicine in Ontario (holding active CPSO registration) or a registered Nurse Practitioner."
    )
    t_notice = Table([[Paragraph(notice_text, styles['Normal'])]], colWidths=[540])
    t_notice.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94a3b8')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_notice)
    story.append(Spacer(1, 8))

    # Section 1: Child Identification
    s1_header = Table([[Paragraph("SECTION 1 — CHILD IDENTIFICATION", section_heading_style)]], colWidths=[540])
    s1_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(s1_header)

    s1_data = [
        [
            Paragraph("<b>Child's Full Legal Last Name:</b><br/><br/>________________________________________", body_text_style),
            Paragraph("<b>Child's Legal First Name:</b><br/><br/>________________________________________", body_text_style),
            Paragraph("<b>Date of Birth (YYYY/MM/DD):</b><br/><br/>________ / _____ / _____ ", body_text_style),
        ],
        [
            Paragraph("<b>Home Address (Street Number, Street Name, Unit #):</b><br/><br/>____________________________________________________________________", body_text_style),
            Paragraph("<b>City / Municipality:</b><br/><br/>____________________________", body_text_style),
            Paragraph("<b>Postal Code:</b><br/><br/>[ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]", body_text_style),
        ],
        [
            Paragraph("<b>Parent / Legal Guardian Full Name:</b><br/><br/>____________________________________________________________________", body_text_style),
            Paragraph("<b>Parent Cell Phone:</b><br/><br/>(________) ________ - ____________", body_text_style),
            Paragraph("<b>Child Care Agency:</b><br/><br/><b>All Child Care Solutions</b>", body_text_style),
        ]
    ]
    t_s1 = Table(s1_data, colWidths=[240, 180, 120])
    t_s1.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_s1)
    story.append(Spacer(1, 8))

    # Section 2: Clinical Medical Contraindications
    s2_header = Table([[Paragraph("SECTION 2 — STATEMENT OF MEDICAL CONTRAINDICATION (TO BE COMPLETED BY PHYSICIAN)", section_heading_style)]], colWidths=[540])
    s2_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(s2_header)

    s2_intro = (
        "I hereby certify that the immunization(s) designated below should not be administered to the named child for medical reasons, "
        "due to detrimental health effects or laboratory evidence of prior natural immunity."
    )
    story.append(Table([[Paragraph(s2_intro, styles['Normal'])]], colWidths=[540], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('PADDING', (0,0), (-1,-1), 4),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1'))
    ]))

    vaccines_table_data = [
        [
            Paragraph("<b>Designated Disease / Antigen</b>", field_label_style),
            Paragraph("<b>Evidence of Immunity</b>", field_label_style),
            Paragraph("<b>Medical Contraindication</b>", field_label_style),
            Paragraph("<b>Duration of Exemption</b>", field_label_style)
        ],
        [
            Paragraph("<b>Diphtheria</b>", body_text_style),
            Paragraph("[ &nbsp; ] Lab serology confirmed", body_text_style),
            Paragraph("[ &nbsp; ] Severe detrimental reaction", body_text_style),
            Paragraph("[ &nbsp; ] Permanent &nbsp; &nbsp; [ &nbsp; ] Temp until: ____/____/____", body_text_style)
        ],
        [
            Paragraph("<b>Tetanus</b>", body_text_style),
            Paragraph("[ &nbsp; ] Lab serology confirmed", body_text_style),
            Paragraph("[ &nbsp; ] Severe detrimental reaction", body_text_style),
            Paragraph("[ &nbsp; ] Permanent &nbsp; &nbsp; [ &nbsp; ] Temp until: ____/____/____", body_text_style)
        ],
        [
            Paragraph("<b>Poliomyelitis (Polio)</b>", body_text_style),
            Paragraph("[ &nbsp; ] Lab serology confirmed", body_text_style),
            Paragraph("[ &nbsp; ] Severe detrimental reaction", body_text_style),
            Paragraph("[ &nbsp; ] Permanent &nbsp; &nbsp; [ &nbsp; ] Temp until: ____/____/____", body_text_style)
        ],
        [
            Paragraph("<b>Pertussis (Whooping Cough)</b>", body_text_style),
            Paragraph("[ &nbsp; ] Prior diagnosis / lab", body_text_style),
            Paragraph("[ &nbsp; ] Severe detrimental reaction", body_text_style),
            Paragraph("[ &nbsp; ] Permanent &nbsp; &nbsp; [ &nbsp; ] Temp until: ____/____/____", body_text_style)
        ],
        [
            Paragraph("<b>Measles</b>", body_text_style),
            Paragraph("[ &nbsp; ] Lab serology confirmed", body_text_style),
            Paragraph("[ &nbsp; ] Severe detrimental reaction", body_text_style),
            Paragraph("[ &nbsp; ] Permanent &nbsp; &nbsp; [ &nbsp; ] Temp until: ____/____/____", body_text_style)
        ],
        [
            Paragraph("<b>Mumps</b>", body_text_style),
            Paragraph("[ &nbsp; ] Lab serology confirmed", body_text_style),
            Paragraph("[ &nbsp; ] Severe detrimental reaction", body_text_style),
            Paragraph("[ &nbsp; ] Permanent &nbsp; &nbsp; [ &nbsp; ] Temp until: ____/____/____", body_text_style)
        ],
        [
            Paragraph("<b>Rubella</b>", body_text_style),
            Paragraph("[ &nbsp; ] Lab serology confirmed", body_text_style),
            Paragraph("[ &nbsp; ] Severe detrimental reaction", body_text_style),
            Paragraph("[ &nbsp; ] Permanent &nbsp; &nbsp; [ &nbsp; ] Temp until: ____/____/____", body_text_style)
        ],
        [
            Paragraph("<b>Meningococcal Disease</b>", body_text_style),
            Paragraph("[ &nbsp; ] Lab serology confirmed", body_text_style),
            Paragraph("[ &nbsp; ] Severe detrimental reaction", body_text_style),
            Paragraph("[ &nbsp; ] Permanent &nbsp; &nbsp; [ &nbsp; ] Temp until: ____/____/____", body_text_style)
        ],
        [
            Paragraph("<b>Varicella (Chickenpox)</b>", body_text_style),
            Paragraph("[ &nbsp; ] Clinical prior history / lab", body_text_style),
            Paragraph("[ &nbsp; ] Severe detrimental reaction", body_text_style),
            Paragraph("[ &nbsp; ] Permanent &nbsp; &nbsp; [ &nbsp; ] Temp until: ____/____/____", body_text_style)
        ],
        [
            Paragraph("<b>Haemophilus Influenza B (Hib)</b>", body_text_style),
            Paragraph("[ &nbsp; ] Lab serology confirmed", body_text_style),
            Paragraph("[ &nbsp; ] Severe detrimental reaction", body_text_style),
            Paragraph("[ &nbsp; ] Permanent &nbsp; &nbsp; [ &nbsp; ] Temp until: ____/____/____", body_text_style)
        ],
    ]
    t_vax = Table(vaccines_table_data, colWidths=[140, 130, 130, 140])
    t_vax.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_vax)
    story.append(Spacer(1, 8))

    # Physician Clinical Rationale
    story.append(Paragraph("<b>Clinical Explanation / Specific Contraindications (Detrimental to Health):</b>", body_bold_style))
    story.append(Spacer(1, 2))
    notes_box = Table([[Paragraph("<br/><br/><br/>", body_text_style)]], colWidths=[540])
    notes_box.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fafafa')),
    ]))
    story.append(notes_box)
    story.append(Spacer(1, 8))

    # Section 3: Physician & Clinic Information
    s3_header = Table([[Paragraph("SECTION 3 — REGULATED HEALTH PROFESSIONAL CERTIFICATION & SIGNATURE", section_heading_style)]], colWidths=[540])
    s3_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(s3_header)

    s3_data = [
        [
            Paragraph("<b>Physician Name (Print Last Name, First Name):</b><br/><br/>____________________________________________________________", body_text_style),
            Paragraph("<b>CPSO Medical Licence Number:</b><br/><br/><b>#</b> ________________________", body_text_style),
        ],
        [
            Paragraph("<b>Clinic / Hospital Name & Full Street Address:</b><br/><br/>____________________________________________________________________________________", body_text_style),
            Paragraph("<b>Telephone Number:</b><br/><br/>(________) ________ - ____________", body_text_style),
        ],
        [
            Paragraph("<b>Signature of Regulated Health Professional:</b><br/><br/><br/>X ________________________________________________________", body_text_style),
            Paragraph("<b>Date of Execution (YYYY/MM/DD):</b><br/><br/><br/>________ / _____ / _____ ", body_text_style),
        ]
    ]
    t_s3 = Table(s3_data, colWidths=[360, 180])
    t_s3.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_s3)
    story.append(Spacer(1, 8))

    # Section 4: Parent Outbreak Exclusion Acknowledgment
    s4_header = Table([[Paragraph("SECTION 4 — PARENT / GUARDIAN OUTBREAK EXCLUSION ACKNOWLEDGMENT", section_heading_style)]], colWidths=[540])
    s4_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(s4_header)

    s4_text = (
        "I acknowledge that in the event of an outbreak of a vaccine-preventable disease in the child care centre or home child care premises, "
        "the local <b>Medical Officer of Health</b> may order the immediate exclusion of my unimmunized child from care until the outbreak is declared resolved. "
        "I understand that child care fees may still apply during mandatory exclusion periods under standard agency enrolment contracts."
    )
    s4_data = [
        [Paragraph(s4_text, styles['Normal'])],
        [
            Table([
                [
                    Paragraph("<b>Parent / Legal Guardian Signature:</b><br/><br/>X ________________________________________________", body_text_style),
                    Paragraph("<b>Date Signed:</b><br/><br/>________ / _____ / _____ ", body_text_style)
                ]
            ], colWidths=[360, 180], style=[('VALIGN', (0,0), (-1,-1), 'TOP')])
        ]
    ]
    t_s4 = Table(s4_data, colWidths=[540])
    t_s4.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_s4)

    # Footer note
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "<font size=6.5 color='#64748b'>Personal information on this form is collected under subsection 35(2) of Ontario Regulation 137/15 under the Child Care and Early Years Act, 2014. "
        "Preserved in agency Ministry Licensing Audit Binder. All Child Care Solutions Inc. • 24/7 Hotline: +1 (416) 694-7445 • allchildcaresolutions@gmail.com</font>",
        ParagraphStyle('Footer', parent=styles['Normal'], alignment=1)
    ))

    doc.build(story)
    print(f"Created universal medical exemption PDF: {output_path}")


def create_conscience_exemption_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    story = []

    # Ministry Header
    header_data = [
        [
            Paragraph("<b>Ontario Ministry of Education</b><br/><font size=7 color='#64748b'>Early Years and Child Care Division • Form 3042E (2016/05)</font>", styles['Normal']),
            Paragraph("<b>All Child Care Solutions (ACCS)</b><br/><font size=7 color='#64748b'>Licensed Home Child Care Agency • CCEYA s. 35(2)</font>", ParagraphStyle('R', parent=styles['Normal'], alignment=2))
        ]
    ]
    t_head = Table(header_data, colWidths=[270, 270])
    t_head.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_head)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("Statement of Conscience or Religious Belief for Child", header_title_style))
    story.append(Paragraph("<b>Affidavit under the Child Care and Early Years Act, 2014 (O. Reg. 137/15, Section 35(2))</b>", sub_title_style))
    story.append(Spacer(1, 12))

    # Legal Requirement Box
    notice_text = (
        "<b>Statutory Sworn Affidavit Requirement:</b> In accordance with subsection 35(2) of Ontario Regulation 137/15, "
        "a parent or guardian who objects to childhood immunization on the grounds of sincerely held religious beliefs or dictates of conscience "
        "must complete this sworn affidavit before a <b>Commissioner for Taking Affidavits</b> (e.g. Lawyer, Paralegal, Notary Public, or Municipal Clerk). "
        "The completed, stamped original must be provided to the child care agency prior to child placement."
    )
    t_notice = Table([[Paragraph(notice_text, styles['Normal'])]], colWidths=[540])
    t_notice.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94a3b8')),
        ('PADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(t_notice)
    story.append(Spacer(1, 10))

    # Section 1: Deponent & Child Identification
    s1_header = Table([[Paragraph("SECTION 1 — DEPONENT (PARENT) & CHILD IDENTIFICATION", section_heading_style)]], colWidths=[540])
    s1_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(s1_header)

    s1_data = [
        [
            Paragraph("<b>I, (Full Legal Name of Parent / Legal Guardian):</b><br/><br/>____________________________________________________________________________________", body_text_style),
            Paragraph("<b>Relationship to Child:</b><br/><br/>[ &nbsp; ] Mother &nbsp; [ &nbsp; ] Father &nbsp; [ &nbsp; ] Legal Guardian", body_text_style)
        ],
        [
            Paragraph("<b>Residing at Full Street Address (Unit #, Street Number, Street Name):</b><br/><br/>____________________________________________________________________________________", body_text_style),
            Paragraph("<b>City / Municipality, Province:</b><br/><br/>____________________________, Ontario", body_text_style)
        ],
        [
            Paragraph("<b>Parent Contact Phone:</b><br/><br/>(________) ________ - ____________", body_text_style),
            Paragraph("<b>Postal Code:</b><br/><br/>[ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]", body_text_style)
        ]
    ]
    t_s1 = Table(s1_data, colWidths=[360, 180])
    t_s1.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_s1)
    story.append(Spacer(1, 8))

    # Child Information
    s_child_data = [
        [
            Paragraph("<b>Being the parent or guardian of the following named child:</b>", body_bold_style),
            Paragraph("", body_text_style)
        ],
        [
            Paragraph("<b>Child's Full Legal Name (Last Name, First Name, Middle Name):</b><br/><br/>____________________________________________________________________________________", body_text_style),
            Paragraph("<b>Child Date of Birth (YYYY/MM/DD):</b><br/><br/>________ / _____ / _____ ", body_text_style)
        ],
        [
            Paragraph("<b>Licensed Home Child Care Agency / Provider:</b><br/><br/><b>All Child Care Solutions Inc. (ACCS)</b>", body_text_style),
            Paragraph("<b>Date of Enrolment:</b><br/><br/>________ / _____ / _____ ", body_text_style)
        ]
    ]
    t_child = Table(s_child_data, colWidths=[360, 180])
    t_child.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_child)
    story.append(Spacer(1, 10))

    # Section 2: Solemn Affirmation
    s2_header = Table([[Paragraph("SECTION 2 — SOLEMN OATH & AFFIDAVIT OF CONVICTION", section_heading_style)]], colWidths=[540])
    s2_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(s2_header)

    affidavit_text = (
        "<b>DO HEREBY MAKE OATH OR SOLEMNLY AFFIRM AND SAY AS FOLLOWS:</b><br/><br/>"
        "<b>1.</b> Immunization of my named child conflicts with the dictates of my sincerely held religious beliefs or conscience.<br/><br/>"
        "<b>2.</b> I make this affidavit for the purpose of complying with the requirements of <b>subsection 35(2) of Ontario Regulation 137/15</b> "
        "under the <i>Child Care and Early Years Act, 2014</i>, and for no other or improper purpose.<br/><br/>"
        "<b>3.</b> I acknowledge and understand that in the event of an outbreak of a vaccine-preventable communicable disease at the child care "
        "premises, the regional Medical Officer of Health may direct the licensed provider to immediately exclude my unimmunized child until "
        "the local public health authority determines that the premises are safe for attendance."
    )
    t_aff = Table([[Paragraph(affidavit_text, styles['Normal'])]], colWidths=[540])
    t_aff.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fcfcfc')),
    ]))
    story.append(t_aff)
    story.append(Spacer(1, 12))

    # Section 3: Commissioner Endorsement
    s3_header = Table([[Paragraph("SECTION 3 — SWORN OR SOLEMNLY AFFIRMED BEFORE ME", section_heading_style)]], colWidths=[540])
    s3_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(s3_header)

    s3_data = [
        [
            Paragraph("<b>Sworn or solemnly affirmed before me at:</b><br/><br/>Municipality / City of: ____________________________________<br/>In the Province of: <b>Ontario</b>", body_text_style),
            Paragraph("<b>This Date (YYYY/MM/DD):</b><br/><br/>This ________ day of __________________, 20____", body_text_style),
        ],
        [
            Paragraph("<b>Signature of Commissioner for Taking Affidavits:</b><br/><br/><br/>X ____________________________________________________<br/><br/><font size=7 color='#64748b'>(Official Commissioner Stamp / Seal / Law Society # Below)</font>", body_text_style),
            Paragraph("<b>Deponent (Parent / Legal Guardian) Signature:</b><br/><br/><br/>X ____________________________________________________<br/><br/><font size=7 color='#64748b'>(Must be signed in physical presence of Commissioner)</font>", body_text_style),
        ],
        [
            Paragraph("<b>Commissioner Name & Title (Printed):</b><br/><br/>____________________________________________________", body_text_style),
            Paragraph("<b>Commission Expiry Date (if applicable):</b><br/><br/>____________________________________________________", body_text_style),
        ]
    ]
    t_s3 = Table(s3_data, colWidths=[270, 270])
    t_s3.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_s3)

    # Footer note
    story.append(Spacer(1, 14))
    story.append(Paragraph(
        "<font size=7 color='#64748b'>Personal information on this form is provided to your child care provider and agency as required under subsection 35(2) of Ontario Regulation 137/15 under the Child Care and Early Years Act, 2014.<br/>"
        "Official All Child Care Solutions Inc. Record • 24/7 Agency Phone: +1 (416) 694-7445 • allchildcaresolutions@gmail.com</font>",
        ParagraphStyle('Footer', parent=styles['Normal'], alignment=1)
    ))

    doc.build(story)
    print(f"Created universal conscience exemption PDF: {output_path}")

if __name__ == '__main__':
    med_path = os.path.join(BIN_DIR, 'Statement of Medical Exemption.pdf')
    con_path = os.path.join(BIN_DIR, 'Statement of Conscience or Religious Belief.pdf')
    create_medical_exemption_pdf(med_path)
    create_conscience_exemption_pdf(con_path)
    print("Done! Both PDFs are now universal browser-compatible PDFs.")
