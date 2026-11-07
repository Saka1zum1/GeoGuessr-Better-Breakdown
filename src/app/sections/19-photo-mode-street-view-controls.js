// PHOTO MODE & STREET VIEW CONTROLS
function togglePhotoMode(photoControl) {
    state.isPhotoMode = !state.isPhotoMode;
    const panoDiv = document.getElementById('peek-pano') || document.getElementById('panorama-container');
    const isNewDuelEnd = domCache.queryOne(SELECTORS.newDuelEnd);
    const controls = panoDiv.querySelectorAll('.pano-control, .pano-jump-btn');
    const panoSelect = document.getElementById('pano-select');

    if (state.isPhotoMode) {
        enterFullscreen(panoDiv);
        for (const ctrl of controls) {
            ctrl.style.display = 'none';
        }
        if (panoSelect) panoSelect.style.display = 'none';
        state.viewer.setOptions({
            linksControl: false,
            addressControl: false,
            fullscreenControl: false,
            clickToGo: false,
        });

        applyStyles(photoControl, { opacity: '0.1' });
        photoControl.title = 'Exit Photo Mode';

        state.cleanStyle = GM_addStyle(`
  .embed-controls {display: none !important}
  .SLHIdE-sv-links-control {display: none !important}
  [alt="Google"] {display: none !important}
  .gmnoprint.SLHIdE-sv-links-control {display: none !important}
  [class$="gmnoprint"], [class$="gm-style-cc"], [class$="gm-compass"] {display: none !important}
`);
    } else {
        for (const ctrl of controls) {
            ctrl.style.display = '';
        }
        if (panoSelect) panoSelect.style.display = '';

        state.viewer.setOptions({
            linksControl: true,
            addressControl: isNewDuelEnd ? false :true,
            fullscreenControl: true,
            clickToGo: true,
        });

        if (state.cleanStyle) {
            state.cleanStyle.remove();
            state.cleanStyle = null;
        }

        applyStyles(photoControl, { opacity: '1' });
        photoControl.title = 'Photo Mode (Hide UI)';
    }
}

const getPanorama = (lat, lng) => {
    return new Promise((resolve) => {
        if (!state.svs) initSVS();
        state.svs.getPanorama(
            { location: { lat, lng }, radius: 50, source:'google' },
            (data, status) => {
                if (status === google.maps.StreetViewStatus.OK) {
                    resolve(data);
                } else {
                    resolve(null);
                }
            }
        );
    });
};

async function moveStreetView(direction) {
    if (!state.viewer) return;

    const currentPos = state.viewer.getPosition();
    if (!currentPos) return;

    const lat = currentPos.lat();
    const lng = currentPos.lng();
    const heading = state.viewer.getPov().heading;
    const TARGET_DISTANCE = 100;

    const mainHeading = direction === 'forward' ? heading : (heading + 180) % 360;
    const leftHeading = (mainHeading - 45) % 360;
    const rightHeading = (mainHeading + 45) % 360;

    const currentLatLng = new google.maps.LatLng(lat, lng);
    const mainPoint = google.maps.geometry.spherical.computeOffset(currentLatLng, TARGET_DISTANCE, mainHeading);
    const leftPoint = google.maps.geometry.spherical.computeOffset(currentLatLng, TARGET_DISTANCE, leftHeading);
    const rightPoint = google.maps.geometry.spherical.computeOffset(currentLatLng, TARGET_DISTANCE, rightHeading);

    let [panoMain, panoLeft, panoRight] = await Promise.allSettled([
        getPanorama(mainPoint.lat(), mainPoint.lng()),
        getPanorama(leftPoint.lat(), leftPoint.lng()),
        getPanorama(rightPoint.lat(), rightPoint.lng())
    ]);

    let newPos = currentPos;

    if (panoMain && panoMain.status === 'fulfilled' && panoMain.value) {
        newPos = panoMain.value.location.latLng;
    } else if (panoLeft && panoLeft.status === 'fulfilled' && panoLeft.value) {
        newPos = panoLeft.value.location.latLng;
    } else if (panoRight && panoRight.status === 'fulfilled' && panoRight.value) {
        newPos = panoRight.value.location.latLng;
    }

    state.viewer.setPosition({
        lat: newPos.lat(),
        lng: newPos.lng()
    });
}

// ============================================================================
