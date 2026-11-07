// MAP CONTROLS & UI
function addOpacityControl(layer) {
    function updateSliderBackground(slider, value) {
        const percentage = (value / slider.getAttribute('max')) * 100;
        slider.style.background = `linear-gradient(to right, #2196F3 0%, #2196F3 ${percentage}%, #d0d0d0 ${percentage}%, #d0d0d0 100%)`;
    }

    if (state.opacityControl) removeOpacityControl();

    state.opacityControl = document.createElement('div');
    state.opacityControl.className = 'map-control sv-opacity-control';
    state.opacityControl.id = 'sv-opacity-control';

    const slider = document.createElement('input');
    slider.className = 'sv-opacity-control__slider';
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', '0');
    slider.setAttribute('max', '100');
    slider.setAttribute('step', '20');
    const savedOpacity = GM_getValue('coverageOpacity', '100');
    slider.value = savedOpacity;
    slider.title = 'Adjust visibility of Street View coverage overlay';

    layer.set('opacity', savedOpacity / 100);
    updateSliderBackground(slider, savedOpacity);


    slider.addEventListener('input', function () {
        const opacity = slider.value / 100
        layer.set('opacity', opacity);
        GM_setValue('coverageOpacity', slider.value);
        updateSliderBackground(slider, slider.value);
    });

    state.opacityControl.appendChild(slider);
    const container = document.getElementById('sv-coverage-toggle')?.parentElement;
    if (container) container.appendChild(state.opacityControl);
}

function removeOpacityControl() {
    if (state.opacityControl) {
        state.opacityControl.remove();
        state.opacityControl = null;
    }
}

function setMapControls(container) {
    if(!container) container = domCache.queryOne(SELECTORS.controlHost);
    if(!container) return
    if (getComputedStyle(container).position === "static") container.style.position = "relative";
    let duelEndMiniMap = domCache.queryOne(SELECTORS.duelEndMap);
    let pathControl = document.getElementById('path-focus');
    let mapTypeControl = document.getElementById('map-type-toggle');
    let coverageLayerControl = document.getElementById('sv-coverage-toggle');
    if ((coverageLayerControl && pathControl && mapTypeControl) || duelEndMiniMap) return

    let panelControl = document.getElementById('peek-duel-panel-toggle');
    let isNewDuelEnd = domCache.queryOne('[class*="duel-breakdown_roundsList"], [class*="duel-breakdown_roundView"]');
    const roundView = domCache.queryOne('[class*="duel-breakdown_roundView"]');
    if (isNewDuelEnd && roundView) container = roundView;

    if (!panelControl && isNewDuelEnd) {
        panelControl = document.createElement('button');
        panelControl.id = 'peek-duel-panel-toggle';
        panelControl.innerHTML = SVG_SOURCE.PANEL;
        panelControl.title = 'Toggle rounds panel';
        container.appendChild(panelControl);
        const roundsPanel = document.querySelector('[class^="duel-breakdown_sidebar"]');
        const roundsPanelParentEl = roundsPanel?.parentNode;
        panelControl.onclick = () => {
            if (roundsPanelParentEl.contains(roundsPanel)) {
                roundsPanel.remove();
            } else {
                roundsPanelParentEl.insertBefore(roundsPanel, roundsPanelParentEl.firstChild);
            }
        };

    }

    if (!coverageLayerControl) {
        coverageLayerControl = document.createElement('button');
        coverageLayerControl.className = 'map-control';
        coverageLayerControl.id = 'sv-coverage-toggle'
        coverageLayerControl.title = 'Toggle Street View Coverage Overlay'
        coverageLayerControl.innerHTML = `
        <img alt="Coverage Layer Toggle" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2023%2038%22%3E%3Cpath%20d%3D%22M16.6%2038.1h-5.5l-.2-2.9-.2%202.9h-5.5L5%2025.3l-.8%202a1.53%201.53%200%2001-1.9.9l-1.2-.4a1.58%201.58%200%2001-1-1.9v-.1c.3-.9%203.1-11.2%203.1-11.2a2.66%202.66%200%20012.3-2l.6-.5a6.93%206.93%200%20014.7-12%206.8%206.8%200%20014.9%202%207%207%200%20012%204.9%206.65%206.65%200%2001-2.2%205l.7.5a2.78%202.78%200%20012.4%202s2.9%2011.2%202.9%2011.3a1.53%201.53%200%2001-.9%201.9l-1.3.4a1.63%201.63%200%2001-1.9-.9l-.7-1.8-.1%2012.7zm-3.6-2h1.7L14.9%2020.3l1.9-.3%202.4%206.3.3-.1c-.2-.8-.8-3.2-2.8-10.9a.63.63%200%2000-.6-.5h-.6l-1.1-.9h-1.9l-.3-2a4.83%204.83%200%20003.5-4.7A4.78%204.78%200%200011%202.3H10.8a4.9%204.9%200%2000-1.4%209.6l-.3%202h-1.9l-1%20.9h-.6a.74.74%200%2000-.6.5c-2%207.5-2.7%2010-3%2010.9l.3.1L4.8%2020l1.9.3.2%2015.8h1.6l.6-8.4a1.52%201.52%200%20011.5-1.4%201.5%201.5%200%20011.5%201.4l.9%208.4zm-10.9-9.6zm17.5-.1z%22%20style%3D%22isolation%3Aisolate%22%20fill%3D%22%23333%22%20opacity%3D%22.7%22/%3E%3Cpath%20d%3D%22M5.9%2013.6l1.1-.9h7.8l1.2.9%22%20fill%3D%22%23ce592c%22/%3E%3Cellipse%20cx%3D%2210.9%22%20cy%3D%2213.1%22%20rx%3D%222.7%22%20ry%3D%22.3%22%20style%3D%22isolation%3Aisolate%22%20fill%3D%22%23ce592c%22%20opacity%3D%22.5%22/%3E%3Cpath%20d%3D%22M20.6%2026.1l-2.9-11.3a1.71%201.71%200%2000-1.6-1.2H5.699999999999999a1.69%201.69%200%2000-1.5%201.3l-3.1%2011.3a.61.61%200%2000.3.7l1.1.4a.61.61%200%2000.7-.3l2.7-6.7.2%2016.8h3.6l.6-9.3a.47.47%200%2001.44-.5h.06c.4%200%20.4.2.5.5l.6%209.3h3.6L15.7%2020.3l2.5%206.6a.52.52%200%2000.66.31l1.2-.4a.57.57%200%2000.5-.7z%22%20fill%3D%22%23fdbf2d%22/%3E%3Cpath%20d%3D%22M7%2013.6l3.9%206.7%203.9-6.7%22%20style%3D%22isolation%3Aisolate%22%20fill%3D%22%23cf572e%22%20opacity%3D%22.6%22/%3E%3Ccircle%20cx%3D%2210.9%22%20cy%3D%227%22%20r%3D%225.9%22%20fill%3D%22%23fdbf2d%22/%3E%3C/svg%3E" style="color: transparent;">
    `;
        container.appendChild(coverageLayerControl);
        coverageLayerControl.onclick = () => toggleCoverageLayer();
    }
    if (!pathControl) {
        pathControl = document.createElement('button');
        pathControl.className = 'map-control';
        pathControl.id = 'path-focus';
        pathControl.title = 'Toggle Movement Path';
        pathControl.innerHTML = SVG_SOURCE.PATH
        container.appendChild(pathControl);
        pathControl.onclick = () => focusPath();
    }
    if (!mapTypeControl) {
        mapTypeControl = document.createElement('button');
        mapTypeControl.className = 'map-control';
        mapTypeControl.id = 'map-type-toggle';
        mapTypeControl.innerHTML = SVG_SOURCE.Satellite
        container.appendChild(mapTypeControl);
        mapTypeControl.title = `Toggle ${MAP_TYPES[(state.mapTypeIndex + 1) % MAP_TYPES.length]} Map`;
        mapTypeControl.onclick = () => toggleMapType();
    }
}

function removeBBUI() {
    document.querySelectorAll('[class^="peek-"], .map-control, .pano-control, #pano-select').forEach(el => el.remove());
}

function toggleCoverageLayer(action) {
    if (!state.guessMap) return;
    if (!state.customMapType) state.customMapType = extendGoogleMapType();
    const shouldShow = action === "on" || (action !== "off" && !state.isCoverageLayer);
    if (shouldShow) {
        state.currentOverlays.splice(1, 0, 'Google_StreetView');
        const layers = new state.customMapType(state.currentOverlays.map(layerName => makeTileLayer(layerName)));
        state.guessMap.mapTypes.set("roadmap", layers)
    }
    else {
        state.currentOverlays = state.currentOverlays.filter(layer => layer !== 'Google_StreetView')
        removeOpacityControl()
        const layers = new state.customMapType(state.currentOverlays.map(layerName => makeTileLayer(layerName)));
        state.guessMap.mapTypes.set("roadmap", layers)
    }
    state.isCoverageLayer = shouldShow;
}

function extendGoogleMapType() {
    function MR(e, t) {
        return new Promise(n => {
            google.maps.event.addListenerOnce(e, t, n);
        });
    }

    class CustomMapType extends google.maps.ImageMapType {
        constructor(layers, options = null) {
            const defaultOptions = {
                getTileUrl: function (coord, zoom) {
                    return null;
                },
                tileSize: new google.maps.Size(256, 256),
                maxZoom: 20,
                name: 'CustomMapType',
            };


            super({ ...defaultOptions, ...options });
            this.layers = layers;
        }

        getTile(t, n, r) {
            const o = this.layers.map(i => {
                if (typeof i.getTile !== 'function') {
                    console.error('getTile method is missing in layer:', i);
                }
                return i.getTile(t, n, r);
            });
            const s = document.createElement("div");
            s.append(...o);

            Promise.all(o.map(i => MR(i, "load"))).then(() => {
                google.maps.event.trigger(s, "load");
            });

            return s;
        }


        releaseTile(tile) {
            let index = 0;
            for (const child of tile.children) {
                if (child instanceof HTMLElement) {
                    this.layers[index]?.releaseTile(child);
                    index += 1;
                }
            }
        }
    }
    return CustomMapType;
}

function makeTileLayer(layerName) {
    const tileUrl = TILE_TEMPLATE[layerName];

    const layer = new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            return tileUrl
                .replace('{z}', zoom)
                .replace('{x}', coord.x)
                .replace('{y}', coord.y);
        },
        tileSize: new google.maps.Size(256, 256),
        name: layerName,
        maxZoom: 20,
    })
    if (layerName.includes('StreetView')) addOpacityControl(layer);
    return layer;
}

function toggleMapType(reset = false) {
    if (!state.guessMap) return;

    const control = document.getElementById('map-type-toggle');

    if (reset) {
        state.mapTypeIndex = 0;
    } else {
        state.mapTypeIndex = (state.mapTypeIndex + 1) % MAP_TYPES.length;
    }

    const currentType = MAP_TYPES[state.mapTypeIndex];
    const nextType = MAP_TYPES[(state.mapTypeIndex + 1) % MAP_TYPES.length];

    if (!state.customMapType) {
        state.customMapType = extendGoogleMapType();
    }

    switch (currentType) {
        case 'Roadmap':
            // Google Maps
            state.currentOverlays[0] = 'Google_Maps'
            if (!state.currentOverlays.includes('Google_Labels')) state.currentOverlays.push('Google_Labels')
            state.currentOverlays = state.currentOverlays.filter(layer => layer !== 'Google_Hybrid_Labels')
            break;
        case 'Terrain':
            // Terrain Map
            state.currentOverlays[0] = 'Google_Terrain'
            if (!state.currentOverlays.includes('Google_Labels')) state.currentOverlays.push('Google_Labels')
            state.currentOverlays = state.currentOverlays.filter(layer => layer !== 'Google_Hybrid_Labels')
            break;
        case 'Satellite':
            // Satellite Map
            state.currentOverlays[0] = 'Google_Satellite'
            if (!state.currentOverlays.includes('Google_Hybrid_Labels')) state.currentOverlays.push('Google_Hybrid_Labels')
            state.currentOverlays = state.currentOverlays.filter(layer => layer !== 'Google_Labels')
            break;
    }

    const layers = new state.customMapType(
        state.currentOverlays.map(name => makeTileLayer(name))
    );

    state.guessMap.mapTypes.set('roadmap', layers);

    if (control) {
        control.innerHTML = SVG_SOURCE[nextType];
        control.title = `Toggle ${nextType} Map`;
    }
}

function adjustCoverageOpacity(layer, opacity) {
    if (!state.guessMap || !layer) return;

    layer.set('opacity', opacity)

    GM_setValue('coverageOpacity', opacity);
}

function resolvePathRound() {
    const answerMarkers = [...domCache.queryAll(SELECTORS.answerMarker)];
    const visibleMarkers = answerMarkers.filter((el) => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
    });
    if (visibleMarkers.length !== 1) return null;

    if (domCache.queryOne(SELECTORS.roundEnd) && state.currentMovementRound) {
        return state.currentMovementRound;
    }

    const labeled = markerRoundLabel(visibleMarkers[0]) || Number(visibleMarkers[0].dataset.roundId);
    if (labeled >= 1 && labeled <= 20) return labeled;

    if (domCache.queryOne(SELECTORS.challengeEnd)) {
        const roundColumns = domCache.queryAll("[class*='coordinate-results_clickableColumn']");
        const selectedColumn = domCache.queryOne("[class*='coordinate-results_selectedColumn']");
        const index = Array.prototype.indexOf.call(roundColumns, selectedColumn);
        if (index >= 0) return index + 1;
    }

    if (answerMarkers.length === 1) return state.currentMovementRound || getCurrentRound();
    return answerMarkers.indexOf(visibleMarkers[0]) + 1;
}

function focusPath() {
    const pathControl = document.getElementById('path-focus');

    if (state.isPlayingPath) {
        stopPathPlayback();
        if (pathControl) {
            pathControl.innerHTML = SVG_SOURCE.PATH;
            pathControl.title = 'Play Movement Path';
        }
        return;
    }

    attachVisibleMap();
    const round = resolvePathRound();
    if (!round) {
        renderMovementPaths();
        return;
    }

    if (state.currentMovementRound === round) persistMovementPath(round);
    const path = readStoredPath(round)
        || (state.currentMovementRound === round && state.currentMovementPath.length >= 2
            ? state.currentMovementPath
            : null);
    if (!path || !state.guessMap) {
        renderMovementPaths(round);
        return;
    }

    const bounds = new google.maps.LatLngBounds();
    path.forEach(point => {
        bounds.extend(new google.maps.LatLng(point.lat, point.lng));
    });
    state.guessMap.fitBounds(bounds, { padding: 100 });
    if (pathControl) {
        pathControl.innerHTML = SVG_SOURCE.STOP;
        pathControl.title = 'Stop Playback';
    }

    playPathAnimation(path);
}

function stopPathPlayback() {
    state.isPlayingPath = false;

    if (state.playbackAnimationId) {
        cancelAnimationFrame(state.playbackAnimationId);
        state.playbackAnimationId = null;
    }

    // Clean up marker
    if (state.playbackMarker) {
        state.playbackMarker.setMap(null);
        state.playbackMarker = null;
    }

    clearMovementPaths();
}

function playPathAnimation(path) {
    if (!path || path.length < 2 || !state.guessMap || !polylineApi.original) return;

    state.isPlayingPath = true;
    clearMovementPaths();

    const polyline = new polylineApi.original({
        path: [],
        geodesic: true,
        strokeColor: 'rgb(131, 18, 223)',
        strokeOpacity: 0.85,
        strokeWeight: 3,
        map: state.guessMap,
        zIndex: 99999
    });
    state.renderedMovementPaths.push(polyline);

    // Clean up existing marker before creating new one
    if (state.playbackMarker) {
        state.playbackMarker.setMap(null);
        state.playbackMarker = null;
    }

    const guessMarkerElements = domCache.queryAll(SELECTORS.guessMarker);
    const visibleGuessMarkers = Array.from(guessMarkerElements).filter(el => {
        return getComputedStyle(el).display !== 'none';
    });
    if (visibleGuessMarkers.length > 0) {
        class PlayerMarkerOverlay extends google.maps.OverlayView {
            constructor(position, markerElement) {
                super();
                this.position = position;
                this.markerElement = markerElement;
                this.div = null;
            }

            onAdd() {
                const div = document.createElement('div');
                div.style.position = 'absolute';
                div.style.zIndex = '100000';
                div.appendChild(this.markerElement);
                this.div = div;

                const panes = this.getPanes();
                panes.overlayMouseTarget.appendChild(div);
            }

            draw() {
                const projection = this.getProjection();
                const point = projection.fromLatLngToDivPixel(
                    new google.maps.LatLng(this.position.lat, this.position.lng)
                );

                if (this.div) {
                    this.div.style.left = point.x + 'px';
                    this.div.style.top = point.y + 'px';
                }
            }

            onRemove() {
                if (this.div) {
                    this.div.parentNode.removeChild(this.div);
                    this.div = null;
                }
            }

            updatePosition(position) {
                this.position = position;
                this.draw();
            }
        }

        const originalMarker = visibleGuessMarkers[0];
        const clonedMarker = originalMarker.cloneNode(true);

        state.playbackMarker = new PlayerMarkerOverlay(
            { lat: path[0].lat, lng: path[0].lng },
            clonedMarker
        );
        state.playbackMarker.setMap(state.guessMap);
    }

    let pointsWithTime = 0;
    let firstTimeIndex = -1;
    let lastTimeIndex = -1;

    for (let i = 0; i < path.length; i++) {
        if (path[i].time != null) {
            pointsWithTime++;
            if (firstTimeIndex === -1) firstTimeIndex = i;
            lastTimeIndex = i;
        }
    }

    const hasValidTimestamps = pointsWithTime >= 2 &&
          firstTimeIndex !== -1 &&
          lastTimeIndex !== -1 &&
          (path[lastTimeIndex].time - path[firstTimeIndex].time) > 100;

    const FALLBACK_INTERVAL = 200;
    const drawnPath = [];
    let currentIndex = 0;
    const animationStartTime = Date.now();

    const normalizedPath = path.map((point, index) => {
        if (hasValidTimestamps) {
            if (point.time != null) {
                return { ...point, relativeTime: point.time - path[firstTimeIndex].time };
            } else {
                let prevTime = 0;
                let nextTime = null;

                for (let i = index - 1; i >= 0; i--) {
                    if (path[i].time != null) {
                        prevTime = path[i].time - path[firstTimeIndex].time;
                        break;
                    }
                }

                for (let i = index + 1; i < path.length; i++) {
                    if (path[i].time != null) {
                        nextTime = path[i].time - path[firstTimeIndex].time;
                        break;
                    }
                }

                const relativeTime = nextTime != null ? (prevTime + nextTime) / 2 : prevTime;
                return { ...point, relativeTime };
            }
        } else {
            return { ...point, relativeTime: index * FALLBACK_INTERVAL };
        }
    });


    function animate() {
        if (!state.isPlayingPath) {
            polyline.setMap(null);
            return;
        }

        const elapsed = Date.now() - animationStartTime;
        let pathUpdated = false;
        let currentPoint = null;

        while (currentIndex < normalizedPath.length) {
            currentPoint = normalizedPath[currentIndex];

            if (currentPoint.relativeTime > elapsed) {
                break;
            }

            if (state.playbackMarker && currentPoint) {
                state.playbackMarker.updatePosition({ lat: currentPoint.lat, lng: currentPoint.lng });
            }
            drawnPath.push({ lat: currentPoint.lat, lng: currentPoint.lng });
            currentIndex++;
            pathUpdated = true;
        }

        if (pathUpdated) {
            polyline.setPath(drawnPath);
        }

        if (currentIndex < normalizedPath.length) {
            state.playbackAnimationId = requestAnimationFrame(animate);
        } else {
            state.isPlayingPath = false;
            const pathControl = document.getElementById('path-focus');
            if (pathControl) {
                pathControl.innerHTML = SVG_SOURCE.PATH;
                pathControl.title = 'Play Movement Path';
            }
            // Clean up marker
            if (state.playbackMarker) {
                state.playbackMarker.setMap(null);
                state.playbackMarker = null;
            }
        }
    }

    animate();
}

function addCreditToPage(container, duelMap) {
    if ((!window.location.href.includes('summary') && duelMap)) return
    const mapCanvas = domCache.queryOne('[class*="coordinate-result-map_map"], [class*="results-summary_mapCanvas"]');
    container = mapCanvas || domCache.queryOne(SELECTORS.controlHost) || container;

    if (!container || document.getElementById('peek-credit-container')) return;
    const isNewDuelEnd = domCache.queryOne(SELECTORS.newDuelEnd);
    if (isNewDuelEnd) container = domCache.queryOne('[class*="duel-breakdown_roundView"]') || container;
    if (getComputedStyle(container).position === "static") container.style.position = "relative";

    const element = document.createElement('div');
    element.id = 'peek-credit-container';
    element.className = 'peek-credit';
    element.innerHTML = `
		<div class="peek-credit-title">GeoGuessr Better Breakdown</div>
		<div class="peek-credit-subtitle">by <a href="https://greasyfork.org/users/1179204-kakageo/" target="_blank" rel="noopener noreferrer">kakageo</a>.</div>`;
    container.appendChild(element);
    if (duelMap) element.style.left = '4rem';
    else element.style.left = '1rem';
}

const TOOLTIP_BASE_STYLE = {
    position: 'absolute',
    left: '50%',
    top: '-100%',
    background: '#fff',
    color: '#000',
    transform: 'translateX(-50%) translateY(-8px) scale(0)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    opacity: '0',
    visibility: 'hidden',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    pointerEvents: 'none',
    zIndex: '9999'
};

function createTooltip(text, styles = {}) {
    const tooltip = document.createElement('div');
    tooltip.textContent = text;

    applyStyles(tooltip, TOOLTIP_BASE_STYLE);

    return tooltip;
}

function bindTooltip(wrapper, tooltip) {
    wrapper.appendChild(tooltip);

    const show = () =>
    applyStyles(tooltip, {
        transform: 'translateX(-50%) scale(1)',
        opacity: '1',
        visibility: 'visible'
    });

    const hide = () =>
    applyStyles(tooltip, {
        transform: 'translateX(-50%) scale(0)',
        opacity: '0',
        visibility: 'hidden'
    });

    wrapper.addEventListener('mouseenter', show);
    wrapper.addEventListener('mouseleave', hide);
}

function createActionWrapper({
    source,
    id,
    tooltip,
    tooltipStyle,
    onInit
})
{
    const wrapper = source.cloneNode(true);

    wrapper.id = id;

    if (tooltip) {
        bindTooltip(
            wrapper,
            createTooltip(tooltip, tooltipStyle)
        );
    }

    onInit?.(wrapper);

    return wrapper;
}

function addExportBtns() {
    if (document.getElementById('export-wrapper') || document.getElementById('copy-wrapper')) return;

    const container = document.querySelector('[class^="learning-hub_mapNavActions"]');
    const template = container?.querySelector('span[class*="tooltip_reference"]');

    if (!template) return;

    const buttons = [
        {
            id: 'export-wrapper',
            icon: SVG_SOURCE.DOWNLOAD,
            tooltip: 'Export guesses as csv file'
        },
        {
            id: 'copy-wrapper',
            icon: SVG_SOURCE.COPY,
            tooltip: 'Copy guesses as JSON'
        }
    ];

    buttons.forEach(({ id, icon, tooltip }) => {
        const btn = createActionWrapper({
            source: template,
            id,
            tooltip,
            onInit(wrapper) {
                wrapper.querySelector('svg').innerHTML = icon;
            }
        });
        if(btn.id == 'export-wrapper') btn.addEventListener('click', handleGuessesExport);
        else btn.addEventListener('click', handleGuessesCopy);
        container.appendChild(btn);
    });
}

function getScoreTag(score) {
    if (score >= 5000) return '5k';
    if (score >= 4500) return '4500-4999';
    if (score >= 4000) return '4000-4500';
    if (score >= 2500) return '2500-4000';
    if (score >= 1000) return '1000-2500';
    return '0-1000';
}

function normalizeGuesses(data, mode) {
    const MOVEMENT_RESTRICTIONS = {
        0: 'moving',
        1: 'nomove',
        7: 'nmpz'
    };

    const MAP_IDS = {
        "6983611e411dbe3f3b2a8c5b": "A Figsy World",
        "698ef135b77fb917bcdf8425": "A Modified Moving World",
        "696fe47c5b07bed052077a95": "A Moving World",
        "68bea2cfd3027b2016ce4f74": "Antibiotic",
        "661ecb894e20c3a560ef26eb": "Geoguessr Saturday",
        "62a44b22040f04bd36e8a914": "A Community World",
        "6089bfcff6a0770001f645dd": "An Arbitrary World",
        "643dbc7ccc47d3a344307998": "An Arbitrary Rural World",
        "6620b311f64a7b842b2ca83a": "A Pro World",
        "67101e71077612dd6ac8de79": "Supersonic",
        "66014417ff2366aa9a7504df": "The World",
        "6782d7f16a0a261e8f6dad60": "An Extra-Informed World",
        "61f5026376f7be0001e1eb84": "A Stochastic Populated World",
        "63c23ec9563ddfcf1b8cd67e": "GeoTime",
        "681ab5c4e47c07651a02582b": "Yellow Belly"
    };

    if (mode == 1) return data.map(item => ({
        ...item,
        movementRestrictions: MOVEMENT_RESTRICTIONS[item.movementRestrictions] ?? item.movementRestrictions,
        mapSlug : MAP_IDS[item.mapSlug] ?? item.mapSlug,

    }));
    else {
        return data.map(item => ({
            lat: item.roundLat,
            lng: item.roundLng,
            heading: 0,
            pitch:  0,
            zoom: 0,
            panoId: null,
            extra: {
                tags: [
                    item.gameType,
                    MOVEMENT_RESTRICTIONS[item.movementRestrictions] ?? String(item.movementRestrictions),
                    MAP_IDS[item.mapSlug] ?? null,
                    item.finishedAt?.slice(0,7),
                    getScoreTag(item.roundScore),
                    item.roundCountryCode,
                    item.roundCountryCode == item.guessCountryCode ? "CountryStreak" : null,
                ].filter(Boolean)
            }
        }));

    }
}

function csvEscape(value) {
    if (value == null) return '';

    const str = String(value);

    if (str.includes(',') || str.includes('"') ||str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
}

function handleGuessesExport() {
    const guesses = extractGuesses();
    if(!guesses) return;
    const data = normalizeGuesses(guesses, 1);

    const headers = Object.keys(data[0]);

    const csv = [headers.join(','),...data.map(row =>headers.map(key => csvEscape(row[key])).join(','))].join('\n');

    GM_download({
        url: `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`,
        name: 'guesses_history.csv',
        saveAs: true
    });
}

function handleGuessesCopy() {
    const guesses = extractGuesses();
    if(!guesses) return;
    const data ={name:"GeoGuessr_Guesses", customCoordinates: normalizeGuesses(guesses, 2)}
    if(data){
        const copyBtn = document.getElementById('copy-wrapper');
        const copySvg = copyBtn.querySelector('svg');
        copySvg.innerHTML = SVG_SOURCE.SUCCESS;

        setTimeout(() => {
            copySvg.innerHTML = SVG_SOURCE.COPY;
        }, 1500);
    }

    GM_setClipboard(JSON.stringify(data));
}

function addAnalyzeControl(container) {
    if (!container || document.getElementById('analyze-wrapper')) return;

    const templates = container.querySelectorAll('span[class*="tooltip_reference"]');

    if (templates.length < 1) return;

    const analyzeBtn = createActionWrapper({
        source: templates[1] || templates[0],
        id: 'analyze-wrapper',
        tooltip: 'Analyze Replay',
        onInit(wrapper) {
            wrapper.querySelector('img')?.remove();

            const buttonEl = wrapper.querySelector('button') || wrapper.querySelector('div');

            const icon = buttonEl.querySelector('img');
            if (icon) {
                icon.src = SVG_SOURCE.ANALYSIS;
                icon.alt = 'Analyze Replay';
            }

            else buttonEl.insertAdjacentHTML('afterbegin', SVG_SOURCE.ANALYSIS);
            wrapper.addEventListener('click', handleAnalyzeControlClick);

        }
    });

    if (container.firstChild) {
        container.insertBefore(analyzeBtn, container.firstChild);
    } else {
        container.appendChild(analyzeBtn);
    }
}

async function handleAnalyzeControlClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const { gameId } = parseUrl();

    const roundText = document.querySelector('[class*="selectedRound"]')?.querySelector('[class*="roundNumber"], [class*="roundText"], [class*="game-summary_text"]')?.textContent;

    const round = roundText?.match(/Round\s+(\d+)/)?.[1];

    if (!round) return;

    await getReplayer(gameId, round);

    analyze(round);
}

function clonePrimaryButton(id, text, onClick) {
    const source = document.querySelector('[class*="button_variantPrimary"]');

    if (!source) return null;

    const button = source.cloneNode(true);

    button.id = id;

    button.querySelector('span')?.replaceChildren(text);

    button.addEventListener('click', onClick);

    return button;
}

function addAnalyzeBtn() {
    if (document.getElementById('analyze-btn')) return;

    const container = document.querySelector('[class^="player-controls_root"]');

    if (!container) return;

    const button = clonePrimaryButton('analyze-btn', 'Analyze Replay', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(!replayData) replayData = extractReplayData();
        analyze();
    });

    if (button) container.appendChild(button);
}

// ============================================================================
