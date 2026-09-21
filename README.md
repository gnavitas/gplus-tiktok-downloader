# G+ TikTok Downloader
<img width="612" height="905" alt="image" src="https://github.com/user-attachments/assets/1031bb20-cc97-4582-9658-e04244cc75dd" />
<img width="503" height="118" alt="image" src="https://github.com/user-attachments/assets/ae912d6d-a350-4a06-90f1-1ee5d5e725f2" />
<img width="1522" height="876" alt="image" src="https://github.com/user-attachments/assets/f226037d-61e9-49f4-834e-119e0070bd33" />
A Tampermonkey userscript that adds download functionality to TikTok. It allows you to download videos and photo slide posts in HD, without watermarks.
## Features
- **HD Downloads**: Fetches 1080p source videos via the `tikwm.com` API.
- **No Watermarks**: Videos are saved without the TikTok logo.
- **Photo Support**: Detects and downloads photo slideshow posts as high-quality images.
- **Native UI**: Injects a download button that matches the styling and layout of the surrounding TikTok buttons.
- **Reliable Integration**: Uses event delegation to ensure the download buttons remain functional when scrolling through the "For You" page (FYP).
- **Bulk Profile Downloads**: Adds an option to the "More" (...) menu on user profiles, allowing you to sequentially download all loaded videos on the page into a dedicated folder.
- **Clean Naming**: Saves files in the `username-date-title` format and organizes bulk downloads into folders named after the profile username.

## Installation

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Open the Tampermonkey dashboard and create a new script.
3. Copy the contents of `tiktok_downloader.user.js` and paste them into the editor.
4. Save the script.
5. Refresh TikTok. You should now see the download buttons on videos and in profile menus.

## How it works

The script uses a mutation observer to detect the native TikTok action buttons and injects a matching sibling element. 

When a download is triggered, it parses the surrounding DOM to extract the video ID and uses `GM_xmlhttpRequest` to request the clean video file from the `tikwm` API.

## Permissions
The script requires `GM_xmlhttpRequest` and `GM_download` to bypass cross-origin restrictions and save files directly to your machine.

## Disclaimer
This project is for educational purposes only. Ensure you have the right to download and use the media you acquire through this tool.
