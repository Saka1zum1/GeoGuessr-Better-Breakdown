// STATE MANAGEMENT & PERSISTENCE
function defaultState() {
    return {
        recentMaps: []
    }
}

function loadState() {
    const data = GM_getValue('peek_state', null);
    if (!data) return;

    const dataJson = JSON.parse(data);
    Object.assign(state.PEEK_STATE, defaultState(), dataJson);
    saveState();
}

function saveState() {
    GM_setValue('peek_state', JSON.stringify(state.PEEK_STATE));
}

async function mmaFetch(url, options = {}) {
    const response = await fetch(new URL(url, 'https://map-making.app'), {
        ...options,
        headers: {
            accept: 'application/json',
            authorization: `API ${state.MAP_MAKING_API_KEY.trim()}`,
            ...options.headers
        }
    });
    if (!response.ok) {
        let message = 'Unknown error';
        try {
            const res = await response.json();
            if (res.message) {
                message = res.message;
            }
        } catch {
            //empty
        }
        alert(`An error occurred while trying to connect to Map Making App. ${message}`);
        if(response.status == 401){
            GM_setValue("MAP_MAKING_API_KEY", "PASTE_YOUR_KEY_HERE");
            state.MAP_MAKING_API_KEY ="PASTE_YOUR_KEY_HERE";
        }
        throw Object.assign(new Error(message), { response });
    }
    return response;
}

async function getMaps() {
    const response = await mmaFetch(`/api/maps`);
    const maps = await response.json();
    return maps;
}

function showLoader() {
    if (document.getElementById('peek-loader')) return;

    const element = document.createElement('div');
    element.id = 'peek-loader';
    element.className = 'peek-modal';
    element.innerHTML = `
		<div class="text">LOADING...</div>
		<div class="dim"></div>
	`;
    // Append to fullscreen element if in fullscreen, otherwise append to body
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    const targetContainer = fullscreenElement || document.body;
    targetContainer.appendChild(element);
}

function hideLoader() {
    const element = document.getElementById('peek-loader');
    if (element) element.remove();
}

async function importLocations(mapId, locations) {
    const response = await mmaFetch(`/api/maps/${mapId}/locations`, {
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            edits: [{
                action: { type: 4 },
                create: locations,
                remove: []
            }]
        })
    });
    await response.json();
}

// ============================================================================
