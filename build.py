import os
import zipfile

# Define directories and file names
SRC_DIR = "src"
OUTPUT_DIR = "dist"
SAFARI_FILE = os.path.join(OUTPUT_DIR, "safari_extension.js")
CHROME_ZIP = os.path.join(OUTPUT_DIR, "chrome_extension.zip")
MANIFEST = os.path.join(SRC_DIR, "manifest.json")

"""
Initialize the working directory with a `dist` folder.
"""
def setup():
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

"""
This function returns the content of a single javascript file.
"""
def script_content():
    # Bundle all .js files into one single file for Safari
    for fname in os.listdir(SRC_DIR):
        if fname.endswith(".js"):
            with open(os.path.join(SRC_DIR, fname), 'r') as f:
                output += f.read()

"""
This function will create a zip file with a script and a manifest file.
"""
def create_chrome_extention(script_path:str, manifest_path:str):
    # Package the Chrome extension: include the manifest & all js files
    with zipfile.ZipFile(CHROME_ZIP, "w") as zipf:
        # Add manifest.json at the root of the zip
        zipf.write(manifest_path)
        # Add the javascript file
        zipf.write(script_path)

if __name__ == '__main__':
    print("Building Artifacts.") 
    setup()
    # write dist output
    # write safari extention (.js file)
    with open(SAFARI_FILE, 'w+') as f:
        f.write(script_content())
    # write chrome extention (.zip file)
    create_chrome_extention(SAFARI_FILE, MANIFEST)
    print("Artifacts built successfully.")