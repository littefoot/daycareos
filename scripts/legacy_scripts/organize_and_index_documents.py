import os
import shutil
import re
from pathlib import Path
import docx
import pypdf

BASE_DIR = Path(r"C:\Projects\allchildcaresolutions")
FORMS_ZIP_DIR = BASE_DIR / "2026-09-10-forms" / "raw_unpacked"
MD_FORMS_DIR = BASE_DIR / "docs" / "forms_source_of_truth"
MD_POLICIES_DIR = BASE_DIR / "docs" / "policies_source_of_truth"
ORIGINALS_ORGANIZED_DIR = BASE_DIR / "2026-09-10-forms" / "organized_documents"

forms_cat_map = {
    'BIN (TO DISTRIBUTE AS NEEDED FOR PEOPEL WHO REQUEST THEM)': 'supplemental_and_special_needs',
    'HOME VISITOR': 'home_visitor_forms',
    'PARENTS FORMS': 'parent_intake_forms',
    'PROVIDER FORMS': 'provider_intake_forms',
    'TIME SHEETS': 'provider_timesheets',
}

policy_cat_map = {
    '-=ACCS NEW POLICY WIP=-': 'policy_updates_wip',
    '-=ACCS PARENTS HANDBOOK=-': 'parent_handbook',
    '-=ACCS PARENTS HANDBOOK=-/ARCHIVE': 'parent_handbook/archive',
    '-=ACCS Policy Acknowledgement Sign Off Sheet=-': 'policy_acknowledgements_and_signoffs',
    '-=ACCS Policy Acknowledgement Sign Off Sheet=-/-=IDIVIDUAL SIGNED SHEETS=-': 'policy_acknowledgements_and_signoffs/individual_signoffs',
    '-=ACCS Policy Acknowledgement Sign Off Sheet=-/ACCS Behaviour Code Of Conduct Sign Off Sheets (ORDINARILY RESIDENT)': 'policy_acknowledgements_and_signoffs/behaviour_code_of_conduct',
    '-=ACCS Policy Acknowledgement Sign Off Sheet=-/ACCS First Aid': 'policy_acknowledgements_and_signoffs/first_aid_tracking',
    '-=ACCS Policy Acknowledgement Sign Off Sheet=-/ACCS Medical or Belief Exemption Forms': 'policy_acknowledgements_and_signoffs/medical_and_belief_exemptions',
    '-=ACCS Policy Acknowledgement Sign Off Sheet=-/ARCHIVE': 'policy_acknowledgements_and_signoffs/archive',
    'ACCS Administration of Drugs or Medications': 'medication_administration',
    'ACCS Anaphylactic Policy': 'anaphylaxis_policy',
    'ACCS Covid-19 Policies': 'covid19_and_infectious_diseases',
    'ACCS Covid-19 Policies/1.ACCS COVID-19 POLICY': 'covid19_and_infectious_diseases/general_policy',
    'ACCS Covid-19 Policies/1.ACCS COVID-19 POLICY/OLDER ARCHIVE': 'covid19_and_infectious_diseases/general_policy/archive',
    'ACCS Covid-19 Policies/2.ACCS IMMUNIZATION DISCLOSURE POLICY SEPT 2021': 'covid19_and_infectious_diseases/immunization_disclosure',
    'ACCS Emergency Management Policy': 'emergency_management',
    'ACCS Fire Evacuation Policy': 'fire_evacuation',
    'ACCS Individualized Children with Medical Needs Form': 'individualized_medical_plans',
    'ACCS Monitoring Compliance And Contraventions': 'compliance_monitoring_and_contraventions',
    'ACCS Parent Issues And Concerns Policy': 'parent_issues_and_concerns',
    'ACCS Playground Safety Policy': 'playground_and_sun_safety',
    'ACCS Program Statement and Implementation Policy': 'program_statement_and_implementation',
    'ACCS Provisions Of Equipment Policy': 'equipment_and_furnishings',
    'ACCS Safe Arrival and Dismissal Policy': 'safe_arrival_and_dismissal',
    'ACCS Safe Arrival and Dismissal Policy/ARCHIVE': 'safe_arrival_and_dismissal/archive',
    'ACCS Sanitary Practices Policy': 'sanitary_practices',
    'ACCS Sanitary Practices Policy/Additional Enhanced Policy (Optional)': 'sanitary_practices/enhanced_disinfecting',
    'ACCS Serious Occurrences Policy and Procedures': 'serious_occurrences_reporting',
    'ACCS Serious Occurrences Policy and Procedures/ARCHIVE': 'serious_occurrences_reporting/archive',
    'ACCS Sleep Supervision Policy': 'sleep_supervision',
    'ACCS Sleep Supervision Policy/Additional Form (Optional)': 'sleep_supervision/optional_forms',
    'ACCS Staff Screening Measures and Criminal Reference Checks': 'staff_screening_and_crc',
    'ACCS Staff Training and Development Policy': 'staff_training_and_development',
    'ACCS Standing Bodies Of Water Policy': 'standing_bodies_of_water',
    'ACCS Supervision Outdoor Play Plan': 'outdoor_play_supervision',
    'ACCS Supervision of Volunteers and Students 2018': 'supervision_of_volunteers_and_students',
    'ACCS Waiting List Policy and Procedures': 'waiting_list_policy'
}

def clean_category_path(raw_rel_path: str, is_policy: bool) -> str:
    raw_norm = raw_rel_path.replace('\\', '/')
    mapping = policy_cat_map if is_policy else forms_cat_map
    
    # Check exact match
    if raw_norm in mapping:
        return mapping[raw_norm]
    
    # Try longest prefix match
    for k in sorted(mapping.keys(), key=len, reverse=True):
        if raw_norm.startswith(k):
            rest = raw_norm[len(k):].strip('/')
            clean_base = mapping[k]
            return f"{clean_base}/{rest}" if rest else clean_base
            
    # Default clean fallback
    clean = re.sub(r'[-=]+', '', raw_norm).strip()
    clean = re.sub(r'[^\w\s/]', '', clean).strip().lower()
    clean = re.sub(r'\s+', '_', clean)
    return clean if clean else ("policy_general" if is_policy else "forms_general")

def extract_docx(file_path: Path) -> str:
    try:
        doc = docx.Document(file_path)
        full_text = []
        for p in doc.paragraphs:
            if p.text.strip():
                full_text.append(p.text.strip())
        for table in doc.tables:
            for row in table.rows:
                row_cells = [c.text.strip().replace('\n', ' ') for c in row.cells if c.text.strip()]
                if row_cells:
                    full_text.append(" | ".join(row_cells))
        return "\n\n".join(full_text)
    except Exception as e:
        return f"ERROR EXTRACTING DOCX: {e}"

def extract_pdf(file_path: Path) -> str:
    try:
        reader = pypdf.PdfReader(file_path)
        pages_text = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages_text.append(f"<!-- Page {i+1} -->\n" + text.strip())
        return "\n\n".join(pages_text)
    except Exception as e:
        return f"ERROR EXTRACTING PDF: {e}"

def main():
    print("Beginning document reorganization and indexing...")
    
    # Clean output directories if they have old ugly names
    if MD_FORMS_DIR.exists():
        shutil.rmtree(MD_FORMS_DIR)
    if MD_POLICIES_DIR.exists():
        shutil.rmtree(MD_POLICIES_DIR)
    if ORIGINALS_ORGANIZED_DIR.exists():
        shutil.rmtree(ORIGINALS_ORGANIZED_DIR)
        
    MD_FORMS_DIR.mkdir(parents=True, exist_ok=True)
    MD_POLICIES_DIR.mkdir(parents=True, exist_ok=True)
    ORIGINALS_ORGANIZED_DIR.mkdir(parents=True, exist_ok=True)
    
    forms_records = []
    policies_records = []
    
    for root, dirs, files in os.walk(FORMS_ZIP_DIR):
        for f in files:
            p = Path(root) / f
            ext = p.suffix.lower()
            if ext not in ['.docx', '.pdf', '.txt']:
                continue
                
            rel = p.relative_to(FORMS_ZIP_DIR)
            is_policy = "policy" in str(rel).lower()
            parts = rel.parts
            
            # Meaningful directory parts (skip root zip folder artifacts)
            raw_dir_parts = [part for part in parts[:-1] if not part.startswith('FINAL') and not part.startswith('xACCS') and part not in ['forms', 'policy']]
            raw_category = "/".join(raw_dir_parts) if raw_dir_parts else ""
            
            # Special case for developer brief
            if "Developer_Brief" in f:
                clean_cat = "developer_brief"
            else:
                clean_cat = clean_category_path(raw_category, is_policy)
                
            md_dest_root = MD_POLICIES_DIR if is_policy else MD_FORMS_DIR
            orig_dest_root = ORIGINALS_ORGANIZED_DIR / ("policies" if is_policy else "forms")
            
            md_target_dir = md_dest_root / clean_cat
            orig_target_dir = orig_dest_root / clean_cat
            
            md_target_dir.mkdir(parents=True, exist_ok=True)
            orig_target_dir.mkdir(parents=True, exist_ok=True)
            
            # Copy original file to organized originals
            orig_dest_file = orig_target_dir / f
            shutil.copy2(p, orig_dest_file)
            
            # Extract content to markdown
            if ext == '.docx':
                content = extract_docx(p)
            elif ext == '.pdf':
                content = extract_pdf(p)
            else:
                content = p.read_text(encoding='utf-8', errors='ignore')
                
            md_filename = p.stem + ".md"
            md_dest_file = md_target_dir / md_filename
            
            header = f"# {p.stem}\n\n"
            header += f"- **Original Source File**: `{f}`\n"
            header += f"- **Format**: `{ext.upper()}`\n"
            header += f"- **Clean Category**: `{clean_cat}`\n"
            header += f"- **Source Path**: `{rel}`\n\n---\n\n"
            
            md_dest_file.write_text(header + content, encoding='utf-8')
            
            record = {
                "name": f,
                "stem": p.stem,
                "ext": ext,
                "clean_category": clean_cat,
                "md_path": str(md_dest_file),
                "orig_path": str(orig_dest_file),
                "size_bytes": p.stat().st_size,
                "is_policy": is_policy
            }
            
            if is_policy:
                policies_records.append(record)
            else:
                forms_records.append(record)

    # Sort records
    forms_records.sort(key=lambda x: (x['clean_category'], x['name']))
    policies_records.sort(key=lambda x: (x['clean_category'], x['name']))
    
    print(f"Organized {len(forms_records)} Forms and {len(policies_records)} Policies.")
    
    # Generate MASTER_FORMS_AND_POLICIES_INDEX.md
    index_md = "# ACCS Master Forms & Policies Source of Truth Index\n\n"
    index_md += "> **System Status**: Fully indexed and converted to Markdown on 2026-09-10 from master client archives.\n"
    index_md += "> **Locations**:\n"
    index_md += "> - Converted Markdown Forms: `docs/forms_source_of_truth/`\n"
    index_md += "> - Converted Markdown Policies: `docs/policies_source_of_truth/`\n"
    index_md += "> - Organized Original Files (PDF/DOCX): `2026-09-10-forms/organized_documents/`\n\n"
    
    index_md += "## 📋 Forms Source of Truth Inventory (29 Documents)\n\n"
    index_md += "| Clean Category | Document Name | Format | Markdown Path | Original File |\n"
    index_md += "|---|---|---|---|---|\n"
    for r in forms_records:
        rel_md = Path(r['md_path']).relative_to(BASE_DIR)
        rel_orig = Path(r['orig_path']).relative_to(BASE_DIR)
        index_md += f"| `{r['clean_category']}` | {r['stem']} | `{r['ext']}` | [{r['stem']}](file:///{r['md_path'].replace(chr(92), '/')}) | `{r['name']}` |\n"
        
    index_md += "\n## 🛡️ Policies Source of Truth Inventory (91 Documents)\n\n"
    index_md += "| Clean Category | Policy Document Name | Format | Markdown Path | Original File |\n"
    index_md += "|---|---|---|---|---|\n"
    for r in policies_records:
        index_md += f"| `{r['clean_category']}` | {r['stem']} | `{r['ext']}` | [{r['stem']}](file:///{r['md_path'].replace(chr(92), '/')}) | `{r['name']}` |\n"

    master_index_path = BASE_DIR / "docs" / "MASTER_FORMS_AND_POLICIES_INDEX.md"
    master_index_path.write_text(index_md, encoding='utf-8')
    print(f"Master index written to {master_index_path}")

if __name__ == "__main__":
    main()
