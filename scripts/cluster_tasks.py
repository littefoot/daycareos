import json

with open('scripts/firestore_developer_notes.json', 'r', encoding='utf-8') as f:
    notes = json.load(f)

with open('scripts/notes_dump_utf8.txt', 'w', encoding='utf-8') as out:
    for i, n in enumerate(notes, 1):
        topic = n.get('topic', '')
        queries = n.get('originalQueries', [])
        summary = n.get('summary', '')
        cat = n.get('category', '')
        out.write(f"=== {i:2d}. [{cat}] {topic} ===\n")
        out.write(f"ID: {n.get('id')} | Status: {n.get('status')} | Priority: {n.get('priority')}\n")
        out.write(f"Summary: {summary}\n")
        if queries:
            out.write(f"Queries ({len(queries)}):\n")
            for q in queries:
                out.write(f"  * {q}\n")
        out.write("\n")
print("Done writing scripts/notes_dump_utf8.txt")
