# G+ TikTok Downloader
<img width="1771" height="921" alt="image" src="https://github.com/user-attachments/assets/bfee5069-6ebb-43d7-8385-a4b634cb534a" />

A lightweight, seamless Tampermonkey userscript that allows you to download TikTok videos and photo slide posts in **High Definition (HD)**, completely **without watermarks**. 

It perfectly mimics the native TikTok UI by injecting a standard download action button right next to the Heart and Comment buttons.

## Features
- 🚀 **HD Downloads:** Automatically fetches the highest quality 1080p source video via the `tikwm.com` API.
- 🚫 **No Watermarks:** Videos are saved completely clean without the bouncing TikTok logo.
- 📸 **Photo Support:** Automatically detects and downloads photo slideshow posts as high-quality images.
- 🎨 **Native UI Integration:** Calculates the exact physical dimensions of the surrounding TikTok action buttons to generate a pixel-perfect, seamless download button.
- 🛡️ **Virtual-DOM Proof:** Uses event delegation and smart DOM traversal to ensure the download button never breaks, even when scrolling infinitely through the "For You Page" (FYP).
- 🏷️ **Clean File Naming:** Automatically renames your downloaded files using the `username-date-title` format.

## Installation

1. Install a userscript manager like **[Tampermonkey](https://www.tampermonkey.net/)** for your browser.
2. Create a new userscript in the Tampermonkey dashboard.
3. Copy and paste the entire contents of `tiktok_downloader.user.js` into the editor.
4. Save the script (`File -> Save` or `Ctrl+S`).
5. Refresh TikTok, and you will see the new download button in the action bar!

## How it works

The script hooks into the DOM using an interval observer and scans for TikTok's native action buttons. It calculates the exact bounding box and layout rules applied by TikTok's CSS to inject an identical sibling element.

When clicked, the script uses a localized DOM traversal strategy (including checking unique video ID properties, `xgwrapper` tags, and anchor links) to safely identify the exact video URL the user intends to download without polluting the search with other videos on the page. Finally, it uses `GM_xmlhttpRequest` to bypass CORS and hit the `tikwm` HD endpoint.

## Permissions Required
The script requests `GM_xmlhttpRequest` and `GM_download` to bypass cross-origin restrictions when downloading video files directly to your computer.

## Disclaimer
This project is for educational purposes only. Ensure you have the right to download and use the media you acquire through this tool.
