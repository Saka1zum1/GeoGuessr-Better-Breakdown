// STREET VIEW INITIALIZATION & DISPLAY
function buildMapHTML(m) {
    return `<div class="map">
    <a href="https://map-making.app/maps/${m.id}" class="map-link">
        <span class="map-name">${m.name}</span>
    </a>
    <span class="map-buttons">
        <span class="map-add" data-id="${m.id}">ADD</span>
        <span class="map-added">ADDED</span>
    </span>
</div>`;
}

function openNativeStreetView(pano) {
    if (!state.guessMap || !pano || pano.error) return;
    if (!state.isCoverageLayer) toggleCoverageLayer("on");
    const shareDiv = domCache.queryOne("[class*='standard-final-result_challengeFriendButton']")
    if (shareDiv) shareDiv.style.display = 'none'
    const xpDiv = domCache.queryOne("[class*='level-up-xp-button']")
    if (xpDiv) xpDiv.style.display = 'none'
    const mapContainer = domCache.queryOne(SELECTORS.resultMap) || domCache.queryOne(SELECTORS.duelMap);
    const isDuelMode = !!domCache.queryOne(SELECTORS.duelMap);
    const actualContainer = isDuelMode ? mapContainer.parentElement : mapContainer;

    let splitContainer = actualContainer.querySelector('.peek-split-container');
    if (!splitContainer) {
        if (isDuelMode && actualContainer) {
            actualContainer.style.position = 'relative';
        }

        splitContainer = document.createElement('div');
        splitContainer.className = 'peek-split-container';
        splitContainer.style.width = '50%';
        splitContainer.innerHTML = `
        <div class="peek-split-resizer"></div>
        <div class="peek-split-pano" id="peek-pano"></div>
    `;
        actualContainer.appendChild(splitContainer);

        const resizer = splitContainer.querySelector('.peek-split-resizer');
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = splitContainer.offsetWidth;
            applyStyles(document.body, { cursor: 'ew-resize', userSelect: 'none' });
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const deltaX = startX - e.clientX;
            const newWidth = startWidth + deltaX;
            const containerWidth = mapContainer.offsetWidth;

            const minWidth = containerWidth * 0.2;
            const maxWidth = containerWidth * 0.8;

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                const widthPercent = (newWidth / containerWidth) * 100;
                splitContainer.style.width = widthPercent + '%';
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                applyStyles(document.body, { cursor: '', userSelect: '' });
            }
        });

        const panoDiv = document.getElementById('peek-pano');

        setPreserveDrawingBuffer(true);
        state.viewer = new google.maps.StreetViewPanorama(panoDiv, {
            pov: {
                heading: pano.heading || 0,
                pitch: pano.pitch || 0
            },
            zoom: pano.zoom || 1,
            addressControl: true,
            showRoadLabels: false,
            enableCloseButton: false,
            zoomControl: true,
            clickToGo: true,
            motionTracking: false,
            motionTrackingControl: false,
        });
        disableMotionTracking(state.viewer);
        if(pano.panoId){
            if(!state.svs) initSVS();
            state.svs.getPanorama({ pano: pano.panoId }, (data, status) => {
                if (status === google.maps.StreetViewStatus.OK) {
                    state.viewer.setPano(pano.panoId);
                } else {
                    pano.panoId = null;
                    console.warn("invalid panoId, fallback to position.");
                    state.viewer.setPosition(pano.location);
                }
            });
        }
        else state.viewer.setPosition(pano.location);

        state.viewer.addListener("pano_changed", function () {
            updatePanoSelector({ panoId: state.viewer.getPano() }, state.panoSelector)
        });

        state.viewer.addListener("position_changed",trackMovement);

        state.closeControl = document.createElement('button')
        state.closeControl.className = 'pano-control'
        state.closeControl.id = 'peek-split-close'
        state.closeControl.textContent = '×'
        state.closeControl.onclick = (e) => {
            e.stopPropagation();
            if (shareDiv) shareDiv.style.display = 'block';
            if (xpDiv && !domCache.queryOne('[class*="result-list_listWrapper"], [data-qa="play-again-button"]')) {
                xpDiv.style.display = 'inline-flex';
            }
            splitContainer.classList.remove('active');
            removePeekMarker();
            clearMovementPath();
        };
        state.viewer.controls[google.maps.ControlPosition.RIGHT_TOP].push(state.closeControl);

        addPanoControls();

        document.addEventListener('keydown', (e) => {
            if (splitContainer && splitContainer.classList.contains('active')) {
                if (e.key === '4' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    moveStreetView('backward');
                } else if (e.key === '3' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    moveStreetView('forward');
                }
                if (e.key.toLowerCase() === 'n') animatePovNorth();
            }
        });
    }
    else {
        if(pano.panoId){
            state.svs.getPanorama({ pano: pano.panoId }, (data, status) => {
                if (status === google.maps.StreetViewStatus.OK) {
                    state.viewer.setPano(pano.panoId);
                } else {
                    pano.panoId = null;
                    console.warn("invalid panoId, fallback to position.");
                    state.viewer.setPosition(pano.location);
                }
            });
        }
        else state.viewer.setPosition(pano.location);

        if (pano.heading || pano.pitch) state.viewer.setPov({ heading: pano.heading || 0, pitch: pano.pitch || 0 })
        if (pano.zoom != null) state.viewer.setZoom(pano.zoom);
    }

    requestAnimationFrame(() => {
        state.spawn = pano;
        updatePanoSelector(pano, document.getElementById('pano-select'));
        clearMovementPath();
        if (!splitContainer.classList.contains('active')) splitContainer.classList.toggle('active');
    });
}

function addPanoControls(isNew) {
    const saveControl = document.createElement('button')
    saveControl.className = 'pano-control'
    saveControl.id = 'peek-save'
    saveControl.title = 'Save to MapMaking'
    saveControl.innerHTML = SVG_SOURCE.SAVE
    saveControl.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
        await getLOCATION()
        if (state.MAP_MAKING_API_KEY === 'PASTE_YOUR_KEY_HERE') {
            const result = await promptText({
                title: 'API Key Required',
                html: `To save locations to <strong>Map Making App</strong>, please enter your API key below.<br><br>
       You can generate an API key <a href="https://map-making.app/keys" target="_blank" style="color: #007bff; text-decoration: none;"><strong>here</strong></a>.`,
                placeholder: 'Enter your API key',
                emptyMessage: 'API key cannot be empty',
            });
            if (!result.isConfirmed) return;
            state.MAP_MAKING_API_KEY = result.value;
            GM_setValue("MAP_MAKING_API_KEY", result.value);
        }

        if (!state.MAP_LIST) {
            showLoader();

            try {
                state.MAP_LIST = await getMaps();
            } catch {
            }

            hideLoader();
        }

        if (state.MAP_LIST) {
            showMapList()
        } else {
            alertDialog({
                title: 'Save failed',
                text: 'Could not load maps from Map Making App. Check the API key and try again.',
            });
        }
        } catch (error) {
            console.error('Save to MapMaking failed:', error);
            hideLoader();
            alertDialog({
                title: 'Save failed',
                text: 'Could not open Map Making. Please try again.',
            });
        }
    });
    state.viewer.controls[google.maps.ControlPosition.RIGHT_TOP].push(saveControl);

    const downloadControl = document.createElement('button')
    downloadControl.className = 'pano-control'
    downloadControl.id = 'pano-download'
    downloadControl.title = 'Download Panorama Image'
    downloadControl.innerHTML = SVG_SOURCE.DOWNLOAD
    downloadControl.addEventListener('click', async () => {
        try {
            downloadControl.innerHTML = SVG_SOURCE.LOADING;
            downloadControl.title = 'Downloading...';
            downloadControl.classList.add('loading');

            const metadata = await getLOCATION();

            await downloadPanoramaImage(metadata.panoId, `${metadata.panoId}.jpg`, metadata.worldWidth, metadata.worldHeight, 5);

            downloadControl.classList.remove('loading');
            downloadControl.innerHTML = SVG_SOURCE.SUCCESS;
            downloadControl.title = 'Download Complete!';

            setTimeout(() => {
                downloadControl.innerHTML = SVG_SOURCE.DOWNLOAD;
                downloadControl.title = 'Download Panorama Image';
            }, 1500);

        } catch (error) {
            console.error('Download failed:', error);
            downloadControl.classList.remove('loading');
            downloadControl.innerHTML = SVG_SOURCE.DOWNLOAD;
            downloadControl.title = 'Download Panorama Image';
            alertDialog({
                title: 'Download Failed',
                text: 'Failed to download panorama image. Please try again.',
            });
        }
    });
    state.viewer.controls[google.maps.ControlPosition.RIGHT_TOP].push(downloadControl);

    const screenshotControl =  document.createElement('button')
    screenshotControl.className = 'pano-control'
    screenshotControl.id = 'pano-screenshot'
    screenshotControl.title = 'Click to copy screenshot. Ctrl+click to download screenshot.'
    screenshotControl.innerHTML = SVG_SOURCE.CAMERA
    screenshotControl.addEventListener('click', async (e) => {
        try {
            screenshotControl.innerHTML = SVG_SOURCE.LOADING;
            screenshotControl.title = 'Taking screenshot...';
            screenshotControl.classList.add('loading');

            const output = await renderPanoView();
            const blob = await canvasToBlob(output);

            const fileName = `${state.viewer?.location?.shortDescription}.png`;
            e.ctrlKey ? await downloadBlob(blob, fileName) : await copyImage(blob);

            screenshotControl.classList.remove('loading');
            screenshotControl.innerHTML = SVG_SOURCE.SUCCESS;
            screenshotControl.title = 'Taking screenshot Complete!';

            setTimeout(() => {
                screenshotControl.innerHTML = SVG_SOURCE.CAMERA;
                screenshotControl.title = 'Click to copy screenshot. Ctrl+click to download screenshot.';
            }, 1500);

        } catch (error) {
            console.error('Error taking screenshot:', error);
            screenshotControl.classList.remove('loading');
            screenshotControl.innerHTML = SVG_SOURCE.CAMERA;
            screenshotControl.title = 'Click to copy screenshot. Ctrl+click to download screenshot.';
            alertDialog({
                title: 'Error taking screenshot',
                text: 'Failed to take screenshot of current location. Please try again...',
            });
        }
    });
    state.viewer.controls[google.maps.ControlPosition.RIGHT_TOP].push(screenshotControl);

    const openInMapsControl = document.createElement('button')
    openInMapsControl.className = 'pano-control'
    openInMapsControl.id = 'peek-spawn'
    openInMapsControl.title = 'Open in Google Maps'
    openInMapsControl.innerHTML = SVG_SOURCE.TRANSFER
    openInMapsControl.addEventListener('click', () => {
        const url= buildMapsUrl(state.viewer);
        if (url) window.open(url);
    });
    state.viewer.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(openInMapsControl);

    const copyControl = document.createElement('button')
    copyControl.className = 'pano-control'
    copyControl.id = 'peek-copy'
    copyControl.title = 'Copy Link'
    copyControl.innerHTML = SVG_SOURCE.COPY
    copyControl.addEventListener("click", async () => {
        copyControl.innerHTML = SVG_SOURCE.LOADING;
        copyControl.classList.toggle('loading');
        const shortUrl = await getShortLink();
        copyControl.innerHTML = SVG_SOURCE.SUCCESS;
        copyControl.classList.toggle('loading');
        await GM_setClipboard(shortUrl);
        setTimeout(() => {
            copyControl.innerHTML = SVG_SOURCE.COPY;
        }, 1500);
    });
    state.viewer.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(copyControl);

    const spawnControl = document.createElement('button')
    spawnControl.className = 'pano-control'
    spawnControl.id = 'peek-spawn'
    spawnControl.title = 'Back to Spawn'
    spawnControl.innerHTML = SVG_SOURCE.SPAWN
    spawnControl.addEventListener('click', async () => {
        if (state.spawn && (state.spawn.panoId || state.spawn.location)) {
            clearMovementPath();
            state.spawn.panoId ? state.viewer.setPano(state.spawn.panoId) : state.viewer.setPosition(state.spawn.location);
            state.viewer.setPov({ heading: state.spawn.heading || 0, pitch: state.spawn.pitch || 0 });
            state.viewer.setZoom(state.spawn.zoom || 1);
        }
    });
    state.viewer.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(spawnControl);

    const photoControl = document.createElement('button')
    photoControl.className = 'pano-control'
    photoControl.id = 'peek-photo'
    photoControl.title = 'Photo Mode (Hide UI)'
    photoControl.innerHTML = SVG_SOURCE.BRUSH
    photoControl.addEventListener('click', () => {
        togglePhotoMode(photoControl);
    });
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (state.isPhotoMode) togglePhotoMode(photoControl, state.viewer);
            if(state.closeControl) state.closeControl.style.display = '';
        }
        else if(state.closeControl) state.closeControl.style.display = 'none';

    });
    state.viewer.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(photoControl);

    // Jump distance control
    const jumpControl = document.createElement('div');
    jumpControl.className = 'pano-control';
    jumpControl.id = 'pano-jump';
    const jumpForwardBtn = document.createElement('button');
    jumpForwardBtn.className = 'pano-jump-btn';
    jumpForwardBtn.textContent = '100m';
    jumpForwardBtn.title = 'Jump forward 100 metres (Hotkey: 3)';

    const jumpBackwardBtn = document.createElement('button');
    jumpBackwardBtn.className = 'pano-jump-btn';
    jumpBackwardBtn.textContent = '-100m';
    jumpBackwardBtn.title = 'Jump backward 100 metres (Hotkey: 4)';

    jumpForwardBtn.addEventListener('click', () => moveStreetView('forward'));
    jumpBackwardBtn.addEventListener('click', () => moveStreetView('backward'));

    jumpControl.appendChild(jumpForwardBtn);
    jumpControl.appendChild(jumpBackwardBtn);

    state.viewer.controls[ (isNew ? google.maps.ControlPosition.TOP_RIGHT : google.maps.ControlPosition.TOP_CENTER)].push(jumpControl);

    if (!state.panoSelector) state.panoSelector = document.createElement("select");
    state.panoSelector.id = "pano-select";
    state.panoSelector.addEventListener('change', function () {
        if (state.viewer) state.viewer.setPano(state.panoSelector.value);
    });
    state.viewer.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(state.panoSelector);
}

function handleNewDuelStreetView(pano){
    clearMovementPath();
    state.spawn = pano;

    if(pano.panoId){
        if(!state.svs) initSVS();
        state.svs.getPanorama({ pano: pano.panoId }, (data, status) => {
            if (status === google.maps.StreetViewStatus.OK) {
                state.viewer.setPano(pano.panoId);
            } else {
                pano.panoId = null;
                console.warn("invalid panoId, fallback to position.");
                state.viewer.setPosition(pano.location);
            }
        });
    }
    else state.viewer.setPosition(pano.location);
}

function showMapList() {
    if (document.getElementById('peek-map-list')) return;

    const element = document.createElement('div');
    element.id = 'peek-map-list';
    element.className = 'peek-modal';

    // Use array join for better string concatenation performance
    let recentMapsSection = '';
    if (state.PEEK_STATE.recentMaps.length > 0) {
        const recentMapsArr = state.PEEK_STATE.recentMaps.filter(m => !m.archivedAt).map(buildMapHTML);
        if (recentMapsArr.length > 0) {
            recentMapsSection = `
            <h3>Recent Maps</h3>
            <div class="maps">
                ${recentMapsArr.join('')}
            </div>
            <br>
        `;
        }
    }

    const mapsArr = state.MAP_LIST.filter(m => !m.archivedAt).map(buildMapHTML);

    const tagButtonsArr = [];
    const tagFields = state.LOCATION?.tagFields || [];
    const tagKeys = state.LOCATION?.tagKeys || [];
    const defaultTags = tagKeys.map((key, i) => state.preferTagKeys[key] ? tagFields[i] : null).filter(Boolean);
    if (tagFields.length) {
        for (let i = 0; i < tagFields.length; i++) {
            tagButtonsArr.push(`
                <button
                    class="tag-button"
                    data-tag="${tagFields[i]}"
                    data-key="${tagKeys[i]}"
                >
                    ${tagFields[i]}
                </button>
            `);
        }
    }
    if (state.previousTags.length > 0) {
        for (const tag of state.previousTags) {
            if (tagFields.includes(tag)) continue;
            tagButtonsArr.push(`<button class="tag-button" data-tag="${tag}">${tag}</button>`);
        }
    }

    element.innerHTML = `
<div class="inner">
    <h3>Tags (comma separated)</h3>

    <input type="text" class="tag-input" id="peek-map-tags" value="${defaultTags.join(', ')}"/>

    <div class="tag-buttons">
        ${tagButtonsArr.join('')}
    </div>
    <br></br>

    ${recentMapsSection}

    <h3>All Maps</h3>
    <div class="maps">
        ${mapsArr.join('')}
    </div>
</div>

<div class="dim"></div>
`;

    // Append to fullscreen element if in fullscreen, otherwise append to body
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    const targetContainer = fullscreenElement || document.body;
    targetContainer.appendChild(element);

    element.querySelector('.dim').addEventListener('click', closeMapList);

    const tagInput = document.getElementById('peek-map-tags');

    for (const btn of element.querySelectorAll('.tag-button')) {
        if (state.preferTagKeys[btn.dataset.key]) {
            btn.classList.add('active');
        }
    }

    const stopPropagation = e => e.stopPropagation();
    tagInput.addEventListener('keyup', stopPropagation);
    tagInput.addEventListener('keydown', stopPropagation);
    tagInput.addEventListener('keypress', stopPropagation);
    tagInput.focus();

    for (const map of element.querySelectorAll('.maps .map-add')) {
        map.addEventListener('click', addLocationToMap);
    }

    for (const btn of element.querySelectorAll('.tag-button')) {
        btn.addEventListener('click', function () {
            const tag = this.dataset.tag;
            const input = document.getElementById('peek-map-tags');

            let currentTags = input.value.split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

            if (this.classList.contains('active')) {
                currentTags = currentTags.filter(t => t !== tag);
                this.classList.remove('active');
            } else {
                if (!currentTags.includes(tag)) {
                    currentTags.push(tag);
                }
                this.classList.add('active');
            }

            input.value = currentTags.join(', ');
        });
    }
}

function closeMapList() {
    const element = document.getElementById('peek-map-list');
    if (element) element.remove();
}

function addLocationToMap(e) {
    e.target.parentNode.classList.add('is-added');

    const id = parseInt(e.target.dataset.id);
    state.previousMapId = id;
    GM_setValue('previousMapId', JSON.stringify(id));

    state.PEEK_STATE.recentMaps = state.PEEK_STATE.recentMaps.filter(m => m.id !== id).slice(0, 2);
    const map = state.MAP_LIST.find(m => m.id === id);
    if (map) {
        state.PEEK_STATE.recentMaps.unshift(map);
    }

    saveState();

    const tagList = document.getElementById('peek-map-tags').value.split(',').map(t => t.trim()).filter(t => t.length > 0);
    // Use Set for efficient deduplication
    const tagFieldsSet = new Set(state.LOCATION.tagFields);
    const customTags = tagList.filter(tag => !tagFieldsSet.has(tag));
    const mergedSet = new Set([...customTags, ...state.previousTags]);
    const limited = [...mergedSet].slice(0, 5);
    GM_setValue('previousTags', JSON.stringify(limited));

    for (const btn of document.querySelectorAll('#peek-map-list .tag-button.active')) {
        if (btn.dataset.key) {
            state.preferTagKeys[btn.dataset.key] = true;
        }
    }
    GM_setValue('preferTagKeys', JSON.stringify(state.preferTagKeys));

    importLocations(id, [{
        id: -1,
        location: { lat: state.LOCATION.lat, lng: state.LOCATION.lng },
        panoId: state.LOCATION.panoId ?? null,
        heading: state.LOCATION.heading ?? 90,
        pitch: state.LOCATION.pitch ?? 0,
        zoom: state.LOCATION.zoom === 0 ? null : state.LOCATION.zoom,
        tags: tagList,
        flags: state.LOCATION.panoId ? 1 : 0
    }]);
}

// ============================================================================
