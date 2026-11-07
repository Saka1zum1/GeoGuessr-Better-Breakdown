// MARKER PROCESSING & UPDATES
function guessCoordinate(guess) {
    if (!guess) return null;
    const source = guess.coordinate || guess;
    if (source.lat == null || source.lng == null) return null;
    return { lat: Number(source.lat), lng: Number(source.lng) };
}

function isNullIsland(coords) {
    return !!coords && Math.abs(coords.lat) < 1e-5 && Math.abs(coords.lng) < 1e-5;
}

function isPlacedGuess(guess) {
    const coords = guessCoordinate(guess);
    return !!coords && !isNullIsland(coords);
}

function samePoint(a, b) {
    return !!a && !!b && Math.abs(a.lat - b.lat) < 5e-4 && Math.abs(a.lng - b.lng) < 5e-4;
}

function markerRoundLabel(marker) {
    const match = (marker.textContent || "").match(/\d+/);
    return match ? Number(match[0]) : null;
}

async function updateMarkers() {
    let guessMarkers = [...domCache.queryAll(SELECTORS.guessMarker)];
    const answerMarkers = [...domCache.queryAll(SELECTORS.answerMarker)];
    const gameData = extractGameData() || {};
    const selectedEl = document.querySelector("[class*='game-summary_selectedRound'], [class*='duel-breakdown_selectedRound']");
    let selectedRound;
    if (selectedEl) {
        const match = selectedEl.textContent.match(/\d+/);
        if (match) selectedRound = parseInt(match[0], 10) - 1;
    }
    const placedGuesses = (gameData.guesses || [])
        .map((guess, index) => ({ guess, index, coords: guessCoordinate(guess) }))
        .filter((item) => isPlacedGuess(item.guess));

    for (const [index, marker] of answerMarkers.entries()) {
        const label = markerRoundLabel(marker);
        const roundIndex = label ? label - 1 : (answerMarkers.length === 1 && selectedRound != null ? selectedRound : index);
        const data = gameData.rounds?.[roundIndex];
        const coords = (data?.lat != null && data?.lng != null)
            ? { lat: data.lat, lng: data.lng }
            : getMarkerCoords(marker);
        if (!data && !coords) continue;
        const markerData = markerDataMap.get(marker) || {};
        const bindKey = `answer_${roundIndex + 1}`;
        if (markerData.peekBound === bindKey && markerData.cachedPano && !markerData.cachedPano.error) {
            marker.dataset.roundId = String(roundIndex + 1);
            continue;
        }

        const pano = data?.panoId ? {
            panoId: convertPanoId(data.panoId),
            heading: data.heading,
            location: { lat: data.lat, lng: data.lng },
            pitch: data.pitch,
            radius: 0,
            zoom: data.zoom,
            error: false
        } : (coords && !isNullIsland(coords) ? await getNearestPano(coords) : null);
        if (pano && !(pano.error && markerData.cachedPano && !markerData.cachedPano.error)) {
            applyPanoToAnswerMarker(marker, pano, roundIndex + 1);
        }
    }

    await Promise.all(
        guessMarkers.map(async (marker) => {
            const markerCoords = getMarkerCoords(marker);
            if (!markerCoords || isNullIsland(markerCoords)) return;
            const match = placedGuesses.find((item) => samePoint(item.coords, markerCoords));
            const roundId = match ? match.index + 1 : null;
            const coords = match?.coords || markerCoords;
            const markerData = markerDataMap.get(marker) || {};
            const keySuffix = roundId || `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`;
            const bindKey = `bound_${keySuffix}`;
            if (markerData.peekBound === bindKey && markerData.cachedPano && !markerData.cachedPano.error) {
                if (roundId) marker.dataset.roundId = String(roundId);
                return;
            }

            try {
                const pano = await getNearestPano(coords);
                if (!pano || (pano.error && markerData.cachedPano && !markerData.cachedPano.error)) return;
                applyPanoToGuessMarker(marker, pano, keySuffix);
            } catch { }
        })
    );
}

function applyPanoToGuessMarker(marker, pano, roundId) {
    const bindKey = `bound_${roundId}`;
    const markerData = markerDataMap.get(marker) || {};

    if (markerData.peekBound === bindKey && markerData.cachedPano) {
        return;
    }

    markerData.peekBound = bindKey;
    markerData.pano = pano.error ? "false" : "true";
    markerData.cachedPano = pano;
    markerData.roundId = roundId;
    markerDataMap.set(marker, markerData);

    marker.style.cursor = "pointer";
    marker.style.pointerEvents = "auto";
    marker.dataset.pano = markerData.pano;
    if (Number.isFinite(roundId)) marker.dataset.roundId = String(roundId);

    const existingTooltips = marker.querySelectorAll(".peek-tooltip");
    for (const t of existingTooltips) t.remove();

    const tooltip = document.createElement("div");
    tooltip.className = "peek-tooltip";
    if (pano.error) {
        tooltip.innerHTML = `<div class="peek-error">No Street View found within 250km</div>`;
    } else {
        tooltip.innerHTML = `
        <div class="peek-header">
            <span class="peek-dist">${formatDistance(pano.radius)}</span> away from the nearest street view
        </div>
        <div class="peek-body">
            <img src="${getStreetViewThumbUrl(pano)}" class="peek-thumb" alt="Preview">
        </div>
        <div class="peek-note">Click pin to view Street View</div>
    `;
        attachMarkerClickListener(marker, pano);
    }

    marker.appendChild(tooltip);
}

function applyPanoToAnswerMarker(marker, pano, roundId) {
    const bindKey = `answer_${roundId}`;
    const markerData = markerDataMap.get(marker) || {};

    if (markerData.peekBound === bindKey && markerData.cachedPano) {
        return;
    }

    markerData.peekBound = bindKey;
    markerData.cachedPano = pano;
    markerData.roundId = roundId;
    markerDataMap.set(marker, markerData);

    marker.style.cursor = "pointer";
    marker.style.pointerEvents = "auto";
    if (Number.isFinite(roundId)) marker.dataset.roundId = String(roundId);

    const existingTooltips = marker.querySelectorAll(".peek-answer-tooltip");
    for (const t of existingTooltips) t.remove();

    const tooltip = document.createElement("div");
    tooltip.className = "peek-answer-tooltip";
    tooltip.innerHTML = `
        <div class="peek-note">Click pin to view Street View</div>
        <div class="peek-body">
            <img src="${getStreetViewThumbUrl(pano)}" class="peek-thumb">
        </div>
    `;
    marker.appendChild(tooltip);
    attachMarkerClickListener(marker, pano);
}

async function applyPanoToDuelMarker(marker, data) {
    if (!data) return;

    const markerData = markerDataMap.get(marker) || {};
    let pano;

    if (markerData.cachedPano) {
        pano = markerData.cachedPano;
    } else if (data.panorama) {
        pano = {
            panoId: data.panorama.panoId,
            location: { lat: data.panorama.lat, lng: data.panorama.lng },
            heading: data.panorama.heading,
            pitch: data.panorama.pitch,
            zoom: data.panorama.zoom
        };
        markerData.cachedPano = pano;
        markerDataMap.set(marker, markerData);
    }
    else {
        pano = await getNearestPano({ lat: data.lat, lng: data.lng });
        markerData.cachedPano = pano;
        markerDataMap.set(marker, markerData);
    }
    marker.style.cursor = "pointer";
    marker.style.pointerEvents = "auto";
    if (!data.panorama) marker.dataset.pano = pano.error ? "false" : "true";

    if (marker.querySelector(".peek-duel-tooltip") || marker.querySelector(".peek-duel-answer-tooltip")) return;

    const tooltip = document.createElement("div");
    tooltip.className = "peek-duel-tooltip";
    if (pano.error) {
        tooltip.innerHTML = `<div class="peek-error">No Street View found within 250km</div>`;
    }
    else if (data.panorama) {
        tooltip.className = "peek-duel-answer-tooltip";
        tooltip.innerHTML = `
        <div class="peek-note">Click pin to view Street View</div>
        <div class="peek-body">
            <img src="${getStreetViewThumbUrl(pano)}" class="peek-thumb">
        </div>
    `;
    }
    else {
        tooltip.innerHTML = `
        <div class="peek-header">
            <span class="peek-dist">${formatDistance(pano.radius)}</span> away from the nearest street view
        </div>
        <div class="peek-body">
            <img src="${getStreetViewThumbUrl(pano)}" class="peek-thumb" alt="Preview">
        </div>
        <div class="peek-note">Click pin to view Street View</div>
    `;
    }

    if (!pano.error) {
        attachMarkerClickListener(marker, pano);
    }

    marker.appendChild(tooltip);
}

// ============================================================================
