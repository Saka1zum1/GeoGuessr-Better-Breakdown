# GeoGuessr Better Breakdown UI

🎮 A Tampermonkey script that enhances your GeoGuessr experience by providing convenient tools to view and analyze your guesses after each round.

## ✨ Features

- **📍 Street View Preview**: Hover over map markers to preview the Street View image at that location
- **📏 Distance Display**: See the distance between your guess and the nearest Street View coverage point
- **🗺️ Built-in Street View Viewer**: Click markers to open Street View directly in-page without leaving the site
- **⏰ Historical Street View**: Switch between different Street View images captured at different times
- **🎯 Coverage Layer**: Display Google Street View coverage to help you better analyze the map
- **🛤️ Movement Path Tracking**: Visualize your exploration path in Street View - a simple blue line is drawn on the map as you move around, and automatically clears when you click the map
- **📷 Photo Mode**: Enter fullscreen photo mode to capture clean Street View screenshots without UI elements
- **⚔️ Duel Mode Support**: Full support for Duel mode with dedicated rounds panel - click the panel button on the map to view round details and switch between rounds
- **📐 Resizable Map**: In Duel mode, resize the map container in 8 directions - your preferred size is saved automatically
- **💾 Map Making Integration**: Save locations to [Map Making App](https://map-making.app) with one click

## 📥 Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension (compatible with Chrome, Firefox, Edge, and other major browsers)
2. Install the script using one of these methods:
   - [Install from Greasy Fork](https://greasyfork.org/en/scripts/563091)
   - [Install from GitHub](https://github.com/Saka1zum1/GeoGuessr-Better-Breakdown-UI)
3. Visit [GeoGuessr](https://www.geoguessr.com/) to play, the script will activate automatically

### Manual Installation

1. Click the Tampermonkey icon in your browser
2. Select "Create a new script"
3. Copy the contents of `dist/GeoGuessr Better Breakdown.user.js` (after running `npm run build`) and paste it into the editor
4. Press `Ctrl+S` (or `Cmd+S` on Mac) to save

## 🛠️ Development

This repo uses a modular source tree and [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) to produce the installable userscript.

| Location | Purpose |
|----------|---------|
| `package.json` | **Version** of the script (`@version` in the built file follows this field) |
| `src/constants/` | Selectors, SVG icons, map tile templates, shared config |
| `src/styles/` | Global CSS injected via `GM_addStyle` |
| `src/bootstrap/` | Google Maps polyline hook (runs in page context) |
| `src/state/store.js` | Mutable runtime state shared by inlined sections |
| `src/lib/` | DOM helpers, dialogs, lazy Chart loader, heatmap |
| `src/app/sections/` | Feature logic split by section (merged into one scope at build time) |
| `legacy/` | Archived single-file script; not used by the build |
| `dist/` | Build output for Tampermonkey / Greasy Fork |
| `greasyfork/` | User-facing install page text per locale (paste into Greasy Fork) |

```bash
npm install
npm run build          # writes dist/GeoGuessr Better Breakdown.user.js
npm run dev            # rebuild on file changes
```

Day-to-day edits belong under `src/`. The file in `legacy/` is an archive of the old monolith and is not part of the build. `npm run sync:legacy` refuses to run unless you pass `--force`, because that command overwrites `src/`.

## 🔧 Map Making Integration Setup

If you want to save Street View locations to Map Making App:

1. Click the save button (upload icon) in the Street View viewer
2. On first use, you'll be prompted to enter your API Key
3. Visit [map-making.app/keys](https://map-making.app/keys) to generate your API Key
4. Enter your API Key and start saving locations

## 💡 Tips & Tricks

- **View guess details**: After a round ends, hover over your guess marker to preview the Street View
- **Analyze correct location**: Click on the correct location marker (green) to view the actual Street View
- **Track your exploration**: As you move around in Street View, a red path line will automatically appear on the map showing where you've been
- **Switch historical views**: Use the dropdown menu at the bottom of the viewer to select different capture dates
- **Copy Street View link**: Click the copy button in the bottom-left corner of the viewer to get a Google Maps short link
- **Photo mode**: Click the camera icon to enter fullscreen photo mode for clean screenshots - press ESC to exit
- **Duel mode rounds**: In Duel breakdown, click the list icon on the map to open the rounds panel and quickly switch between rounds
- **Resize map**: In Duel mode, drag the edges or corners of the map container to resize it to your preference

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

## 👨‍💻 Author

[KaKa](https://github.com/Saka1zum1)

## 🙏 Attribution

Some parts of this project are adapted from:
- [Alien Perfect's Guess Peek](https://greasyfork.org/scripts/483541-guess-peek-geoguessr)
- [miraclewhips' Save to Mapmaking App](https://github.com/miraclewhips/geoguessr-userscripts/raw/refs/heads/master/geoguessr-save-to-mapmaking.user.js)
