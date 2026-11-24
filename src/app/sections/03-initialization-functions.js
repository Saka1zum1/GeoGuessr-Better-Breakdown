// INITIALIZATION FUNCTIONS
const boundGuessMaps = new WeakSet();

function observeRoot(observer, options) {
    const root = domCache.nextRoot;
    if (!root || typeof root.nodeType !== "number") return false;
    try {
        observer.observe(root, options);
        return true;
    } catch (err) {
        console.warn("[GGBB] observer attach failed", err);
        return false;
    }
}

function whenRootReady(start) {
    if (observeRoot(state[start.observerKey], start.options)) {
        start.onReady?.();
        return;
    }
    const boot = new MutationObserver(() => {
        if (!observeRoot(state[start.observerKey], start.options)) return;
        boot.disconnect();
        start.onReady?.();
    });
    boot.observe(document.documentElement, { childList: true, subtree: true });
}

function attachVisibleMap() {
    const duelMap = domCache.queryOne(SELECTORS.duelMap);
    const legacyTeam = domCache.queryOne(SELECTORS.teamDuelEnd);
    const mapEl = domCache.queryOne(SELECTORS.resultMap) || duelMap || domCache.queryOne(SELECTORS.guessMap);
    if (!mapEl) return;
    const map = getGuessMap(mapEl);
    if (!map) return;
    state.guessMap = map;
    if (!boundGuessMaps.has(map)) {
        boundGuessMaps.add(map);
        attachClickListener(map);
    }
    if (!state.clickListenerAttached) {
        startViewerObserver();
        state.clickListenerAttached = true;
        if (duelMap && legacyTeam) makeMapResizable();
    }
}

function startMapObserver() {
    stopMapObserver();

    state.mapObserver = new MutationObserver((mutations) => {
        if (!mutations.some(m => m.addedNodes.length > 0)) return;
        attachVisibleMap();
    });

    whenRootReady({
        observerKey: "mapObserver",
        options: { childList: true, subtree: true, attributes: false },
        onReady: () => attachVisibleMap(),
    });
}

function startMarkerObserver() {
    stopMarkerObserver();

    const interesting = SCREEN_WATCH;

    state.markerObserver = new MutationObserver((mutations) => {
        const hasRelevantChange = mutations.some((mutation) => {
            const nodes = [...mutation.addedNodes, ...mutation.removedNodes];
            return nodes.some((node) => {
                if (node.nodeType !== Node.ELEMENT_NODE) return false;
                return node.matches?.(interesting) || !!node.querySelector?.(interesting);
            });
        });

        if (hasRelevantChange) {
            throttledScheduleGameLoop();
        }
    });

    whenRootReady({
        observerKey: "markerObserver",
        options: { childList: true, subtree: true },
        onReady: () => throttledScheduleGameLoop(),
    });
}

function startViewerObserver() {
    stopViewerObserver();

    state.viewerObserver = new MutationObserver((mutations) => {
        if (!mutations.some(m => m.addedNodes.length > 0)) return;
        const isMove = domCache.queryOne(SELECTORS.moveButton)
        if (!isMove) return
        state.gameViewer = getGameViewer(queryStreetViewHost())
        if (state.gameViewer) {
            attachPanoChangeListener()
            stopViewerObserver();
        }
    });

    whenRootReady({
        observerKey: "viewerObserver",
        options: { childList: true, subtree: true, attributes: false },
        onReady: () => ensureMovementTracking(),
    });
}

function ensureMovementTracking() {
    if (location.pathname.includes("duel")) return;
    const viewer = getGameViewer(queryStreetViewHost());
    if (!viewer) return;
    if (state.gameViewer !== viewer) state.gameViewer = viewer;
    attachPanoChangeListener();
}

// ============================================================================
