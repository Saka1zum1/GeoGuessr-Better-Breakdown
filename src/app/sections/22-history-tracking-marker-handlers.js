// HISTORY TRACKING & MARKER HANDLERS
function updateHistory(token, listKey) {
    let list = GM_getValue(listKey, []);
    list = list.filter(t => t !== token);
    list.unshift(token);
    while (list.length > STORAGE_CAP) {
        GM_deleteValue(list.pop());
    }
    GM_setValue(listKey, list);
}

function createMarkerClickHandler(pano) {
    return (e) => {
        e.preventDefault();
        e.stopPropagation();
        removePeekMarker();
        state.spawn = pano;
        if(domCache.queryOne(SELECTORS.newDuelEnd))handleNewDuelStreetView(pano);
        else openNativeStreetView(pano);
    };
}

function attachMarkerClickListener(marker, pano) {
    if (domCache.queryOne(SELECTORS.duelEndMap)) return;

    const oldHandler = markerHandlerMap.get(marker);
    if (oldHandler) {
        marker.removeEventListener("click", oldHandler);
    }
    const clickHandler = createMarkerClickHandler(pano);
    markerHandlerMap.set(marker, clickHandler);
    marker.addEventListener("click", clickHandler);
}


// ============================================================================
