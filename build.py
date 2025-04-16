import os
import zipfile

# Define directories and file names
SRC_DIR = "src"
OUTPUT_DIR = "dist"
SAFARI_FILE = os.path.join(OUTPUT_DIR, "safari_extension.js")
CHROME_ZIP = os.path.join(OUTPUT_DIR, "chrome_extension.zip")
MANIFEST = os.path.join(SRC_DIR, "manifest.json")

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Bundle all .js files into one single file for Safari
with open(SAFARI_FILE, "w") as outfile:
    for fname in sorted(os.listdir(SRC_DIR)):
        if fname.endswith(".js"):
            with open(os.path.join(SRC_DIR, fname)) as f:
                outfile.write(f"\n// --- {fname} ---\n")
                outfile.write(f.read())

# Package the Chrome extension: include the manifest & all js files
with zipfile.ZipFile(CHROME_ZIP, "w") as zipf:
    # Add manifest.json at the root of the zip
    zipf.write(MANIFEST)
    # Add each JavaScript file from src folder
    for fname in os.listdir(SRC_DIR):
        if fname.endswith(".js"):
            zipf.write(os.path.join(SRC_DIR, fname), arcname=fname)

print("Artifacts built successfully.")