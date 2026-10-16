import os
import re
import json
import subprocess
import urllib.parse

HTML_CACHE_PATH = r"C:\Users\jared\.gemini\antigravity-ide\brain\497604ae-2b67-4f1e-822a-9c57d4c824a2\.system_generated\steps\13\content.md"
OUTPUT_DIR = r"C:\Projects\allchildcaresolutions\brand"
ASSETS_DIR = os.path.join(OUTPUT_DIR, "assets")

os.makedirs(ASSETS_DIR, exist_ok=True)

print(f"Reading HTML from {HTML_CACHE_PATH}...")
with open(HTML_CACHE_PATH, "r", encoding="utf-8", errors="ignore") as f:
    html_content = f.read()

# 1. Extract Images
img_srcs = set(re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html_content))
bg_images = set(re.findall(r'url\(["\']?(https?://[^"\')]+\.(?:png|jpg|jpeg|svg|webp))["\']?\)', html_content))
favicons = set(re.findall(r'<link[^>]+rel=["\'](?:icon|shortcut icon|apple-touch-icon)["\'][^>]+href=["\']([^"\']+)["\']', html_content))
og_images = set(re.findall(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html_content))

all_images = img_srcs.union(bg_images).union(favicons).union(og_images)

# Filter for allchildcaresolutions uploads
brand_images = []
for url in all_images:
    if "allchildcaresolutions.com/wp-content/uploads" in url:
        brand_images.append(url)

print(f"Found {len(brand_images)} unique brand image URLs.")

downloaded_assets = {}
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

for url in sorted(brand_images):
    filename = os.path.basename(urllib.parse.urlparse(url).path)
    if not filename:
        continue
    filepath = os.path.join(ASSETS_DIR, filename)
    cmd = [
        "curl.exe", "-s", "-L",
        "-A", user_agent,
        url,
        "-o", filepath
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
            file_size = os.path.getsize(filepath)
            print(f"  [OK] Downloaded: {filename} ({file_size:,} bytes)")
            downloaded_assets[filename] = {
                "url": url,
                "local_path": filepath,
                "relative_path": f"brand/assets/{filename}",
                "size_bytes": file_size
            }
        else:
            print(f"  [WARN] Empty download for {url}")
    except Exception as e:
        print(f"  [ERROR] Failed to download {url}: {e}")

# 2. Extract Elementor Global Styles & Color Palette
# Find Elementor post-21.css or inline global tokens
e_global_colors = {}
color_matches = re.findall(r'--e-global-color-([a-zA-Z0-9]+):\s*([^;\}]+)', html_content)
for k, v in color_matches:
    e_global_colors[k] = v.strip()

# Find specific theme colors
hex_colors = set(re.findall(r'#(?:[0-9a-fA-F]{3}){1,2}\b', html_content))

# 3. Extract Typography tokens
google_fonts = set(re.findall(r'fonts\.googleapis\.com/css2?\?family=([^"\'&]+)', html_content))
font_families = set(re.findall(r'font-family:\s*([^;\}]+)', html_content))

print(f"\n--- Extraction Summary ---")
print(f"Successfully downloaded {len(downloaded_assets)} brand media files.")
print(f"Detected Google Fonts: {google_fonts}")

metadata = {
    "target_url": "https://allchildcaresolutions.com/",
    "brand_name": "All Child Care Solutions Inc.",
    "downloaded_assets": downloaded_assets,
    "global_colors": e_global_colors,
    "unique_hexes": sorted(list(hex_colors)),
    "font_families": sorted(list(font_families))
}

with open(os.path.join(OUTPUT_DIR, "brand_extraction_report.json"), "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)

print("Extraction report saved successfully.")
