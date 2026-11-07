// OBSERVER CLEANUP FUNCTIONS
function stopMapObserver() {
    if (state.mapObserver) {
        state.mapObserver.disconnect();
        state.mapObserver = null;
    }
    state.clickListenerAttached = false;
}

function stopMarkerObserver() {
    if (state.markerObserver) {
        state.markerObserver.disconnect();
        state.markerObserver = null;
    }

    if (state.gameLoopTimer) {
        clearTimeout(state.gameLoopTimer);
        state.gameLoopTimer = null;
    }
}

function stopViewerObserver() {
    if (state.viewerObserver) {
        state.viewerObserver.disconnect();
        state.viewerObserver = null;
    }
}

// ============================================================================
