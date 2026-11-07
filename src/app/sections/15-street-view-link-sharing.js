// STREET VIEW LINK & SHARING
async function getShortLink() {
    const url = 'https://www.google.com/maps/rpc/shorturl';
    if (!state.viewer) {
        return fallbackLink();
    }

    const aElements = domCache.queryAll('[rel="noopener"]');
    if (!aElements || aElements.length < 2) {
        return fallbackLink();
    }

    const ShareLinkElement = aElements[aElements.length - 2];
    const regex = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)a,(-?\d+(?:\.\d+)?)y,(-?\d+(?:\.\d+)?)h,(-?\d+(?:\.\d+)?)t\/data=!3m4!1e\d+!3m2!1s([^!]+)!2e\d+(?:\?.*)?/;
    const shareLink = ShareLinkElement.getAttribute('href');
    const match = shareLink.match(regex);

    if (match) {
        const [, lat, lng, , y, h, t, panoId] = match;
        const payload = `!1shttps://www.google.com/maps/@${lat},${lng},3a,${y}y,${h}h,${t}t/data=*213m5*211e1*213m3*211s${panoId}*212e0*216shttps%3A%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fpanoid%3D${panoId}%26cb_client%3Dmaps_sv.share%26w%3D900%26h%3D600%26yaw%3D${h}%26pitch%3D${90 - parseFloat(t)}%26thumbfov%3D100*217i16384*218i8192?coh=205410&entry=tts!2m1!7e81!6b1`;

        const params = new URLSearchParams({
            authuser: '0',
            hl: 'en',
            gl: 'us',
            pb: payload
        }).toString();
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: `${url}?${params}`,
                onload: function (response) {
                    if (response.status >= 200 && response.status < 300) {
                        const text = response.responseText;
                        const match = text.match(/"([^"]+)"/);
                        if (match && match[1]) {
                            resolve(match[1]);
                        } else {
                            resolve(fallbackLink());
                        }
                    } else {
                        resolve(fallbackLink());
                    }
                },
                onerror: function () {
                    resolve(fallbackLink());
                }
            });
        });
    } else {
        return fallbackLink();
    }

    function fallbackLink() {
        return `https://www.google.com/maps/@?api=1&map_action=pano&heading=${state.viewer.getPov().heading}&pitch=${state.viewer.getPov().pitch}&fov=${calculateFOV(state.viewer.getZoom())}&pano=${state.viewer.getPano()}`;
    }
}

async function updatePanoSelector(pano, selector) {
    if (!state.svs) initSVS();
    if (!selector || state.isInGame || !state.svs) return;
    const panoData = await new Promise((resolve, reject) => {
        state.svs.getPanorama(
            pano.panoId ? { pano: pano.panoId } : { location: pano.location },
            (data, status) => {
                if (status === google.maps.StreetViewStatus.OK) {
                    resolve(data);
                } else {
                    reject(new Error(`StreetView request failed: ${status}`));
                }
            }
        );
    });
    if (!panoData || !panoData.time || !panoData.imageDate) return
    const frag = document.createDocumentFragment();
    let [defaultYear, defaultMonth] = panoData.imageDate.split("-");
    if (panoData.imageDate && panoData.location?.pano) {
        frag.appendChild(new Option(
            `${MONTHS_FULL[defaultMonth - 1]} ${defaultYear} (Current)`,
            panoData.location.pano
        ));
    }

    if (Array.isArray(panoData.time) && panoData.time.length > 1) {
        for (const entry of panoData.time) {
            const date = extractDate(entry);
            if (!date) continue;
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            if (year == defaultYear && month == defaultMonth) continue;
            frag.appendChild(new Option(
                `${MONTHS_FULL[month - 1]} ${year}`,
                entry.pano
            ));
        }
    }
    selector.replaceChildren(frag);
}

// ============================================================================
