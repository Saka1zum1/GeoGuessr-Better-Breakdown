// ROUND SELECTION & RESULT DISPLAY
function attachRoundElementInteractions() {
    const roundContainer = domCache.queryOne('[class*="result-list_listWrapper"]');
    if (!roundContainer) return;

    const roundElements = roundContainer.querySelectorAll('[class*="result-list_listItemWrapper"]');

    roundElements.forEach((element, index) => {
        if (element.dataset.snakeBound === 'true') return;
        element.dataset.snakeBound = 'true';

        ['top', 'right', 'bottom', 'left'].forEach(side => {
            const border = document.createElement('div');
            border.className = `snake-border-${side}`;
            element.appendChild(border);
        });

        element.addEventListener('mouseenter', () => element.classList.add('show-border'));

        element.addEventListener('mouseleave', () => element.classList.remove('show-border'));

        element.addEventListener('click', (e) => {
            e.stopPropagation();
            handleRoundElementClick(element, index);
        }, true);
    });
}

function polylineTouches(polyline, points) {
    const path = polyline.getPath?.();
    if (!path?.getLength) return false;
    for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        const coords = { lat: point.lat(), lng: point.lng() };
        if (points.some((target) => samePoint(coords, target))) return true;
    }
    return false;
}

function handleRoundElementClick(element, index) {
    state.closeControl?.click();

    const label = element.querySelector('[class*="roundNumber"]')?.textContent || element.textContent || "";
    const roundMatch = /total/i.test(label) ? null : label.match(/\d+/);
    const round = roundMatch ? Number(roundMatch[0]) : null;
    const showAll = round == null;

    const gameData = extractGameData() || {};
    const guess = !showAll ? gameData.guesses?.[round - 1] : null;
    const guessCoords = isPlacedGuess(guess) ? guessCoordinate(guess) : null;
    const answer = !showAll ? gameData.rounds?.[round - 1] : null;
    const answerCoords = answer?.lat != null ? { lat: Number(answer.lat), lng: Number(answer.lng) } : null;
    const targets = [guessCoords, answerCoords].filter(Boolean);

    const guessMarkers = [...domCache.queryAll(SELECTORS.guessMarker)];
    const answerMarkers = [...domCache.queryAll(SELECTORS.answerMarker)];
    const bounds = new google.maps.LatLngBounds();

    if (unsafeWindow.allPolylinesRef && state.guessMap) {
        unsafeWindow.allPolylinesRef.forEach((polyline, polylineIndex) => {
            try {
                const visible = showAll || polylineTouches(polyline, targets);
                polyline.setMap(visible ? state.guessMap : null);
            } catch (error) {
                console.warn(`[Polyline ${polylineIndex}] Error:`, error);
            }
        });
    }

    answerMarkers.forEach((marker, markerIndex) => {
        const markerRound = Number(marker.dataset.roundId) || markerRoundLabel(marker) || markerIndex + 1;
        const coords = getMarkerCoords(marker);
        const visible = showAll || markerRound === round || samePoint(coords, answerCoords);
        marker.style.display = visible ? "" : "none";
        if (visible && coords && !isNullIsland(coords)) bounds.extend(new google.maps.LatLng(coords.lat, coords.lng));
    });

    guessMarkers.forEach((marker) => {
        const coords = getMarkerCoords(marker);
        const markerRound = Number(marker.dataset.roundId) || null;
        const visible = showAll
            ? !isNullIsland(coords)
            : (markerRound === round || samePoint(coords, guessCoords));
        marker.style.display = visible ? "" : "none";
        if (visible && coords && !isNullIsland(coords)) bounds.extend(new google.maps.LatLng(coords.lat, coords.lng));
    });

    if (!state.guessMap) return;
    if (showAll) {
        state.guessMap.setCenter({ lat: 0, lng: 0 });
        state.guessMap.setZoom(2);
    } else if (!bounds.isEmpty()) {
        state.guessMap.fitBounds(bounds);
    }
}

// ============================================================================
