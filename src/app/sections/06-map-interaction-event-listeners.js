// MAP INTERACTION & EVENT LISTENERS
function animatePovNorth() {
    if (!state.viewer) return
    const startTime = Date.now();
    let animationTimestamp = startTime;

    const currentPov = state.viewer.getPov();
    const currentZoom = state.viewer.getZoom();

    const isHeadingZero = currentPov.heading % 360 === 0 || state.isAnimating;
    const targetPov = {
        heading: 0,
        pitch: isHeadingZero ? -90 : 0,
    };

    if (Math.abs(targetPov.heading - currentPov.heading) > 180) {
        targetPov.heading += 360;
    }

    const transitionDuration = 4 * Math.max(Math.abs(targetPov.heading - currentPov.heading), 100);
    let previousTimestamp = null;

    function updatePov(timestamp) {
        if (animationTimestamp !== startTime) return;
        if (!previousTimestamp) previousTimestamp = timestamp;

        const progress = Math.min((timestamp - previousTimestamp) / transitionDuration, 1);
        const easing = 1 - Math.pow(1 - progress, 3);

        const newHeading = currentPov.heading + (targetPov.heading - currentPov.heading) * easing;
        const newPitch = currentPov.pitch + (targetPov.pitch - currentPov.pitch) * easing;

        state.viewer.setPov({ heading: newHeading, pitch: newPitch });
        state.viewer.setZoom(currentZoom + (0 - currentZoom) * easing);

        if (progress < 1) {
            requestAnimationFrame(updatePov);
        } else {
            state.isAnimating = false;
        }
    }

    state.isAnimating = true;
    requestAnimationFrame(updatePov);
}

function offsetMapFocus(map, coords) {
    if (!map || !coords) return;

    map.setCenter(coords);

    const mapDiv = map.getDiv();
    const width = mapDiv.offsetWidth;

    const offsetX = width / 4;

    map.panBy(offsetX, 0);
}

function attachPanoChangeListener() {
    if (!state.gameViewer || panoListenerMap.has(state.gameViewer)) return;

    const round = getCurrentRound() || state.currentMovementRound || 1;
    let startPosition = null;
    try {
        startPosition = state.gameViewer.getPosition();
    } catch {
        startPosition = null;
    }
    if (startPosition) {
        if (state.currentMovementRound && state.currentMovementRound !== round) {
            persistMovementPath(state.currentMovementRound);
        }
        state.currentMovementPath = [{
            lat: startPosition.lat(),
            lng: startPosition.lng(),
            time: Date.now()
        }];
        state.currentMovementRound = round;
    }

    const listener = state.gameViewer.addListener("position_changed", function () {
        recordMovementPoint(state.gameViewer);
    });

    panoListenerMap.set(state.gameViewer, listener);
}

function attachClickListener(map) {
    map.addListener("click", async (e) => {
        const coords = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };

        if ((domCache.queryOne(SELECTORS.roundEnd) ||
             domCache.queryOne(SELECTORS.gameEnd) ||
             domCache.queryOne(SELECTORS.challengeEnd) ||
             domCache.queryOne(SELECTORS.teamDuelEnd) ||
             (domCache.queryOne(SELECTORS.newDuelEnd))) && !domCache.queryOne(SELECTORS.duelEndMap)) {
            if (!state.isCoverageLayer) return
            const pano = await getNearestPano(coords);
            if (!pano || pano.error) return
            if (!state.peekMarker) {
                state.peekMarker = new google.maps.Marker({
                    position: pano.location,
                    map,
                    icon: {
                        url: "https://www.geoguessr.com/_next/static/media/selected-pin-square.bcb5854f.webp",
                        scaledSize: new google.maps.Size(28, 28),
                        anchor: new google.maps.Point(14, 28)
                    },
                    zIndex: 10008
                });
            } else {
                state.peekMarker.setPosition(pano.location);
            }
            const isNewDuelEnd = domCache.queryOne(SELECTORS.newDuelEnd);
            if (isNewDuelEnd) handleNewDuelStreetView(pano);
            else openNativeStreetView(pano)
        }
    });
}

// ============================================================================
