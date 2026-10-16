import re
import json

HTML_PATH = r"C:\Users\jared\.gemini\antigravity-ide\brain\497604ae-2b67-4f1e-822a-9c57d4c824a2\.system_generated\steps\13\content.md"

with open(HTML_PATH, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

print(f"Total HTML length: {len(text)} characters")

# Find images
images = re.findall(r'https?://[^\s"\'<>]+\.(?:png|jpg|jpeg|svg|webp|ico)', text, re.IGNORECASE)
print(f"Found {len(images)} image URLs:")
for img in sorted(set(images)):
    if "allchildcaresolutions" in img:
        print("  -", img)

# Find hex colors
hexes = set(re.findall(r'#(?:[0-9a-fA-F]{3}){1,2}\b', text))
print(f"\nHex Colors ({len(hexes)}):", sorted(list(hexes))[:20])

# Find CSS variables
vars_found = set(re.findall(r'--[a-zA-Z0-9_-]+', text))
print(f"\nCSS Variables ({len(vars_found)}):", list(vars_found)[:20])

# Find Fonts
fonts = set(re.findall(r'font-family:\s*([^;\}]+)', text, re.IGNORECASE))
print(f"\nFonts ({len(fonts)}):", fonts)
