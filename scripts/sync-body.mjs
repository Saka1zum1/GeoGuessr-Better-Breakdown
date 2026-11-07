/**
 * Optional one-way copy from legacy/ into src/. Overwrites modular source.
 * src/ is canonical; this script exits unless --force is passed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (!process.argv.includes("--force")) {
  console.error(
    "src/ is the source of truth. Refusing to overwrite it.\n" +
      "Pass --force to regenerate src/ from legacy/GeoGuessr Better Breakdown UI.js."
  );
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const legacyPath = path.join(root, "legacy", "GeoGuessr Better Breakdown UI.js");

const raw = fs.readFileSync(legacyPath, "utf8");
const match = raw.match(
  /\(function\(\)\{\s*"use strict";\s*([\s\S]*)\}\)\(\);?\s*$/
);
if (!match) throw new Error("Legacy IIFE not found");
const body = match[1];

function unindent(text) {
  return text
    .split("\n")
    .map((line) => (line.startsWith("    ") ? line.slice(4) : line))
    .join("\n");
}

const utilStart = body.search(
  /\/\/ =+\s*\r?\n\s*\/\/ UTILITY FUNCTIONS/
);
if (utilStart < 0) throw new Error("Utility section not found");

const preamble = unindent(body.slice(0, utilStart));
const polyBlock = unindent(body.slice(body.indexOf("googleMapsPromise.then"), utilStart)).trim();
let logicBlock = unindent(body.slice(utilStart));

const mainStyleMatch = logicBlock.match(
  /function main\(\) \{([\s\S]*?)GM_addStyle\(`([\s\S]*?)`\)\s*\n\s*\}/
);
if (!mainStyleMatch) throw new Error("main() GM_addStyle block not found");

const mainPrefix = mainStyleMatch[1];
const globalCss = mainStyleMatch[2];
const newMain = `function main() {${mainPrefix}    injectGlobalStyles();\n}`;

logicBlock = logicBlock.replace(
  /function main\(\) \{[\s\S]*?GM_addStyle\(`([\s\S]*?)`\)\s*\n\s*\}/,
  newMain
);

logicBlock = logicBlock.replace(/\n\s*main\(\);\s*$/, "\n");

function splitPreambleConstants(preambleText) {
  const mapsStart = preambleText.indexOf("const panoCache");
  const selectorsStart = preambleText.indexOf("const SELECTORS");
  const svgStart = preambleText.indexOf("const SVG_SOURCE");
  const tilesStart = preambleText.indexOf("const TILE_TEMPLATE");
  const afterTiles = preambleText.slice(tilesStart);
  const tilesEndRel = afterTiles.search(/\r?\n(?:let |googleMapsPromise)/);
  const tilesEnd = tilesEndRel < 0 ? preambleText.length : tilesStart + tilesEndRel;
  const config = preambleText.slice(0, mapsStart).trim();
  const selectors = preambleText.slice(selectorsStart, svgStart).trim();
  const svg = preambleText.slice(svgStart, tilesStart).trim();
  const tiles = preambleText.slice(tilesStart, tilesEnd).trim();
  return { config, selectors, svg, tiles };
}

const { config, selectors, svg, tiles } = splitPreambleConstants(preamble);

const configExported = config
  .replace(/^const /gm, "export const ")
  .replace("export const PEEK_STATE = defaultState();", "")
  .trim();

const constantsDir = path.join(root, "src", "constants");
const stylesDir = path.join(root, "src", "styles");
const appDir = path.join(root, "src", "app");
const sectionsDir = path.join(appDir, "sections");
const bootstrapDir = path.join(root, "src", "bootstrap");

for (const d of [constantsDir, stylesDir, appDir, sectionsDir, bootstrapDir]) {
  fs.mkdirSync(d, { recursive: true });
}

fs.writeFileSync(path.join(constantsDir, "config.js"), `${configExported}\n`);

fs.writeFileSync(
  path.join(constantsDir, "selectors.js"),
  `${selectors.replace(/^const /, "export const ")}\n`
);
fs.writeFileSync(
  path.join(constantsDir, "svg.js"),
  `${svg.replace(/^const /, "export const ")}\n`
);
fs.writeFileSync(
  path.join(constantsDir, "tiles.js"),
  `${tiles.replace(/^const /, "export const ")}\n`
);

fs.writeFileSync(
  path.join(constantsDir, "maps.js"),
  `export const panoCache = new Map();
export const markerDataMap = new WeakMap();
export const panoListenerMap = new WeakMap();
export const markerHandlerMap = new WeakMap();
export const movementPathCache = new WeakMap();
export const mapPathOverlayMap = new WeakMap();
export const polylineRoundMap = new WeakMap();
`
);

fs.writeFileSync(
  path.join(constantsDir, "index.js"),
  `export * from "./config.js";
export * from "./maps.js";
export * from "./selectors.js";
export * from "./svg.js";
export * from "./tiles.js";
`
);

fs.writeFileSync(
  path.join(stylesDir, "global.css.js"),
  `export const globalStyles = \`${globalCss.replace(/`/g, "\\`")}\`;\n\nexport function injectGlobalStyles() {\n  GM_addStyle(globalStyles);\n}\n`
);

fs.writeFileSync(path.join(bootstrapDir, "polyline-hook.js"), `${polyBlock}\n`);

const SECTION_TITLES = [
  "UTILITY FUNCTIONS - DOM & DATA ACCESS",
  "STREET VIEW SERVICE & PANORAMA CACHE",
  "INITIALIZATION FUNCTIONS",
  "OBSERVER CLEANUP FUNCTIONS",
  "GAME LOOP & SCHEDULING",
  "MAP INTERACTION & EVENT LISTENERS",
  "MAP CONTROLS & UI",
  "REPLAY ANALYSIS",
  "MARKER CLEANUP",
  "MARKER PROCESSING & UPDATES",
  "DUEL ROUNDS PANEL",
  "MAP RESIZING",
  "PANORAMA DATA & METADATA",
  "API REQUESTS & DATA",
  "STREET VIEW LINK & SHARING",
  "FULLSCREEN CONTROLS",
  "MOVEMENT PATH TRACKING & RENDERING",
  "ROUND SELECTION & RESULT DISPLAY",
  "PHOTO MODE & STREET VIEW CONTROLS",
  "STREET VIEW INITIALIZATION & DISPLAY",
  "STATE MANAGEMENT & PERSISTENCE",
  "HISTORY TRACKING & MARKER HANDLERS",
  "INITIALIZATION",
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findSectionHeaderIndex(blob, title, fromIndex = 0) {
  const re = new RegExp(`^// ${escapeRegExp(title)}\\s*$`, "m");
  const slice = blob.slice(fromIndex);
  const m = slice.match(re);
  if (!m || m.index === undefined) return -1;
  return fromIndex + m.index;
}

function sliceBySectionTitle(blob, title, nextTitle) {
  const start = findSectionHeaderIndex(blob, title);
  if (start < 0) throw new Error(`Section not found: ${title}`);
  const afterTitle = blob.indexOf("\n", start) + 1;
  const dividerEnd = blob.indexOf("\n", afterTitle);
  const codeStart = dividerEnd + 1;
  let end = blob.length;
  if (nextTitle) {
    const next = findSectionHeaderIndex(blob, nextTitle, codeStart);
    if (next >= 0) end = next;
  }
  return blob.slice(codeStart, end).trim();
}

const sectionNames = [];
for (let i = 0; i < SECTION_TITLES.length; i++) {
  const title = SECTION_TITLES[i];
  const nextTitle = SECTION_TITLES[i + 1] ?? null;
  const code = sliceBySectionTitle(logicBlock, title, nextTitle);
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const fileName = `${String(i + 1).padStart(2, "0")}-${slug}.js`;
  fs.writeFileSync(
    path.join(sectionsDir, fileName),
    `// ${title}\n${code}\n`
  );
  sectionNames.push(fileName);
}

for (const old of fs.readdirSync(sectionsDir)) {
  if (!sectionNames.includes(old)) {
    fs.unlinkSync(path.join(sectionsDir, old));
  }
}

const stateVars = `let OldPolyline;

let svs = null;
let chart = null;
let spawn = null;
let viewer = null;
let guessMap = null;
let gameViewer = null;
let cleanStyle = null;
let peekMarker = null;
let mapObserver = null;
let isAnimating = null;
let currentRound = null;
let panoSelector = null;
let closeControl = null;
let pathPolyline = null;
let customMapType = null;
let gameLoopTimer = null;
let heatmapOverlay = null;
let opacityControl = null;
let markerObserver = null;
let viewerObserver = null;
let playbackMarker = null;
let currentGameToken = null;
let playbackAnimationId = null;
let currentMovementRound = null;
let mapTypeIndex = 0;
let movementPath = [];
let currentMovementPath = [];

let isInGame = false;
let isPhotoMode = false;
let isPlayingPath = false;
let isCoverageLayer = false;
let isPathDisplayed = false;
let gameLoopRunning = false;
let clickListenerAttached = false;

let MAP_LIST;
let LOCATION;
let MAP_MAKING_API_KEY = GM_getValue("MAP_MAKING_API_KEY", "PASTE_YOUR_KEY_HERE");
let previousMapId = JSON.parse(GM_getValue('previousMapId', null));
let previousTags = JSON.parse(GM_getValue('previousTags', '[]'));
let preferTagKeys = JSON.parse(GM_getValue('preferTagKeys', '{}'));
let currentOverlays = ["Google_Maps", "Google_Labels"];

/** @type {ReturnType<typeof defaultState>} */
let PEEK_STATE;
`;

const bodyOut = `import * as C from "../constants/index.js";

const {
  SEARCH_RADIUS,
  STORAGE_CAP,
  MAP_TYPES,
  MONTHS_SHORT,
  MONTHS_FULL,
  MOVEMENT_STORAGE_PREFIX,
  panoCache,
  markerDataMap,
  panoListenerMap,
  markerHandlerMap,
  movementPathCache,
  mapPathOverlayMap,
  polylineRoundMap,
  SELECTORS,
  SVG_SOURCE,
  TILE_TEMPLATE,
} = C;

import { injectGlobalStyles } from "../styles/global.css.js";

${stateVars}

/* __GGBB_SECTIONS__ */

function initPeekState() {
  PEEK_STATE = defaultState();
}

initPeekState();
main();
`;

fs.writeFileSync(path.join(appDir, "body.js"), bodyOut);

fs.writeFileSync(
  path.join(appDir, "index.js"),
  `import "./body.js";
`
);

console.log(`Synced ${sectionNames.length} sections, constants, styles, bootstrap.`);
