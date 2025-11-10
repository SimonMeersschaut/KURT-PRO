import os
import json
import shutil
import pathlib
import subprocess
import glob

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
    print("Creating Userscript...")
    
    css_content, js_content = get_asset_files(build_dir)

    with open("src/userscript.js", "r") as f:
        userscript_template = f.read()
    
    userscript_header = userscript_template.split('// ==/UserScript==')[0] + '// ==/UserScript=='
    userscript_header = userscript_header.replace("$VERSION$", version)

    # Escape for single-quoted JS string
    css_content_escaped = css_content.replace('\\', '\\\\').replace("'", "\'\'")
    js_content_escaped = js_content.replace('\\', '\\\\').replace("'", "\'\'")

    with open("inject.js", 'r') as f:
        userscript_body = f.read()\
            .replace("{CSS_CONTENT}", css_content_escaped) \
            .replace("{JS_CONTENT}", js_content_escaped)

    userscript_full_content = userscript_header + '\n' + userscript_body
    
    with open(os.path.join(DIST_DIR, USERSCRIPT_FILENAME), 'w') as f:
        f.write(userscript_full_content)

def create_extension(build_dir):
    print("Creating development extension...")
    
    dev_dir = os.path.join(DIST_DIR, "dev")
    os.makedirs(dev_dir, exist_ok=True)
    
    css_content, js_content = get_asset_files(build_dir)
    
    # Write app.js and app.css
    with open(os.path.join(dev_dir, "app.js"), 'w') as f:
        f.write(js_content)
    with open(os.path.join(dev_dir, "app.css"), 'w') as f:
        f.write(css_content)
        
    # Copy content script
    shutil.copy("inject_extension.js", os.path.join(dev_dir, "main.js"))
    
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
    create_extension(BUILD_DIR)
    
    # 6. Create Chrome Extension zip (optional)
    # print("Creating Chrome extension zip...")
    # shutil.make_archive(os.path.join(DIST_DIR, CHROME_ZIP_FILENAME), 'zip', os.path.join(DIST_DIR, "dev"))
    
    print("Artifacts built successfully.")

if __name__ == "__main__":
    main()
