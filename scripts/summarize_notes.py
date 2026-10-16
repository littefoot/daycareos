import json
import os

with open('scripts/firestore_developer_notes.json', 'r', encoding='utf-8') as f:
    notes = json.load(f)

print(f"Total notes loaded: {len(notes)}")

by_category = {}
by_status = {}
by_priority = {}

for n in notes:
    cat = n.get('category', 'unknown')
    status = n.get('status', 'unknown')
    pri = n.get('priority', 'unknown')
    by_category[cat] = by_category.get(cat, 0) + 1
    by_status[status] = by_status.get(status, 0) + 1
    by_priority[pri] = by_priority.get(pri, 0) + 1

print("\n--- By Status ---")
for k, v in sorted(by_status.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")

print("\n--- By Priority ---")
for k, v in sorted(by_priority.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")

print("\n--- By Category ---")
for k, v in sorted(by_category.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")

print("\n--- All 58 Curated Notes ---")
for i, n in enumerate(notes, 1):
    topic = n.get('topic', 'Untitled')
    status = n.get('status', 'N/A')
    cat = n.get('category', 'N/A')
    pri = n.get('priority', 'N/A')
    print(f"{i:2d}. [{status.upper()}] [{pri.upper()}] [{cat}] {topic}")
