import os
import glob
import shutil

# Define directories and file names
SRC_DIR = "src"
DIST_DIR = "dist"
BUILD_DIR = os.path.join(DIST_DIR, "build")
SAFARI_FILENAME = "KURT_PRO_safari_extension.js"
CHROME_ZIP_FILENAME = "KURT_PRO_chrome_extention.zip"
LOGO_FILENAME = "logo.png"

"""
Initialize the working directory with a `dist` folder.
"""
def setup():
    # Create output directory
    os.makedirs(DIST_DIR, exist_ok=True)
    os.makedirs(BUILD_DIR, exist_ok=True)

"""
This function returns the content of a single javascript file.
"""
def script_content():
    # Bundle all .js files into one single file for Safari
    output = ""

    # Read css files and append to .js script
    for filename in glob.glob("src/styles/*.css"):
        with open(filename, 'r') as f:
            var_name = filename.split('/')[-1].split('\\')[-1].replace('.', '_')
            output += f"""const {var_name} = "{f.read().replace('\n', '').replace('"', '\\"')}";\n"""
    
    # Paste all .js files after one another
    script_files = glob.glob("src/scripts/*.js") + glob.glob("src/scripts/*/*.js")
    for filename in script_files:
        with open(filename, 'r') as f:
            output += f.read() + "\n"
            
    return output

"""
This function will create a folder with a script and a manifest file.
"""
def create_chrome_extention(script_path:str, manifest_path:str):
    # Package the Chrome extension: include the manifest & all js files

    # Copy javascript file to the output directory
    shutil.copy(script_path, os.path.join(BUILD_DIR, "main.js"))
    # Copy manifest file to the output directory
    shutil.copy(manifest_path, BUILD_DIR)
    # Copy the logo image
    shutil.copy(
        os.path.join(SRC_DIR, "images", LOGO_FILENAME),
        os.path.join(BUILD_DIR, LOGO_FILENAME)
    )

if __name__ == '__main__':
    print("Building Artifacts.") 
    setup()
    # write dist output
    # write safari extention (.js file)
    with open(os.path.join(DIST_DIR, SAFARI_FILENAME), 'w+') as f:
        f.write(script_content())
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
