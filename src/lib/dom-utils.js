import { SELECTORS } from "../constants/selectors.js";
import { state } from "../state/store.js";

function fiberOf(el) {
    if (!el) return null;
    const key = Object.keys(el).find((name) => name.startsWith("__reactFiber") || name.startsWith("__reactInternalInstance"));
    return key ? el[key] : null;
}

/** Walk up the React fiber until `read` returns a value. CSS-module hashes can change; props shapes move more slowly. */
export function findInFiber(el, read, maxHops = 30) {
    let fiber = fiberOf(el);
    const seen = new Set();
    let hops = 0;
    while (fiber && hops < maxHops && !seen.has(fiber)) {
        seen.add(fiber);
        try {
            const found = read(fiber, fiber.memoizedProps || fiber.pendingProps);
            if (found) return found;
        } catch {
            // Fiber nodes are not a stable API.
        }
        fiber = fiber.return;
        hops += 1;
    }
    return null;
}

function findGoogleObject(el, test) {
    return findInFiber(el, (fiber, props) => {
        if (test(props)) return props;
        if (props) {
            if (test(props.map)) return props.map;
            if (test(props.panorama)) return props.panorama;
            if (test(props.value?.map)) return props.value.map;
        }
        let hook = fiber.memoizedState;
        for (let index = 0; hook && index < 40; index += 1) {
            const value = hook.memoizedState;
            if (test(value)) return value;
            if (value && typeof value === "object") {
                if (test(value.current)) return value.current;
                if (test(value.instance)) return value.instance;
                if (test(value.panorama)) return value.panorama;
                if (test(value.map)) return value.map;
            }
            hook = hook.next;
        }
        const instance = fiber.memoizedState?.memoizedState?.current?.instance;
        if (test(instance)) return instance;
        return null;
    });
}

function asGoogleMap(value) {
    return value && typeof value.getDiv === "function" && typeof value.setCenter === "function" ? value : null;
}

function asStreetView(value) {
    return value && typeof value.getPano === "function" ? value : null;
}

export const domCache = {
    _nextRoot: null,
    _lastNextRootCheck: 0,
    get nextRoot() {
        const now = Date.now();
        if (!this._nextRoot || now - this._lastNextRootCheck > 1000) {
            this._nextRoot = document.querySelector("#__next");
            this._lastNextRootCheck = now;
        }
        return this._nextRoot;
    },
    queryOne(selector) {
        return this.nextRoot?.querySelector(selector) || null;
    },
    queryAll(selector) {
        return this.nextRoot?.querySelectorAll(selector) || [];
    },
    clear() {
        this._nextRoot = null;
        this._lastNextRootCheck = 0;
    },
};

export function throttle(fn, delay) {
    let lastCall = 0;
    let timeoutId = null;
    return function (...args) {
        const now = Date.now();
        const remaining = delay - (now - lastCall);
        if (remaining <= 0) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            lastCall = now;
            fn.apply(this, args);
        } else if (!timeoutId) {
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                timeoutId = null;
                fn.apply(this, args);
            }, remaining);
        }
    };
}

export function getReactFiber(el) {
    return fiberOf(el);
}

export function getGuessMap(el) {
    const fromElement = findGoogleObject(el, asGoogleMap);
    if (fromElement) return fromElement;
    const marker = domCache.queryOne(`${SELECTORS.answerMarker}, ${SELECTORS.guessMarker}, ${SELECTORS.duelMarker}`);
    return findGoogleObject(marker, asGoogleMap);
}

export function getReplayMap(el) {
    const fiber = getReactFiber(el);
    try {
        return fiber?.return?.return?.return?.return?.memoizedProps?.value?.map || fiber?.return?.return?.memoizedProps?.value?.map || null;
    } catch { return null; }
}

export function getGameViewer(el) {
    const host = el || document.querySelector(SELECTORS.svContainer);
    return findGoogleObject(host, asStreetView);
}

export function disableMotionTracking(pano) {
    if (!pano?.setOptions) return;
    pano.setOptions({
        motionTracking: false,
        motionTrackingControl: false,
    });
}

export function getMarkerCoords(marker) {
    return findInFiber(marker, (_fiber, props) => {
        if (!props || props.lat == null || props.lng == null) return null;
        return { lat: props.lat, lng: props.lng };
    });
}

export function extractGameData() {
    const marker = domCache.queryOne(SELECTORS.answerMarker) || domCache.queryOne(SELECTORS.guessMarker);
    return findInFiber(marker, (_fiber, props) => (props?.rounds && props?.guesses ? props : null));
}

export function extractReplayData() {
    const el = domCache.queryOne(SELECTORS.investigation);
    const fiber = getReactFiber(el);
    try {
        return fiber?.return?.return?.return?.return?.memoizedProps?.replay?.samples;
    } catch { return null; }
}

export function extractGuesses() {
    const el = domCache.queryOne('[class^="learning-hub-world-map_root"]');
    const fiber = getReactFiber(el);
    try {
        return fiber?.return?.memoizedProps?.guesses;
    } catch { return null; }
}

export function getDuelData(marker) {
    return findInFiber(marker, (_fiber, props) => {
        if (!props) return null;
        if (props.round && (props.round.lat != null || props.round.panorama)) return props.round;
        if (props.lat != null && props.lng != null && !props.rounds) return props;
        return null;
    });
}

export function formatDistance(num) {
    return num >= 1000 ? `${(num / 1000).toFixed(1)} km` : `${Math.floor(num)} m`;
}

export function convertPanoId(panoId) {
    if (!panoId) return null;
    if (panoId.length == 22) return panoId;
    try {
        const bytes = new Uint8Array(panoId.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
        return new TextDecoder("utf-8").decode(bytes);
    } catch (e) {
        console.error("Error:", e);
        return panoId;
    }
}

export function getStreetViewThumbUrl(pano) {
    if (pano.panoId) {
        return `https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=${pano.panoId}&cb_client=maps_sv.tactile.gps&w=1024&h=768&yaw=${pano.heading || 0}&pitch=${pano.pitch || 0}&thumbfov=120`;
    } else if (pano.location) {
        return `https://maps.googleapis.com/maps/api/streetview?size=1024x768&location=${pano.location.lat},${pano.location.lng}&heading=${pano.heading || 0}&pitch=${pano.pitch || 0}&fov=120&key=AIzaSyDqRTXlnHXELLKn7645Q1L_5oc4CswKZK4`;
    }
    return null;
}

export function fovForZoom(zoom) {
    return (360 / Math.PI) * Math.atan(0.75 * Math.pow(2, 1 - zoom));
}

export function mapsPanoUrl(view) {
    const { lat, lng, heading, pitch, fov, panoId } = view;

    let data;
    if (/^[-_A-Za-z0-9]{21}[AQgw]$/.test(panoId)) {
        const thumb = new URL("https://streetviewpixels-pa.googleapis.com/v1/thumbnail");
        thumb.searchParams.set("panoid", panoId);
        thumb.searchParams.set("cb_client", "maps_sv.share");
        thumb.searchParams.set("w", "900");
        thumb.searchParams.set("h", "600");
        thumb.searchParams.set("yaw", String(heading));
        thumb.searchParams.set("pitch", String(-pitch));
        thumb.searchParams.set("thumbfov", fov.toFixed(0));
        data = `!3m5!1e1!3m3!1s${panoId}!2e0!6s${encodeURIComponent(thumb.toString())}`;
    } else {
        data = `!3m4!1e1!3m2!1s${panoId}!2e0`;
    }

    const url = new URL(
        `https://www.google.com/maps/@${lat},${lng},3a,${fov.toFixed(1)}y,${heading.toFixed(2)}h,${(pitch + 90).toFixed(2)}t/data=${data}`,
    );
    url.searchParams.set("coh", "235716");
    url.searchParams.set("entry", "tts");
    return url;
}

export const buildMapsUrl = () => {
    const viewer = state.viewer;
    const pos = viewer.getPosition();
    const pov = viewer.getPov();
    if (!pos || !pov) return null;

    const loc = viewer.getLocation();
    if (!loc) return null;
    return mapsPanoUrl({
        lat: pos.lat(),
        lng: pos.lng(),
        heading: pov.heading,
        pitch: pov.pitch,
        fov: fovForZoom(viewer.getZoom()),
        panoId: loc.pano ?? "",
    });
};

export function getRadius(coords1, coords2) {
    return unsafeWindow.google.maps.geometry.spherical.computeDistanceBetween(
        coords1,
        coords2,
    );
}

export function getCurrentRound() {
    const nodes = [...domCache.queryAll(SELECTORS.roundNumber)];
    for (const el of nodes) {
        const text = el.textContent.trim();
        if (/^total/i.test(text)) continue;
        const match = text.match(/\d+/);
        if (match) return Number(match[0]);
    }
    return null;
}

export function queryStreetViewHost() {
    return document.querySelector(SELECTORS.svContainer);
}

export function extractDate(entry) {
    for (const key in entry) {
        const value = entry[key];
        if (value instanceof Date) {
            return value;
        }
        if (typeof value === "string" && !isNaN(Date.parse(value))) {
            return new Date(value);
        }
    }
    return null;
}

export function getGameToken(url) {
    const m = url.match(/[0-9a-zA-Z]{16}/);
    return m ? m[0] : null;
}

export function applyStyles(element, styles) {
    Object.assign(element.style, styles);
}
