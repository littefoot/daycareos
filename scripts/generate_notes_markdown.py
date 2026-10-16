import json

with open('scripts/firestore_developer_notes.json', 'r', encoding='utf-8') as f:
    notes = json.load(f)

# Sort notes: first by category, then by status priority, then by id
status_order = {'urgent': 0, 'high': 1, 'medium': 2, 'low': 3}
cat_order = {'policies_legal': 0, 'ratio_compliance': 1, 'intake_pipeline': 2, 'portal_ui': 3, 'ai_feature': 4, 'general': 5}

category_labels = {
    'policies_legal': '⚖️ Ontario Legal & Ministry Policies (CCEYA)',
    'ratio_compliance': '📐 Ratio, Capacity & Headcount Compliance',
    'intake_pipeline': '👨‍👩‍👧 Parent Admissions & Intake Pipeline',
    'portal_ui': '🖥️ Portal UI, Workflows & Timesheets',
    'ai_feature': '🤖 AI Assistant, Models & Forms Engine',
    'general': '🏢 General Operations & Branding'
}

notes.sort(key=lambda n: (cat_order.get(n.get('category'), 99), status_order.get(n.get('priority'), 99), n.get('topic', '')))

out = []
out.append("# All Child Care Solutions (ACCS) — 58 Curated Notes & Requirements Backlog\n")
out.append("> **Live Source**: Cloud Firestore `developer_notes` collection (Project: `accs-hub`)\n")
out.append(f"> **Total Curated Items**: {len(notes)} items | **Raw Chat Sync**: 111 interactions\n\n")

# Summary Dashboard
by_cat = {}
by_status = {}
by_pri = {}
for n in notes:
    by_cat[n.get('category', 'unknown')] = by_cat.get(n.get('category'), 0) + 1
    by_status[n.get('status', 'unknown')] = by_status.get(n.get('status'), 0) + 1
    by_pri[n.get('priority', 'unknown')] = by_pri.get(n.get('priority'), 0) + 1

out.append("## Executive Breakdown\n")
out.append("| Status | Count | Category | Count | Priority | Count |\n")
out.append("|---|---|---|---|---|---|\n")

max_rows = max(len(by_status), len(by_cat), len(by_pri))
st_items = list(by_status.items())
cat_items = list(by_cat.items())
pri_items = list(by_pri.items())

for i in range(max_rows):
    st_str = f"**{st_items[i][0]}**: {st_items[i][1]}" if i < len(st_items) else ""
    cat_str = f"**{cat_items[i][0]}**: {cat_items[i][1]}" if i < len(cat_items) else ""
    pri_str = f"**{pri_items[i][0]}**: {pri_items[i][1]}" if i < len(pri_items) else ""
    out.append(f"| {st_str} | | {cat_str} | | {pri_str} | |\n")

out.append("\n---\n\n")

# Render by Category
curr_cat = None
item_num = 1

for n in notes:
    cat = n.get('category', 'general')
    if cat != curr_cat:
        curr_cat = cat
        label = category_labels.get(cat, cat.replace('_', ' ').title())
        out.append(f"\n## {label} ({by_cat.get(cat, 0)} items)\n\n")
    
    topic = n.get('topic', 'Untitled Requirement')
    status = n.get('status', 'proposed').replace('_', ' ').title()
    priority = n.get('priority', 'medium').upper()
    summary = n.get('summary', 'No summary provided.')
    related = n.get('relatedPastWork', '')
    queries = n.get('originalQueries', [])
    questions = n.get('clarifyingQuestions', [])
    note_id = n.get('id', '')
    last_up = n.get('lastUpdated', '')

    out.append(f"### #{item_num}. {topic}\n")
    out.append(f"- **ID**: `{note_id}` | **Status**: `{status}` | **Priority**: `{priority}` | **Category**: `{cat}`\n")
    out.append(f"- **Summary**: {summary}\n")
    
    if related:
        out.append(f"- **Connection / Context**: {related}\n")
        
    if questions:
        out.append("- **Clarifying Questions to Finalize Scope**:\n")
        for q in questions:
            out.append(f"  - {q}\n")
            
    if queries:
        out.append("- **Traced Client Inquiries / Prompts**:\n")
        for q in queries:
            out.append(f"  - *\"{q}\"*\n")
            
    out.append("\n")
    item_num += 1

markdown_content = "".join(out)

target_path = r'C:\Users\jared\.gemini\antigravity-ide\brain\48150fd2-8b71-4cd9-8a13-c8e4c5d2f1b6\curated_notes_backlog.md'
with open(target_path, 'w', encoding='utf-8') as f:
    f.write(markdown_content)

print(f"Generated comprehensive markdown catalog at: {target_path}")
print(f"Total lines: {len(markdown_content.splitlines())}")
