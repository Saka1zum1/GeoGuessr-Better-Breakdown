// API REQUESTS & DATA
async function fetchGooglePano(t, e, s, d, r) {
    try {
        const url = `https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/${t}`;
        let payload = createPayload(t, e, s, d, r);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json+protobuf",
                "x-user-agent": "grpc-web-javascript/0.1"
            },
            body: payload,
            mode: "cors",
            credentials: "omit"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } else {
            return await response.json();
        }
    } catch (error) {
        console.error(`Error fetching google pano: ${error.message}`);
    }
}

function createPayload(mode, coorData, s, d, r) {
    var payload;
    let type = 2
    if (mode === 'GetMetadata') {
        if (String(coorData).startsWith('CIHM') || coorData.length != 22) type = 10
        payload = [["apiv3"], ["en", "US"], [[[type, coorData]]], [[1, 2, 3, 4, 8, 6]]];
    }
    else if (mode === 'SingleImageSearch') {
        payload = [["apiv3"],
                   [[null, null, parseFloat(coorData.lat), parseFloat(coorData.lng)], r],
                   [[null, null, null, null, null, null, null, null, null, null, [s, d]], null, null, null, null, null, null, null, [2], null, [[[type, true, 2]]]], [[1, 2, 3, 4, 8, 6]]]
    }
    else {
        throw new Error("Invalid mode!");
    }
    return JSON.stringify(payload);
}

async function getLOCATION(panoId) {
    const id = panoId || state.viewer?.getPano?.();
    if (!id) return state.LOCATION || null;
    const metaData = await fetchGooglePano('GetMetadata', id);
    if (metaData) {
        state.LOCATION = parseMeta(metaData)
        if(state.viewer?.getPov){
            state.LOCATION.heading = state.viewer.getPov().heading;
            state.LOCATION.pitch = state.viewer.getPov().pitch;
            state.LOCATION.zoom = state.viewer.getZoom();
        }
        return state.LOCATION
    }
    return state.LOCATION || null;
}

function calculateFOV(zoom) {
    const pi = Math.PI;
    const argument = (3 / 4) * Math.pow(2, 1 - zoom);
    const radians = Math.atan(argument);
    const degrees = (360 / pi) * radians;
    return degrees;
}

// ============================================================================
