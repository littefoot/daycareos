import os
import requests
import json

BUCKET = "accs-hub.firebasestorage.app"
UPLOAD_URL = f"https://firebasestorage.googleapis.com/v0/b/{BUCKET}/o"

assets_dir = "brand/assets"

files_to_upload = [
    {"local": "woman-playing-and-supporting-a-girl-2.webp", "remote": "providers/fatima_headshot.webp"},
    {"local": "cute-little-girls-siblings-having-fun-on-playgroun-2023-11-27-04-52-43-utc-square.jpg", "remote": "providers/maria_headshot.jpg"},
    {"local": "group-of-small-nursery-school-children-sitting-on-2023-11-27-04-49-11-utc.jpg", "remote": "providers/grace_headshot.jpg"},
    {"local": "baby-girl-swings-on-yellow-paralon-duck-at-kinderg-2023-11-27-05-36-51-utc.jpg", "remote": "providers/elena_headshot.jpg"},
    {"local": "boy-and-girl-are-holding-watermelon-shaped-lollipo-2023-11-27-05-26-30-utc.jpg", "remote": "children/lucas_tremblay.jpg"},
    {"local": "three-kids-playing-in-foam-pit-2023-11-27-05-07-03-utc.jpg", "remote": "children/maya_tremblay.jpg"},
    {"local": "high-angle-view-of-smiling-african-american-boy.jpg", "remote": "children/noah_sterling.jpg"},
    {"local": "kids-playing-after-eating-with-plates-and-utensiles-1080.webp", "remote": "children/chloe_dupont.webp"},
    {"local": "Asset-2ACCS-Logo-Favicon-Orange_002.png", "remote": "branding/accs_logo_orange.png"},
    {"local": "Asset-4ACCS-Logo-Orange-lines_001.png", "remote": "branding/accs_logo_horizontal.png"}
]

print(f"Uploading assets to Firebase Storage bucket: {BUCKET}...")

uploaded_urls = {}

for item in files_to_upload:
    local_path = os.path.join(assets_dir, item["local"])
    if not os.path.exists(local_path):
        print(f"Skipping {local_path} (not found)")
        continue
    
    with open(local_path, "rb") as f:
        file_data = f.read()

    content_type = "image/webp" if item["local"].endswith(".webp") else "image/png" if item["local"].endswith(".png") else "image/jpeg"
    
    remote_encoded = requests.utils.quote(item["remote"], safe="")
    target_url = f"{UPLOAD_URL}?uploadType=media&name={remote_encoded}"
    
    headers = {"Content-Type": content_type}
    resp = requests.post(target_url, data=file_data, headers=headers)
    
    if resp.status_code == 200:
        download_url = f"https://firebasestorage.googleapis.com/v0/b/{BUCKET}/o/{remote_encoded}?alt=media"
        uploaded_urls[item["remote"]] = download_url
        print(f"[OK] Uploaded {item['remote']} -> {download_url}")
    else:
        print(f"[ERROR] Failed {item['remote']}: {resp.status_code} {resp.text}")

with open("uploaded_storage_urls.json", "w") as out:
    json.dump(uploaded_urls, out, indent=2)

print("\nDone! Saved URLs to uploaded_storage_urls.json")
