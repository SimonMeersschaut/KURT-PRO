import os
import json
import shutil

# Define directories and file names
SRC_DIR = "src"
DIST_DIR = "dist"
BUILD_DIR = os.path.join(DIST_DIR, "build")
SAFARI_FILENAME = "KURT_PRO_userscript.user.js"
CHROME_ZIP_FILENAME = "KURT_PRO_chrome_extention.zip"
LOGO_FILENAME = "48x48.png"

# read current version
with open("VERSION") as f:
    VERSION = f.read()

with open(os.path.join(SRC_DIR, "data", "userscript.js"), "r") as f:
    USER_SCRIPT_DOCS = f.read()
# replace the version with the current version
USER_SCRIPT_DOCS = USER_SCRIPT_DOCS.replace("$VERSION$", VERSION)

"""
Initialize the working directory with a `dist` folder.
"""
def setup():
    # Create output directory
    os.makedirs(DIST_DIR, exist_ok=True)
    os.makedirs(BUILD_DIR, exist_ok=True)

"""
This function will create a folder with a script and a manifest file.
"""
def create_chrome_extention(script_path:str, manifest_path:str):
    # Package the Chrome extension: include the manifest & all js files

    # Copy javascript file to the output directory
    shutil.copy(script_path, os.path.join(BUILD_DIR, "main.js"))

    # Read manifest data
    with open(manifest_path, 'r') as f:
        manifest_data = json.load(f)
    manifest_data['version'] = VERSION
    # Write manifest file to the output directory
    with open(os.path.join(BUILD_DIR, "manifest.json"), 'w') as f:
        json.dump(manifest_data, f)
    # Copy the logo image
    shutil.copy(
        os.path.join(SRC_DIR, "images/logo", LOGO_FILENAME),
        os.path.join(BUILD_DIR, LOGO_FILENAME)
    )

if __name__ == '__main__':
    print("Building Artifacts.") 
    setup()
    # write dist output
    # write user-script safari extention (.js file)
    with open(os.path.join(DIST_DIR, SAFARI_FILENAME), 'w+') as f:
        f.write(USER_SCRIPT_DOCS + script_content())
    
    # write chrome extention (.zip file)
    create_chrome_extention(
        os.path.join(DIST_DIR, SAFARI_FILENAME),
        os.path.join(SRC_DIR, "data", "manifest.json")
    )

    # Create a zip file for the Chrome extension
    shutil.make_archive(
        os.path.join(DIST_DIR, CHROME_ZIP_FILENAME).split(".zip")[0],
        'zip',
        "dist/build")
    print("Artifacts built successfully.")
