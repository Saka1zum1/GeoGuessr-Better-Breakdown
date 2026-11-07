// INITIALIZATION FUNCTIONS
function attachVisibleMap() {
    const duelMap = domCache.queryOne(SELECTORS.duelMap);
    const legacyTeam = domCache.queryOne(SELECTORS.teamDuelEnd);
    const mapEl = domCache.queryOne(SELECTORS.resultMap) || duelMap || domCache.queryOne(SELECTORS.guessMap);
    if (!mapEl) return;
    const map = getGuessMap(mapEl);
    if (!map) return;
    state.guessMap = map;
    if (!state.clickListenerAttached) {
        startViewerObserver();
        attachClickListener(state.guessMap);
        state.clickListenerAttached = true;
        if (duelMap && legacyTeam) makeMapResizable();
        stopMapObserver();
    }
}

function startMapObserver() {
    stopMapObserver();

    state.mapObserver = new MutationObserver((mutations) => {
        if (!mutations.some(m => m.addedNodes.length > 0)) return;
        attachVisibleMap();
    });

    state.mapObserver.observe(domCache.nextRoot, {
        childList: true,
        subtree: true,
        attributes: false,
    });
    attachVisibleMap();
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

    state.markerObserver.observe(domCache.nextRoot, {
        childList: true,
        subtree: true,
    });
    throttledScheduleGameLoop();
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

    state.viewerObserver.observe(domCache.nextRoot, {
        childList: true,
        subtree: true,
        attributes: false,
    });
}

// ============================================================================
