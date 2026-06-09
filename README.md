# YT Focus

YT Focus is a minimalist, performant Chrome Extension designed to help users regain control of their YouTube experience. By selectively hiding distracting UI elements (like the home feed, shorts, comments, and recommendations), it transforms YouTube from an endless rabbit hole into a focused, intent-driven learning and viewing platform.

<!-- Update this with an actual screenshot of your UI later -->

## 🚀 Features

- **Granular Control**: Toggle individual YouTube components (Shorts, Home Feed, Comments, Sidebar, Ads, etc.) on or off.
- **Pre-configured Modes**:
  - **Focus Mode**: Hides almost all distractions. Perfect for deep work and studying.
  - **Browse Mode**: Restores standard navigation while keeping ads and some clutter hidden.
  - **Zen Mode**: A completely distraction-free, cinematic viewing experience.
- **Zero Overhead**: Built with Vanilla JavaScript, HTML, and CSS. No heavy frameworks, no unnecessary background processing.
- **Privacy First**: 100% local. No analytics, no tracking, and no external API calls. The extension only asks for the bare minimum permissions (`tabs` and `storage`).

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Architecture**: Manifest V3 Chrome Extension
- **State Management**: `chrome.storage.sync` API for cross-device preference synchronization.
- **Content Manipulation**: CSS injection for structural hiding (prevents layout shifts/flickering) and `MutationObserver` for dynamically loaded DOM elements.

## 📦 How to Install (Developer Mode)

Since this extension is currently pending publication to the Chrome Web Store, you can install it locally in a few simple steps:

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/yt-focus-v5.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the `yt-focus-v5` folder you just cloned.
6. **Done!** The YT Focus icon will appear in your extensions bar. Pin it, open YouTube, and try toggling the different modes.

## 🧠 Technical Highlights for Reviewers

- **Performance**: To avoid the dreaded "flash of unstyled content" (FOUC), the extension injects CSS rules at `document_start`. This ensures elements like the home feed are hidden *before* they are painted by the browser.
- **Dynamic DOM Handling**: YouTube is a Single Page Application (SPA) that aggressively mutates the DOM. The extension uses an optimized `MutationObserver` paired with custom data attributes (`data-ytf-hidden`) to track and manage elements that render late or inside shadow DOMs (like view counts and subscriber counts) without causing performance bottlenecks.
- **Clean Architecture**: The logic is strictly separated. `background.js` handles the service worker and central state, `popup.js` acts as the view controller for the user interface, and `content.js` strictly manages DOM manipulation and CSS injection.

## 📝 License

MIT License
