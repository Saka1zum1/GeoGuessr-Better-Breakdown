// MOVEMENT PATH TRACKING & RENDERING
function persistMovementPath(round = state.currentMovementRound) {
    if (!round || state.currentMovementPath.length < 2) return;
    try {
        sessionStorage.setItem(
            `${MOVEMENT_STORAGE_PREFIX}${round}`,
            JSON.stringify(state.currentMovementPath)
        );
    } catch (err) {
        console.error('[MovementPath] save failed', err);
    }
}

function readStoredPath(round) {
    if (!round) return null;
    try {
        const raw = sessionStorage.getItem(`${MOVEMENT_STORAGE_PREFIX}${round}`);
        if (!raw) return null;
        const path = JSON.parse(raw);
        return Array.isArray(path) && path.length >= 2 ? path : null;
    } catch (err) {
        console.error('[MovementPath] read failed', err);
        return null;
    }
}

function renderMovementPaths(round) {
    clearMovementPaths();
    attachVisibleMap();
    if (!state.guessMap || !polylineApi.original) return;
    const roundsToRender = round ? [round] : [1, 2, 3, 4, 5];

    for (const roundNum of roundsToRender) {
        const path = readStoredPath(roundNum);
        if (!path) continue;
        const polyline = new polylineApi.original({
            path,
            geodesic: true,
            strokeColor: 'rgb(131, 18, 223)',
            strokeOpacity: 0.85,
            strokeWeight: 3,
            map: state.guessMap,
            zIndex: 99999,
        });
        state.renderedMovementPaths.push(polyline);
    }
}

function clearMovementPaths() {
    for (const polyline of state.renderedMovementPaths) {
        polyline?.setMap?.(null);
    }
    state.renderedMovementPaths = [];
}

function recordMovementPoint(panorama) {
    if (!panorama || location.href.includes('duel')) return;

    const position = panorama.getPosition();
    if (!position) return;

    const round = getCurrentRound() || state.currentMovementRound || 1;

    const newPoint = {
        lat: position.lat(),
        lng: position.lng(),
        time: Date.now()
    };

    if (state.currentMovementRound && state.currentMovementRound !== round) {
        persistMovementPath(state.currentMovementRound);
        state.currentMovementPath = [newPoint];
        state.currentMovementRound = round;
        return;
    }

    if (!state.currentMovementRound) state.currentMovementRound = round;

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
