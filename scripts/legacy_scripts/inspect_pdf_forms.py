import os
import pypdf
import json

FORMS_DIR = r"C:\Projects\allchildcaresolutions\docs\PARENTS FORMS"

pdf_files = sorted([f for f in os.listdir(FORMS_DIR) if f.endswith('.pdf')])

results = {}

for filename in pdf_files:
    filepath = os.path.join(FORMS_DIR, filename)
    try:
        reader = pypdf.PdfReader(filepath)
        text_content = ""
        for i, page in enumerate(reader.pages):
            text_content += f"\n--- Page {i+1} ---\n" + (page.extract_text() or "")
        
        results[filename] = {
            "num_pages": len(reader.pages),
            "text_snippet": text_content[:1500]
        }
        print(f"Read: {filename} ({len(reader.pages)} pages, {len(text_content)} chars)")
    except Exception as e:
        print(f"Error reading {filename}: {e}")

with open(r"C:\Projects\allchildcaresolutions\docs\extracted_forms_summary.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("\nSaved summary to docs/extracted_forms_summary.json")
