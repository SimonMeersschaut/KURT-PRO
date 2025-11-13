import os
import json
import shutil
import pathlib
import subprocess
import glob
from js_concat import to_js_concatenation

# Define directories and file names
DIST_DIR = "dist"
BUILD_DIR = "build"
CHROME_ZIP_FILENAME = "KURT_PRO_chrome_extention"
USERSCRIPT_FILENAME = "KURT_PRO_userscript.user.js"

def get_version():
    with open("package.json") as f:
        data = json.load(f)
        return data["version"]

def get_asset_files(build_dir):
    manifest_path = os.path.join(build_dir, "asset-manifest.json")
    with open(manifest_path) as f:
        manifest = json.load(f)
    
    main_js = manifest["files"]["main.js"]
    main_css = manifest["files"]["main.css"]

    with open(os.path.join(build_dir, main_css[1:])) as f:
        css_content = f.read()
    
    with open(os.path.join(build_dir, main_js[1:])) as f:
        js_content = f.read()
        
    return css_content, js_content

def create_userscript(version, build_dir):
    script = create_script(version, build_dir)

    with open(os.path.join(DIST_DIR, USERSCRIPT_FILENAME), 'w') as f:
        f.write(script)

def create_script(version, build_dir):
    print("Creating Userscript...")
    
    css_content, js_content = get_asset_files(build_dir)

    with open("src/userscript.js", "r") as f:
        userscript_template = f.read()
    
    userscript_header = userscript_template.split('// ==/UserScript==')[0] + '// ==/UserScript=='
    userscript_header = userscript_header.replace("$VERSION$", version)

    # Escape for single-quoted JS string

    with open("inject.js", 'r') as f:
        userscript_body = f.read()\
            .replace('"{CSS_CONTENT}"', to_js_concatenation(css_content.split('\n')[0])) \
            .replace('"{JS_CONTENT}"', to_js_concatenation(js_content.split('\n')[1]))

    return userscript_header + '\n' + userscript_body


def create_extension(version, build_dir):
    print("Creating development extension...")
    
    dev_dir = os.path.join(DIST_DIR, "dev")
    os.makedirs(dev_dir, exist_ok=True)
    
    with open("dist/dev/main.js", 'w+') as f:
        f.write(create_script(version, build_dir))
    
    # Copy manifest and other resources
    shutil.copy("src/manifest.json", os.path.join(dev_dir, "manifest.json"))
    for filename in glob.glob("resources/extension/*.*"):
        name = pathlib.Path(filename).name
        shutil.copy(filename, os.path.join(dev_dir, name))


def main():
    print("Building artifacts...")
    
    # 1. Clean up
    if os.path.exists(DIST_DIR):
        shutil.rmtree(DIST_DIR)
    os.makedirs(DIST_DIR)

    # 2. Get version
    version = get_version()
    print(f"Version: {version}")

    # 3. Build React app
    print("Running npm run build...")
    # It's assumed this is run before the script
    subprocess.run("npm run build", check=True, shell=True)

    # 4. Create Userscript
    create_userscript(version, BUILD_DIR)
    
    # 5. Create development version of the extension
    create_extension(version, BUILD_DIR)
    
    # 6. Create Chrome Extension zip (optional)
    # print("Creating Chrome extension zip...")
    # shutil.make_archive(os.path.join(DIST_DIR, CHROME_ZIP_FILENAME), 'zip', os.path.join(DIST_DIR, "dev"))
    
    print("Artifacts built successfully.")

if __name__ == "__main__":
    main()
