// MARKER CLEANUP
function removePeekMarker() {
    if (state.peekMarker) {
        state.peekMarker.setMap(null);
        state.peekMarker = null;
    }
}

function cleanupPanoCache() {
    panoCache.clear();
}

// ============================================================================
