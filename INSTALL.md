# Installation Guide for KURT-PRO

This guide provides instructions on how to install the KURT-PRO browser extension on different browsers.

## For Chrome and Chromium-based Browsers (e.g., Edge, Brave)

You can install KURT-PRO as an unpacked extension. This is the recommended method for the best experience.

### From a Release (Recommended)

1.  **Download the latest release:** Go to the [Releases page](https://github.com/your-repo/kurt-pro/releases) of the project.
2.  **Download the ZIP file:** Find the latest release and download the `KURT_PRO_chrome_extension.zip` file.
3.  **Unzip the file:** Extract the contents of the downloaded ZIP file into a permanent folder on your computer (e.g., `Documents/KURT-PRO`).

### Loading the Extension in Chrome

1.  **Open Chrome's Extensions page:** Open a new tab and navigate to `chrome://extensions`.
2.  **Enable Developer Mode:** In the top-right corner of the Extensions page, toggle the "Developer mode" switch to the "on" position.
3.  **Load the extension:**
    *   Click the "Load unpacked" button that appears on the top-left.
    *   In the file dialog, navigate to the folder where you unzipped the release files.
    *   Select the `build` directory and click "Select Folder".

The KURT-PRO extension should now be installed and active in your browser.

## For Safari, Firefox, and other browsers (via Userscript)

You can use a userscript manager extension to run KURT-PRO. We recommend using [Tampermonkey](https://www.tampermonkey.net/).

### 1. Install a Userscript Manager

*   **Safari:** Install [Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887) from the App Store.

### 2. Install the KURT-PRO Userscript

1.  **Get the script:**
    *   Go to the [Releases page](https://github.com/your-repo/kurt-pro/releases).
    *   Download the `KURT_PRO_userscript.user.js` file from the latest release.
2.  **Install the script in Tampermonkey:**
    *   Open the Tampermonkey dashboard in your browser.
    *   Go to the "Utilities" tab.
    *   Under "Import from file", choose the `KURT_PRO_userscript.user.js` file you downloaded.
    *   Click "Install" to add the script.

## How to Use KURT-PRO

After successfully installing the extension or userscript, navigate to the KU Leuven KURT reservation page (`kurt3.ghum.kuleuven.be`). You should see a custom page.


---

*This documentation provides a general guide. The exact steps might vary slightly depending on your browser and operating system.*
