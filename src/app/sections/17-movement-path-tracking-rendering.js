// MOVEMENT PATH TRACKING & RENDERING
function renderMovementPaths(round) {
    clearMovementPaths()
    const roundsToRender = round ? [round] : [1, 2, 3, 4, 5];
    const polylines = [];

    for (const roundNum of roundsToRender) {
        const storageKey = `${MOVEMENT_STORAGE_PREFIX}${roundNum}`;
        let path = null;

        try {
            const raw = sessionStorage.getItem(storageKey);
            if (!raw) continue;
            path = JSON.parse(raw);
            if (!Array.isArray(path) || path.length < 2) continue;
        } catch (err) {
            console.error('[MovementPath] read failed', err);
            continue;
        }
        const polyline = new polylineApi.original({
            path,
            geodesic: true,
            strokeColor: 'rgb(131, 18, 223)',
            strokeOpacity: 0.85,
            strokeWeight: 3,
            map: state.guessMap,
            zIndex: 99999,
        });

        polylines.push({ polyline, round: roundNum });
    }

    if (polylines.length > 0) {
        if (round) {
            mapPathOverlayMap.set(state.guessMap, polylines[0]);
        } else {
            mapPathOverlayMap.set(state.guessMap, polylines);
        }
    }
}

function clearMovementPaths() {
    const overlay = mapPathOverlayMap.get(state.guessMap);
    if (overlay) {
        if (Array.isArray(overlay)) {
            overlay.forEach(item => {overlay.forEach(item => item.polyline?.setMap(null));});
        } else if (overlay.polyline) overlay.polyline.setMap(null);
    }

    mapPathOverlayMap.delete(state.guessMap);
}

function recordMovementPoint(panorama) {
    if (!panorama || location.href.includes('duel')) return;

    const position = panorama.getPosition();
    if (!position) return;

    const round = getCurrentRound() || 1;

    const newPoint = {
        lat: position.lat(),
        lng: position.lng(),
        time: Date.now()
    };

    if(!state.currentMovementRound)state.currentMovementRound=round

    if (state.currentMovementRound !== round) {
        state.currentMovementPath = [newPoint];
        state.currentMovementRound = round;
        return;
    }

    const lastPoint = state.currentMovementPath[state.currentMovementPath.length - 1];
    if (!lastPoint || lastPoint.lat !== newPoint.lat || lastPoint.lng !== newPoint.lng) {
        state.currentMovementPath.push(newPoint);
    }
}

function trackMovement() {
    if (!state.viewer || !state.guessMap || state.isInGame) return;

    const position = state.viewer.getPosition();
    if (!position) return;

    if (!state.currentRound) state.currentRound = getCurrentRound();
    if (state.currentRound != getCurrentRound()) {
        state.currentRound= getCurrentRound();
        clearMovementPath();
    };

    const newPoint = {
        lat: Number(position.lat().toFixed(5)),
        lng: Number(position.lng().toFixed(5)),
        time: Date.now()
    };

    const lastPoint = state.movementPath[state.movementPath.length - 1];
    if (!lastPoint || lastPoint.lat !== newPoint.lat || lastPoint.lng !== newPoint.lng) {
        state.movementPath.push(newPoint);
    }

    if (state.movementPath.length > 1) {
        if (state.pathPolyline) {
            state.pathPolyline.setPath(state.movementPath);
        } else {
            state.pathPolyline = new google.maps.Polyline({
                path: state.movementPath,
                geodesic: true,
                strokeColor: 'rgb(204, 48, 46)',
                strokeOpacity: 0.9,
                strokeWeight: 4,
                map: state.guessMap,
                zIndex: 10000
            });
        }
    }
}

function clearMovementPath() {
    if (state.pathPolyline) {
        state.pathPolyline.setMap(null);
        state.pathPolyline = null;
    }
    state.movementPath = [];
}

// ============================================================================
