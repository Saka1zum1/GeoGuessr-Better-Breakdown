import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import pkg from "./package.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sectionsDir = path.join(__dirname, "src", "app", "sections");

const SECTIONS_PLACEHOLDER = "/* __GGBB_SECTIONS__ */";

/** Greasy Fork / Tampermonkey localized metadata (@name:*, @description:*). */
const SCRIPT_NAME_EN = "GeoGuessr Better Breakdown";
const SCRIPT_DESC_EN =
  "Street View on the results map: preview pins, review rounds, and compare guesses in Classic, Daily, and Duels.";

const GF_NAME = {
  "": SCRIPT_NAME_EN,
  en: SCRIPT_NAME_EN,
  ja: "GeoGuessr ベター・ブレイクダウン",
  ru: "GeoGuessr: разбор результатов",
  es: "GeoGuessr: mejor desglose",
  fr: "GeoGuessr — Meilleur bilan",
  de: "GeoGuessr — Besserer Rundenauswertung",
  pl: "GeoGuessr — Lepsze podsumowanie",
  "zh-CN": "GeoGuessr 复盘优化",
  "zh-TW": "GeoGuessr 結算強化",
};

const GF_DESCRIPTION = {
  "": SCRIPT_DESC_EN,
  en: SCRIPT_DESC_EN,
  ja: "結果マップでストリートビューを表示。ピンプレビュー、ラウンド確認、クラシック・デイリー・デュエル対応。",
  ru: "Street View на карте итогов: превью пинов, разбор раундов в классике, дейлике и дуэлях.",
  es: "Street View en el mapa de resultados: vista previa, repaso por rondas en Clásico, Daily y Duelos.",
  fr: "Street View sur la carte des résultats : aperçu des pins et relecture des manches (Classique, Daily, Duels).",
  de: "Street View auf der Ergebniskarte: Pin-Vorschau und Rundenreview in Klassisch, Daily und Duellen.",
  pl: "Street View na mapie wyników: podgląd pinów i analiza rund w Classic, Daily i Duelach.",
  "zh-CN": "在结算地图打开街景：位置预览、按轮回看，支持经典、每日挑战与决斗。",
  "zh-TW": "在結算地圖開啟街景：位置預覽、依回合檢視，支援經典、每日挑戰與決鬥。",
};

function loadSectionSources() {
  if (!fs.existsSync(sectionsDir)) return "";
  return fs
    .readdirSync(sectionsDir)
    .filter((name) => name.endsWith(".js"))
    .sort()
    .map((name) => fs.readFileSync(path.join(sectionsDir, name), "utf8"))
    .join("\n\n");
}

/** Inline section files into app/body.js so functions share one lexical scope. */
function inlineSectionsPlugin() {
  return {
    name: "ggbb-inline-sections",
    enforce: "pre",
    transform(code, id) {
      if (!id.replace(/\\/g, "/").endsWith("/src/app/body.js")) return;
      if (!code.includes(SECTIONS_PLACEHOLDER)) return;
      const sections = loadSectionSources();
      return code.replace(SECTIONS_PLACEHOLDER, sections);
    },
  };
}

export default defineConfig({
  plugins: [
    inlineSectionsPlugin(),
    monkey({
      entry: "src/main.js",
      userscript: {
        name: GF_NAME,
        namespace: "https://greasyfork.org/users/1179204",
        version: pkg.version,
        description: GF_DESCRIPTION,
        author: "KaKa",
        license: "MIT",
        match: ["https://www.geoguessr.com/*"],
        icon: "https://www.google.com/s2/favicons?sz=32&domain=geoguessr.com",
        grant: [
          "GM_download",
          "GM_addStyle",
          "GM_getValue",
          "GM_setValue",
          "GM_deleteValue",
          "GM_setClipboard",
          "GM_xmlhttpRequest",
          "unsafeWindow",
        ],
        connect: ["www.google.com", "cdn.jsdelivr.net"],
        require: [
          "https://openuserjs.org/src/libs/xsanda/Run_code_as_client.js",
          "https://openuserjs.org/src/libs/xsanda/Google_Maps_Promise.js",
        ],
        "run-at": "document-idle",
        downloadURL:
          "https://update.greasyfork.org/scripts/563091/GeoGuessr%20Better%20Breakdown.user.js",
        updateURL:
          "https://update.greasyfork.org/scripts/563091/GeoGuessr%20Better%20Breakdown.meta.js",
      },
      build: {
        fileName: "GeoGuessr Better Breakdown.user.js",
      },
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
