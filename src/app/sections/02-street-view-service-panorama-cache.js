// STREET VIEW SERVICE & PANORAMA CACHE
function initSVS() {
    if (!state.svs && unsafeWindow.google?.maps?.StreetViewService) {
        state.svs = new unsafeWindow.google.maps.StreetViewService();
    }
}

function createCoordCacheKey(coords) {
    const lat = Number(coords.lat.toFixed(5));
    const lng = Number(coords.lng.toFixed(5));
    return `${lat},${lng}`;
}

async function getNearestPano(coords) {
    const cacheKey = createCoordCacheKey(coords);
    if (panoCache.has(cacheKey)) {
        return panoCache.get(cacheKey);
    }

    const nearestPano = { error: true };
    let radius = SEARCH_RADIUS;
    let oldRadius;
    if (!state.svs) initSVS();

    for (; ;) {
        try {
            const pano = await state.svs.getPanorama({
                location: coords,
                radius: radius,
                sources: ["google"],
                preference: "nearest",
            });

            radius = getRadius(coords, pano.data.location.latLng);
            if (oldRadius && radius >= oldRadius) break;

            nearestPano.radius = radius;
            nearestPano.location = pano.data.location.latLng
            nearestPano.panoId = pano.data.location.pano
            nearestPano.heading = pano.data.tiles.originHeading
            nearestPano.pitch = pano.data.tiles.originPitch
            nearestPano.error = false
            oldRadius = radius;
        } catch (e) {
            break;
        }
    }

    // Cache the result
    panoCache.set(cacheKey, nearestPano);

    // Limit cache size to prevent memory issues (keep last 100 entries)
    if (panoCache.size > 100) {
        const firstKey = panoCache.keys().next().value;
        panoCache.delete(firstKey);
    }

    return nearestPano;
}

// ============================================================================
