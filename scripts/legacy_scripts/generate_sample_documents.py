import os
from PIL import Image, ImageDraw, ImageFont

# Ensure directory exists
out_dir = r"c:\Projects\allchildcaresolutions\public\documents"
os.makedirs(out_dir, exist_ok=True)

# Helper for font fallback
def get_font(size, bold=False):
    font_names = [
        "arialbd.ttf" if bold else "arial.ttf",
        "seguiemb.ttf" if bold else "segoeui.ttf",
        "calibrib.ttf" if bold else "calibri.ttf"
    ]
    for fn in font_names:
        try:
            return ImageFont.truetype(fn, size)
        except:
            pass
    return ImageFont.load_default()

# ----------------------------------------------------
# 1. ONTARIO BIRTH CERTIFICATE (1200 x 900)
# ----------------------------------------------------
def create_birth_certificate():
    w, h = 1200, 900
    img = Image.new("RGB", (w, h), (247, 252, 248))
    draw = ImageDraw.Draw(img)

    # Security guilloche border
    for i in range(12):
        col = (20 + i*5, 80 + i*4, 45 + i*3) if i % 2 == 0 else (190, 160, 90)
        draw.rectangle([20 + i*2, 20 + i*2, w - 20 - i*2, h - 20 - i*2], outline=col, width=2)
    
    # Inner parchment background
    draw.rectangle([50, 50, w - 50, h - 50], fill=(253, 255, 250), outline=(22, 101, 52), width=4)

    # Security micro-lines background pattern
    for y in range(60, h - 60, 18):
        draw.line([(60, y), (w - 60, y)], fill=(235, 245, 238), width=1)

    # Header
    f_title = get_font(28, bold=True)
    f_sub = get_font(18, bold=True)
    f_body = get_font(16, bold=False)
    f_body_bold = get_font(16, bold=True)
    f_small = get_font(12, bold=False)

    # Top Crown / Crest Graphic Placeholder
    draw.rectangle([w//2 - 40, 65, w//2 + 40, 105], fill=(22, 101, 52), outline=(180, 140, 40), width=2)
    draw.text((w//2, 85), "ONTARIO", fill=(255, 255, 255), font=get_font(13, bold=True), anchor="mm")

    draw.text((w//2, 125), "CERTIFICATE OF BIRTH / CERTIFICAT DE NAISSANCE", fill=(15, 60, 30), font=f_title, anchor="mm")
    draw.text((w//2, 155), "PROVINCE OF ONTARIO • CANADA", fill=(140, 100, 20), font=f_sub, anchor="mm")
    draw.line([(120, 175), (w - 120, 175)], fill=(22, 101, 52), width=2)

    # Registration Metadata
    draw.text((100, 200), "REGISTRATION NO. / N° D'ENREGISTREMENT:", fill=(70, 70, 70), font=f_small)
    draw.text((450, 198), "2024-05-849201-ON", fill=(20, 20, 20), font=get_font(16, bold=True))

    draw.text((750, 200), "DATE ISSUED / DATE D'ÉMISSION:", fill=(70, 70, 70), font=f_small)
    draw.text((980, 198), "2024-05-02", fill=(20, 20, 20), font=get_font(16, bold=True))

    # Details Box
    draw.rectangle([90, 230, w - 90, 680], outline=(180, 200, 180), fill=(255, 255, 255), width=2)

    fields = [
        ("CHILD'S FULL NAME / NOM DE L'ENFANT:", "LIAM MACDONALD", 260),
        ("DATE OF BIRTH / DATE DE NAISSANCE:", "APRIL 18, 2024 / 18 AVRIL 2024", 320),
        ("SEX / SEXE:", "MALE / MASCULIN", 380),
        ("PLACE OF BIRTH / LIEU DE NAISSANCE:", "OSHAWA, ONTARIO, CANADA (LAKERIDGE HEALTH)", 440),
        ("NAME OF PARENT 1 / NOM DU PARENT 1:", "SARAH MACDONALD", 500),
        ("NAME OF PARENT 2 / NOM DU PARENT 2:", "DAVID MACDONALD", 560),
        ("REGISTRATION DATE / DATE DE L'ENREGISTREMENT:", "APRIL 24, 2024", 620),
    ]

    for label, val, y_pos in fields:
        draw.text((120, y_pos), label, fill=(80, 80, 80), font=f_small)
        draw.text((120, y_pos + 18), val, fill=(10, 30, 15), font=get_font(20, bold=True))
        draw.line([(120, y_pos + 42), (w - 120, y_pos + 42)], fill=(230, 240, 230), width=1)

    # Gold Seal Graphic
    seal_x, seal_y, seal_r = 220, 770, 55
    draw.ellipse([seal_x - seal_r, seal_y - seal_r, seal_x + seal_r, seal_y + seal_r], fill=(212, 175, 55), outline=(160, 120, 20), width=3)
    draw.ellipse([seal_x - seal_r + 8, seal_y - seal_r + 8, seal_x + seal_r - 8, seal_y + seal_r - 8], outline=(255, 245, 180), width=2)
    draw.text((seal_x, seal_y - 12), "SEAL OF THE", fill=(70, 50, 10), font=get_font(10, bold=True), anchor="mm")
    draw.text((seal_x, seal_y + 2), "REGISTRAR GENERAL", fill=(70, 50, 10), font=get_font(10, bold=True), anchor="mm")
    draw.text((seal_x, seal_y + 16), "ONTARIO", fill=(70, 50, 10), font=get_font(12, bold=True), anchor="mm")

    # Signature Block
    draw.line([(w - 450, 790), (w - 120, 790)], fill=(20, 20, 20), width=2)
    draw.text((w - 285, 765), "J. R. Montgomery", fill=(20, 40, 100), font=get_font(22, bold=True), anchor="mm")
    draw.text((w - 285, 805), "DEPUTY REGISTRAR GENERAL / SOUS-REGISTRAIRE GÉNÉRAL", fill=(80, 80, 80), font=f_small, anchor="mm")

    # Bottom watermark note
    draw.text((w//2, 860), "OFFICIAL VITAL STATISTICS RECORD • OFFICE OF THE REGISTRAR GENERAL ONTARIO", fill=(100, 120, 100), font=get_font(11, bold=True), anchor="mm")

    img.save(os.path.join(out_dir, "ontario-birth-certificate.jpg"), quality=95)
    print("Created ontario-birth-certificate.jpg")

# ----------------------------------------------------
# 2. ONTARIO HEALTH CARD (OHIP) (1000 x 630)
# ----------------------------------------------------
def create_health_card():
    w, h = 1000, 630
    img = Image.new("RGB", (w, h), (240, 248, 242))
    draw = ImageDraw.Draw(img)

    # Health card gradient green top bar
    for y in range(0, 120):
        draw.line([(0, y), (w, y)], fill=(16, 120 - int(y * 0.4), 60 + int(y * 0.3)), width=1)

    # Trillium / Ontario Header
    draw.text((50, 35), "Ontario", fill=(255, 255, 255), font=get_font(34, bold=True))
    draw.text((50, 75), "Ministry of Health and Long-Term Care", fill=(220, 245, 225), font=get_font(15, bold=False))
    draw.text((w - 50, 45), "HEALTH • SANTÉ", fill=(255, 255, 255), font=get_font(24, bold=True), anchor="ra")

    # Wavy security background lines
    for i in range(130, h - 70, 15):
        draw.line([(0, i), (w, i + 8)], fill=(225, 240, 230), width=1)

    # Photo Box (Child Silhouette)
    draw.rectangle([60, 150, 280, 430], fill=(230, 235, 240), outline=(150, 160, 170), width=2)
    draw.ellipse([120, 200, 220, 300], fill=(180, 190, 200))
    draw.ellipse([85, 300, 255, 420], fill=(180, 190, 200))
    draw.text((170, 400), "PHOTO / ID", fill=(100, 110, 120), font=get_font(14, bold=True), anchor="mm")

    # Smart Card Chip
    draw.rectangle([320, 160, 410, 230], fill=(215, 180, 75), outline=(170, 140, 40), width=2)
    draw.line([(320, 195), (410, 195)], fill=(170, 140, 40), width=2)
    draw.line([(365, 160), (365, 230)], fill=(170, 140, 40), width=2)

    # Card Details
    f_lbl = get_font(13, bold=False)
    f_val = get_font(22, bold=True)
    f_mono = get_font(36, bold=True)

    # OHIP Number
    draw.text((450, 155), "HEALTH NUMBER / NUMÉRO DE SANTÉ", fill=(80, 100, 80), font=f_lbl)
    draw.text((450, 180), "4820  918  204  YX", fill=(10, 40, 20), font=f_mono)

    # Name
    draw.text((320, 260), "NAME / NOM", fill=(80, 100, 80), font=f_lbl)
    draw.text((320, 285), "LIAM MACDONALD", fill=(10, 20, 10), font=get_font(26, bold=True))

    # DOB & Sex
    draw.text((320, 345), "BIRTHDATE / DATE DE NAISSANCE", fill=(80, 100, 80), font=f_lbl)
    draw.text((320, 370), "2024 / 04 / 18", fill=(10, 20, 10), font=f_val)

    draw.text((650, 345), "SEX / SEXE", fill=(80, 100, 80), font=f_lbl)
    draw.text((650, 370), "M", fill=(10, 20, 10), font=f_val)

    # Valid / Expiry Date
    draw.text((320, 425), "EXPIRY / EXPIRATION", fill=(80, 100, 80), font=f_lbl)
    draw.text((320, 450), "2029 / 04 / 18", fill=(10, 20, 10), font=f_val)

    draw.text((650, 425), "CARD VERSION / VERSION", fill=(80, 100, 80), font=f_lbl)
    draw.text((650, 450), "YX (ACTIVE)", fill=(16, 120, 60), font=f_val)

    # Bottom Magnetic / Barcode Strip Simulator
    draw.rectangle([0, h - 80, w, h], fill=(20, 20, 20))
    for x in range(30, w - 30, 8):
        draw.line([(x, h - 65), (x, h - 15)], fill=(255, 255, 255) if (x % 3 != 0) else (30, 30, 30), width=3)

    img.save(os.path.join(out_dir, "ontario-health-card.jpg"), quality=95)
    print("Created ontario-health-card.jpg")

# ----------------------------------------------------
# 3. ONTARIO YELLOW IMMUNIZATION CARD (1200 x 850)
# ----------------------------------------------------
def create_yellow_card():
    w, h = 1200, 850
    # Iconic Ontario Yellow Vaccine Card Color
    img = Image.new("RGB", (w, h), (255, 246, 196))
    draw = ImageDraw.Draw(img)

    # Fold Line Center Texture
    draw.line([(w//2, 10), (w//2, h - 10)], fill=(235, 220, 150), width=2)
    draw.rectangle([15, 15, w - 15, h - 15], outline=(180, 150, 50), width=3)

    # Header
    draw.text((w//2, 45), "ONTARIO IMMUNIZATION RECORD", fill=(100, 70, 0), font=get_font(28, bold=True), anchor="mm")
    draw.text((w//2, 75), "FICHE D'IMMUNISATION DE L'ONTARIO • PUBLIC HEALTH ONTARIO", fill=(120, 90, 20), font=get_font(15, bold=True), anchor="mm")
    draw.line([(40, 95), (w - 40, 95)], fill=(180, 150, 50), width=2)

    # Child Demographics Box
    draw.rectangle([40, 110, w - 40, 200], fill=(255, 250, 225), outline=(200, 170, 70), width=1)
    
    draw.text((60, 125), "CHILD'S NAME / NOM DE L'ENFANT:", fill=(100, 80, 20), font=get_font(12, bold=False))
    draw.text((60, 145), "LIAM MACDONALD", fill=(20, 20, 20), font=get_font(20, bold=True))

    draw.text((450, 125), "DATE OF BIRTH / DATE DE NAISSANCE:", fill=(100, 80, 20), font=get_font(12, bold=False))
    draw.text((450, 145), "2024-04-18 (YYYY-MM-DD)", fill=(20, 20, 20), font=get_font(18, bold=True))

    draw.text((850, 125), "OHIP NO. / N° D'ASSURANCE-SANTÉ:", fill=(100, 80, 20), font=get_font(12, bold=False))
    draw.text((850, 145), "4820-918-204-YX", fill=(20, 20, 20), font=get_font(18, bold=True))

    # Vaccine Table Grid
    table_top = 220
    row_h = 42
    headers = [("VACCINE / VACCIN", 240), ("DOSE 1 (2 Mos)", 140), ("DOSE 2 (4 Mos)", 140), ("DOSE 3 (6 Mos)", 140), ("DOSE 4 (12 Mos)", 140), ("DOSE 5 (18 Mos)", 140), ("CLINIC / STAMP", 220)]
    
    # Table Header Row
    curr_x = 40
    for title, col_w in headers:
        draw.rectangle([curr_x, table_top, curr_x + col_w, table_top + 35], fill=(230, 200, 100), outline=(150, 120, 40), width=1)
        draw.text((curr_x + col_w//2, table_top + 18), title, fill=(60, 40, 0), font=get_font(11, bold=True), anchor="mm")
        curr_x += col_w

    # Table Rows
    rows = [
        ("DTaP-IPV-Hib (Infanrix-IPV)", "2024-06-18 ✓", "2024-08-18 ✓", "2024-10-18 ✓", "2025-04-18 ✓", "2025-10-18 ✓", "Durham Public Health"),
        ("Rotavirus (Rotarix)", "2024-06-18 ✓", "2024-08-18 ✓", "—", "—", "—", "Dr. A. Sharma Clinic"),
        ("Pneumococcal (Prevnar 13)", "2024-06-18 ✓", "2024-08-18 ✓", "—", "2025-04-18 ✓", "—", "Durham Public Health"),
        ("Meningococcal-C (Menjugate)", "—", "—", "—", "2025-04-18 ✓", "—", "Dr. A. Sharma Clinic"),
        ("MMR (Measles, Mumps, Rubella)", "—", "—", "—", "2025-04-18 ✓", "—", "Durham Public Health"),
        ("Varicella (Chickenpox)", "—", "—", "—", "—", "2025-10-18 ✓", "Durham Public Health"),
        ("Hepatitis B (Recombivax)", "—", "—", "—", "—", "—", "Scheduled Grade 7"),
        ("Influenza (Seasonal Flu)", "2024-11-04 ✓", "2025-11-12 ✓", "—", "—", "—", "Oshawa Care Pharmacy"),
    ]

    curr_y = table_top + 35
    for row_idx, r_data in enumerate(rows):
        curr_x = 40
        row_bg = (255, 252, 238) if row_idx % 2 == 0 else (255, 248, 215)
        for c_idx, text in enumerate(r_data):
            col_w = headers[c_idx][1]
            draw.rectangle([curr_x, curr_y, curr_x + col_w, curr_y + row_h], fill=row_bg, outline=(200, 170, 80), width=1)
            
            # Highlight checkmarks with green/navy
            if "✓" in text:
                draw.text((curr_x + col_w//2, curr_y + row_h//2), text, fill=(15, 80, 30), font=get_font(12, bold=True), anchor="mm")
            elif c_idx == 0:
                draw.text((curr_x + 10, curr_y + row_h//2), text, fill=(30, 30, 30), font=get_font(12, bold=True), anchor="lm")
            else:
                draw.text((curr_x + col_w//2, curr_y + row_h//2), text, fill=(80, 80, 80), font=get_font(12, bold=False), anchor="mm")
            curr_x += col_w
        curr_y += row_h

    # Official Clinic Round Stamp
    stamp_x, stamp_y, stamp_r = 200, 720, 55
    draw.ellipse([stamp_x - stamp_r, stamp_y - stamp_r, stamp_x + stamp_r, stamp_y + stamp_r], outline=(30, 70, 160), width=3)
    draw.ellipse([stamp_x - stamp_r + 6, stamp_y - stamp_r + 6, stamp_x + stamp_r - 6, stamp_y + stamp_r - 6], outline=(30, 70, 160), width=1)
    draw.text((stamp_x, stamp_y - 20), "DURHAM REGION", fill=(30, 70, 160), font=get_font(11, bold=True), anchor="mm")
    draw.text((stamp_x, stamp_y), "PUBLIC HEALTH", fill=(30, 70, 160), font=get_font(11, bold=True), anchor="mm")
    draw.text((stamp_x, stamp_y + 20), "IMMUNIZATION CERTIFIED", fill=(30, 70, 160), font=get_font(9, bold=True), anchor="mm")

    # Doctor Verification Notice
    draw.rectangle([300, 660, w - 40, 780], fill=(255, 255, 255), outline=(180, 150, 60), width=1)
    draw.text((320, 680), "PUBLIC HEALTH IMMUNIZATION COMPLIANCE VERIFICATION", fill=(100, 70, 0), font=get_font(13, bold=True))
    draw.text((320, 705), "This official record certifies compliance under the Ontario Child Care and Early Years Act (CCEYA) and Day Nurseries Act.", fill=(70, 70, 70), font=get_font(11, bold=False))
    draw.text((320, 725), "Verified by: Dr. Ananya Sharma, MD, CCFP (CPSO #84920) • Durham Regional Health Clinic", fill=(20, 20, 20), font=get_font(12, bold=True))
    draw.text((320, 748), "Next Scheduled Booster: 4-6 Year Pre-School Booster (DTaP-IPV / MMRV)", fill=(180, 50, 20), font=get_font(11, bold=True))

    img.save(os.path.join(out_dir, "ontario-immunization-yellow-card.jpg"), quality=95)
    print("Created ontario-immunization-yellow-card.jpg")

if __name__ == "__main__":
    create_birth_certificate()
    create_health_card()
    create_yellow_card()
    print("All sample documents successfully generated in public/documents/")
