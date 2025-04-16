import os
import zipfile
import glob

# Define directories and file names
SRC_DIR = "src"
OUTPUT_DIR = "dist"
SAFARI_FILE = os.path.join(OUTPUT_DIR, "KURT_PRO_safari_extension.js")
CHROME_ZIP = os.path.join(OUTPUT_DIR, "KURT_PRO_chrome_extention.zip")
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
    output = ""

    # Read css files and append to .js script
    for filename in glob.glob("src/*.css"):
        with open(filename, 'r') as f:
            var_name = filename.split('/')[-1].split('\\')[-1].replace('.', '_')
            output += f"""const {var_name} = "{f.read().replace('\n', '')}";\n"""
    
    # Paste all .js files after one another
    for filename in glob.glob("src/*.js"):
        with open(filename, 'r') as f:
            output += f.read()
            
    return output

"""
This function will create a zip file with a script and a manifest file.
"""
def create_chrome_extention(script_path:str, manifest_path:str):
    # Package the Chrome extension: include the manifest & all js files
    with zipfile.ZipFile(CHROME_ZIP, "w") as zipf:
        # Add manifest.json at the root of the zip
        zipf.write(manifest_path, arcname="manifest.json")
        # Add the javascript file
        zipf.write(script_path, arcname="main.js")
        # Add the logo
        zipf.write(os.path.join(SRC_DIR, "logo.png"), arcname="logo.png")


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