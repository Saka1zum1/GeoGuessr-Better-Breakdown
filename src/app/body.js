import * as C from "../constants/index.js";
import { SCREEN_WATCH } from "../constants/selectors.js";
import { injectGlobalStyles } from "../styles/global.css.js";
import { state } from "../state/store.js";
import {
    domCache,
    throttle,
    getReactFiber,
    getGuessMap,
    getReplayMap,
    getGameViewer,
    disableMotionTracking,
    getMarkerCoords,
    extractGameData,
    extractReplayData,
    extractGuesses,
    getDuelData,
    formatDistance,
    convertPanoId,
    getStreetViewThumbUrl,
    fovForZoom,
    mapsPanoUrl,
    buildMapsUrl,
    getRadius,
    getCurrentRound,
    queryStreetViewHost,
    extractDate,
    getGameToken,
    applyStyles,
} from "../lib/dom-utils.js";
import { alertDialog, promptText } from "../lib/dialogs.js";
import { loadChartLibs } from "../lib/lazy-libs.js";
import { createGuessHeatmap } from "../lib/heatmap.js";
import { polylineApi, setPreserveDrawingBuffer } from "../bootstrap/map-hooks.js";

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

/* __GGBB_SECTIONS__ */

function initPeekState() {
    state.PEEK_STATE = defaultState();
}

initPeekState();
main();
