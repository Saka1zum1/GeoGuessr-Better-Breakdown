// REPLAY ANALYSIS
let replayData, playersList, selectedPlayer, rounds, currentGameId;

function getPlayerItem(el){
    if(!el) return null;
    const props = getReactFiber(el);
    return props?.return?.return?.memoizedProps?.value?.player;
}

async function getReplayer(gameId, round) {
    const replayControls = document.querySelector('[class^="replay_main__"]');
    if(!replayControls){
        const replayFooter = document.querySelector('[class^="duel-breakdown_replayFooter"]');
        const props = getReactFiber(replayFooter);
        if(!rounds) rounds = props?.return?.memoizedProps?.children?.[1]?.props?.game?.rounds?.length || props?.return?.memoizedProps?.children?.props?.roundCount;
        if(!playersList)playersList = props?.memoizedProps?.children?.props?.players

        selectedPlayer ={playerId: props?.memoizedProps?.children?.props?.playerId}
        currentGameId = gameId;
        replayData = await fetchReplayData(currentGameId, selectedPlayer.playerId, round);

    }
    else{
        const props = getReactFiber(replayControls);
        if(!playersList) playersList = props?.memoizedProps?.children?.[4]?.props?.players;
        if(!rounds){
            if (playersList) rounds = Math.max(...playersList.map(player => player.guesses?.length || 0));
            else rounds = document.querySelectorAll('[class*="playedRound"]').length - 3;
        }
        selectedPlayer = props?.memoizedProps?.children?.[4]?.props?.selectedPlayer || props?.return?.memoizedProps?.children?.props?.children?.[5]?.props?.selectedPlayer;
        currentGameId = gameId;
        replayData = await fetchReplayData(currentGameId, selectedPlayer.playerId, round)
    }
}

async function fetchReplayData(gameId, userId, round) {
    const url = `https://game-server.geoguessr.com/api/replays/${userId}/${gameId}/${round}`;
    try {
        const response = await fetch(url, { method: "GET", credentials: "include" });

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            return null
        }
        return await response.json();

    } catch (error) {
        console.error('Error fetching replay data:', error);
        return null;
    }
}

function parseUrl() {
    const url = window.location.href;
    const urlObj = new URL(url);

    const pathSegments = urlObj.pathname.split('/');
    const gameId = pathSegments.length > 2 ? pathSegments[2] : null;

    const round = urlObj.searchParams.get("round");
    return { gameId, round };
}

function coverCrop( srcW, srcH, dstW, dstH ) {
    const scale = Math.max(
        dstW / srcW,
        dstH / srcH
    );

    const sw = dstW / scale;
    const sh = dstH / scale;

    return {
        sx: (srcW - sw) / 2,
        sy: (srcH - sh) / 2,
        sw,
        sh,
    };
}

function drawScaled(source, width, height) {
    const {sx, sy, sw, sh} = coverCrop(
        source.width,
        source.height,
        width,
        height
    );

    const out = document.createElement("canvas");
    out.width = width;
    out.height = height;

    const ctx = out.getContext("2d");
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
        source,
        sx,
        sy,
        sw,
        sh,
        0,
        0,
        width,
        height
    );

    return out;
}

async function canvasToBlob(canvas, type = "image/png",quality) {
    return new Promise(
        (resolve, reject) => {
            canvas.toBlob(
                blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Canvas encoding failed"));
                    }
                },
                type,
                quality
            );
        }
    );
}

function downloadBlob(blob,fileName) {
    const url =URL.createObjectURL(blob);

    try{
        const a =document.createElement("a");

        a.href = url;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    finally{
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }
}

async function copyImage(blob) {
    if (
        navigator.clipboard &&
        window.ClipboardItem
    ) {
        await navigator.clipboard.write([
            new ClipboardItem({
                "image/png": blob,
            }),
        ]);

        return true;
    }

    throw new Error(
        "Clipboard image is not supported"
    );
}

function renderPanoView() {
    try {
        const host = document.querySelector('#peek-pano, [data-qa="panorama"], #panorama-container');
        const canvases = [...(host || document).querySelectorAll('canvas.widget-scene-canvas')]
            .filter((canvas) => canvas.clientWidth > 0 && canvas.clientHeight > 0 && canvas.width > 0 && canvas.height > 0);
        const canvas = canvases.sort((a, b) => (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight))[0]
            || document.querySelector('.widget-scene-canvas');
        if (!canvas) throw new Error("Street View canvas not found");

        const scaled = drawScaled(
            canvas,
            canvas.width,
            canvas.height
        );

        if (!scaled) throw new Error("Could not create output canvas");

        return scaled;
    } catch(err) {
        throw new Error("Error taking panroama screenshot: ",err)
    }
}

async function downloadPanoramaImage(panoId, fileName, w, h, zoom, d) {
    return new Promise(async (resolve, reject) => {
        try {
            let canvas, ctx, tilesPerRow, tilesPerColumn, imageUrl;
            const tileWidth = 512;
            const tileHeight = 512;

            let zoomTiles;
            imageUrl = `https://streetviewpixels-pa.googleapis.com/v1/tile?cb_client=apiv3&panoid=${panoId}&output=tile&zoom=${zoom}&nbt=0&fover=2`;
            zoomTiles = [2, 4, 8, 16, 32];
            tilesPerRow = Math.min(Math.ceil(w / tileWidth), zoomTiles[zoom - 1]);
            tilesPerColumn = Math.min(Math.ceil(h / tileHeight), zoomTiles[zoom - 1] / 2);

            const canvasWidth = tilesPerRow * tileWidth;
            const canvasHeight = tilesPerColumn * tileHeight;
            canvas = document.createElement('canvas');
            ctx = canvas.getContext('2d');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            if (w === 13312) {
                const sizeMap = {
                    4: [6656, 3328],
                    3: [3328, 1664],
                    2: [1664, 832],
                    1: [832, 416]
                };
                if (sizeMap[zoom]) {
                    [canvas.width, canvas.height] = sizeMap[zoom];
                }
            }

            const loadTile = (x, y) => {
                return new Promise(async (resolveTile) => {
                    let tile;
                    let tileUrl = `${imageUrl}&x=${x}&y=${y}`;
                    if (panoId.substring(0, 4) == 'CIHM' || panoId.length != 22) tileUrl = `https://lh3.ggpht.com/jsapi2/a/b/c/x${x}-y${y}-z${zoom}/${panoId}`
                    try {
                        tile = await loadImage(tileUrl);
                        ctx.drawImage(tile, x * tileWidth, y * tileHeight, tileWidth, tileHeight);
                        resolveTile();
                    } catch (error) {
                        console.error(`Error loading tile at ${x},${y}:`, error);
                        resolveTile();
                    }
                });
            };

            let tilePromises = [];
            for (let y = 0; y < tilesPerColumn; y++) {
                for (let x = 0; x < tilesPerRow; x++) {
                    tilePromises.push(loadTile(x, y));
                }
            }

            await Promise.all(tilePromises);
            if (d) {
                resolve(canvas.toDataURL('image/jpeg'));
            }
            else {
                canvas.toBlob(blob => {
                    downloadBlob(blob, fileName);
                    resolve();
                }, 'image/jpeg');
            }
        } catch (error) {
            alertDialog({
                title: 'Error!',
                text: error.toString(),
            });
            reject(error);
        }
    });
}

async function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
        img.src = url;
    });
}

const playerCache = new Map();

async function runWithConcurrencyLimit(tasks, limit = 5) {
    const results = [];
    let index = 0;

    async function worker() {
        while (index < tasks.length) {
            const currentIndex = index++;
            results[currentIndex] = await tasks[currentIndex]();
        }
    }

    const workers = Array.from({ length: limit }, worker);
    await Promise.all(workers);

    return results;
}

async function fetchPlayerInfo(playerId) {
    const res = await fetch(`https://www.geoguessr.com/api/v4/player-identities/${playerId}`);
    const data = await res.json();

    return {
        playerId,
        nick: data?.player?.nick || "Unknown"
    };
}

async function getPlayerWithCache(playerId) {
    if (playerCache.has(playerId)) {
        return playerCache.get(playerId);
    }

    const promise = fetchPlayerInfo(playerId)
    .catch(err => {
        console.error("Fetch failed:", playerId, err);
        return { playerId, nick: "Error" };
    });

    playerCache.set(playerId, promise);

    return promise;
}

async function analyze(round) {
    await loadChartLibs();
    let panel = document.getElementById("analysis-panel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "analysis-panel";
        panel.className = 'analysis-panel'
        panel.innerHTML =`
          <div class="panel-header" id="panel-header">
            <h2>Replay Analysis</h2>
            <button class="close-btn" onclick="document.getElementById('analysis-panel').style.display='none'">&times;</button>
          </div>
          <div class="panel-body">
            <div class="controls">
              <select id="roundSelect"></select>
              <select id="playerSelect"></select>
              <button id="toggleEventBtn">Event Analysis</button>
              <button id="toggleHeatMapBtn">Map Analysis</button>
              <button id="toggleSVBtn">StreetView Analysis</button>
            </div>
            <canvas id="chartCanvas"></canvas>
            <div class="stats-container">
              <div class="stats-card">
                <p><strong>Event Density:</strong> <span id="eventDensity">Loading...</span></p>
                <p><strong>Average Gap Time:</strong> <span id="AvgGapTime">Loading...</span></p>
                <p><strong>Pano Event Ratio:</strong> <span id="streetViewRatio">Loading...</span></p>
                <p><strong>First PanoZoom:</strong> <span id="firstPanoZoomTime">Loading...</span></p>
                <p><strong>Longest Single Gap:</strong> <span id="longestGapTime">Loading...</span></p>
              </div>
              <div class="stats-card">
                <p><strong>Switch Count:</strong> <span id="switchCount">Loading...</span></p>
                <p><strong>Total Gap Time:</strong> <span id="stagnationTime">Loading...</span></p>
                <p><strong>Map Event Ratio:</strong> <span id="mapEventRatio">Loading...</span></p>
                <p><strong>First Map Zoom:</strong> <span id="firstMapZoomTime">Loading...</span></p>
                <p><strong>Pano POV Speed:</strong> <span id="avgPovSpeed">Loading...</span></p>
              </div>
            </div>
          </div>`;
        document.body.appendChild(panel);
        let isDragging = false, offsetX, offsetY;
        const header = document.getElementById("panel-header");
        header.addEventListener("mousedown", (e) => {
            isDragging = true;
            offsetX = e.clientX - panel.offsetLeft;
            offsetY = e.clientY - panel.offsetTop;
            document.body.style.userSelect = "none";
        });

        document.addEventListener("mousemove", (e) => {
            if (isDragging) {
                panel.style.left = (e.clientX - offsetX) + "px";
                panel.style.top = (e.clientY - offsetY) + "px";
            }
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
            document.body.style.userSelect = "auto";
        });

        const toggleSVBtn = document.getElementById('toggleSVBtn');
        const toggleEventBtn = document.getElementById('toggleEventBtn');
        const toggleHeatMapBtn = document.getElementById('toggleHeatMapBtn');

        toggleEventBtn.addEventListener('click', () => {
            toggleSVBtn.style.border = 'none'
            toggleEventBtn.style.border = '2px solid grey'
            canvas.style.pointerEvents = 'auto';
            updateChartData(replayData);
            updateEventAnalysisData(replayData);
        })
        toggleSVBtn.addEventListener('click', async () => {
            toggleEventBtn.style.border = 'none'
            toggleSVBtn.style.border = '2px solid grey'
            canvas.style.pointerEvents = 'none'
            let centerHeading;

            const panoIds = replayData
            .filter(item => item.type === 'PanoPosition' && item.payload?.panoId)
            .map(item => item.payload.panoId);
            const panoId = panoIds[panoIds.length - 1];
            const metaData = await getLOCATION(panoId);

            var w = metaData.worldWidth;
            var h = metaData.worldHeight;
            centerHeading = metaData.heading;

            try {
                const imageUrl = await downloadPanoramaImage(panoId, panoId, w, h, w == 13312 ? 5 : 3, true);
                const img = await loadImage(imageUrl);
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                let lastPanoPov = { heading: 0, pitch: 0 };
                let stagnationPoints = [];
                const heatData = replayData.filter(event => ["PanoZoom", "PanoPov"].includes(event.type)).map((event, index, events) => {
                    let heading, pitch, type;
                    let time = event.time;

                    if (event.type === "PanoPov") {
                        [heading, pitch] = [event.payload.heading, event.payload.pitch]
                        lastPanoPov = { heading, pitch };
                        type = "PanoPov";
                    } else if (event.type === "PanoZoom") {
                        heading = lastPanoPov.heading;
                        pitch = lastPanoPov.pitch;
                        type = "PanoZoom";
                    }

                    if (index > 0) {
                        const prevEvent = events[index - 1];
                        const timeDiff = Math.abs(time - prevEvent.time);
                        if (timeDiff > 3000) {
                            stagnationPoints.push(index);
                        }
                    }

                    return { heading, pitch, type };
                });

                drawHeatMapOnImage(canvas, heatData, centerHeading, stagnationPoints);
            } catch (error) {
                console.error('Error downloading panorama image:', error);
            }

        })
        toggleHeatMapBtn.addEventListener('click', toggleHeatmap);

    }
    else panel.style.display = 'block';

    function updateChartData(data, playerName) {
        state.chart.resize()
        const interval = 1000;
        const eventTypes = [
            "PanoPov",
            "PanoZoom",
            "MapPosition",
            "MapZoom",
            "PinPosition",
            "MapDisplay",
            "PanoPosition",
            "Focus",
            "Timer",
            "KeyPress",
        ];

        const keyEventTypes = ["PinPosition", "MapDisplay", "GuessWithLatLng", "Timer", "Focus", "KeyPress"];
        const eventColors = {
            "MapZoom": "#0000FF",
            "MapPosition": "#FFA500",
            "PanoPov": "#00FF00",
            "PinPosition": "#00FFFF",
            "MapDisplay": "#800080",
            "PanoZoom": "#FF69B4",
            "PanoPosition": "#1E90FF",
            "KeyPress": "lightgreen",
            "Timer": "red",
            "Focus": "#FFD700"
        };

        const eventBuckets = {};
        const allEventTimes = {};

        eventTypes.forEach(eventType => {
            eventBuckets[eventType] = {};

        });
        keyEventTypes.forEach(eventType => {
            allEventTimes[eventType] = [];
        });

        data.forEach(event => {
            const eventTime = event.time;
            const relativeTime = eventTime - data[0].time;
            if (eventBuckets[event.type]) {
                const bucket = Math.floor(relativeTime / interval);

                if (!eventBuckets[event.type][bucket]) {
                    eventBuckets[event.type][bucket] = 0;
                }
                eventBuckets[event.type][bucket]++;
            }
            if (allEventTimes[event.type]) {
                allEventTimes[event.type].push(relativeTime);
            }
        });

        const labels = [];
        const maxBucket = Math.max(
            ...Object.values(eventBuckets).flatMap(bucket => Object.keys(bucket).map(Number))
        );

        for (let i = 0; i <= maxBucket; i++) {
            const relativeSeconds = (i * interval + interval / 2) / 1000;
            const minutes = Math.floor(relativeSeconds / 60);
            const seconds = Math.floor(relativeSeconds % 60);
            const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            labels.push(formattedTime);
        }

        const datasets = eventTypes.map(eventType => {
            const dataPoints = labels.map((label, index) => eventBuckets[eventType][index] || 0);
            return {
                label: eventType,
                data: dataPoints,
                fill: false,
                borderColor: eventColors[eventType],
                backgroundColor: eventColors[eventType],
                tension: 0.5,
                hidden: true
            };
        });

        const totalEventsData = labels.map((label, index) => {
            let total = 0;
            eventTypes.forEach(eventType => {
                total += eventBuckets[eventType][index] || 0;
            });
            return total;
        });

        datasets.push({
            label: 'Total Events',
            data: totalEventsData,
            fill: false,
            borderColor: 'rgba(0,0,0,0.6)',
            backgroundColor: 'rgba(0,0,0,0.6)',
            tension: 0.5
        });

        const annotations = [];
        const hiddenKeyPoints = [];

        Object.keys(allEventTimes).forEach(eventType => {
            allEventTimes[eventType].forEach((eventTime, idx) => {
                const xPosition = eventTime / 1000;

                const annotation = {
                    type: 'line',
                    xMin: xPosition,
                    xMax: xPosition,
                    borderColor: eventColors[eventType],
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                };

                if (eventType === "KeyPress") {
                    const keyPayload = data.find(
                        ev => ev.type === "KeyPress" && (ev.time - data[0].time) === eventTime
                    )?.payload?.key || "";

                    annotations.push({
                        type: 'line',
                        xMin: xPosition,
                        xMax: xPosition,
                        borderColor: eventColors[eventType],
                        borderWidth: 1.5,
                        borderDash: [5, 5],

                        hiddenPoint: {
                            x: xPosition,
                            key: keyPayload
                        }
                    });

                    hiddenKeyPoints.push({
                        x: xPosition,
                        y: 0,
                        key: keyPayload
                    });
                }

                annotations.push(annotation);
            });
        });
        datasets.push({
            label: "KeyPressHidden",
            data: hiddenKeyPoints,
            parsing: false,
            pointRadius: 4,
            pointHoverRadius: 10,
            borderWidth: 0,
            borderColor: "rgba(0,0,0,0)",
            backgroundColor: "rgba(0,0,0,0)",
            showLine: false
        });
        state.chart.data.datasets = datasets;
        state.chart.data.labels = labels;
        state.chart.options.plugins.annotation.annotations = annotations;
        state.chart.update();
    }

    function toggleHeatmap(){
        const heatData = (replayData || [])
        .filter(event => ["MapZoom","MapPosition","PinPosition","GuessWithLatLng"].includes(event.type))
        .map(event => ({
            position: [event.payload.lng, event.payload.lat],
            weight: 100
        }));

        if(!state.heatmapOverlay){
            state.heatmapOverlay = createGuessHeatmap(heatData);
            const map_container = document.querySelector('[class^="replay_root"], [class^="replay-map_guessMapContainer"], [class^="overwatch-replay-page_root"]');
            if(!map_container) return;
            const replay_map=getReplayMap(map_container);
            if(replay_map) state.heatmapOverlay.setMap(replay_map);
        }
        else{
            state.heatmapOverlay.setData(heatData);
        }
    }

    const canvas = document.getElementById('chartCanvas')
    const playerSelect = document.getElementById("playerSelect");
    const roundSelect = document.getElementById("roundSelect");
    playerSelect.innerHTML = "";
    roundSelect.innerHTML = "";

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if(!state.chart) state.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 30,
                        boxHeight: 15,
                        padding: 30
                    },
                    position: 'top',
                    align: 'center',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        pointStyle: 'rectRounded'
                    },
                },
                tooltip: {
                    enabled: true,
                    intersect: false,
                    mode: "nearest",

                    callbacks: {
                        title: () => "",
                        label: (ctx) => {
                            if (ctx.dataset.label === "KeyPressHidden") {
                                return `Key: ${ctx.raw.key}`;
                            }
                            return null;
                        }
                    },
                    backgroundColor: "rgba(0,0,0,0.75)",
                    padding: 8,
                    cornerRadius: 6
                },
                annotation: { annotations: {} },
                customTooltip: true
            },
            scales: {
                x: { title: { display: true } },
                y: { title: { display: true, text: 'Event Counts' }, beginAtZero: true }
            },

        },

    });

    if(round){
        if (playersList) {
            const tasks = playersList.map(player => {
                return () => {
                    if (player.nick) {
                        return Promise.resolve({
                            playerId: player.playerId,
                            nick: player.nick
                        });
                    }

                    return getPlayerWithCache(player.playerId);
                };
            });

            const playersData = await runWithConcurrencyLimit(tasks, 5);

            playersData.forEach(player => {
                let option = document.createElement("option");
                option.value = player.playerId;
                option.textContent = player.nick;
                playerSelect.appendChild(option);
            });

            if (selectedPlayer) {
                playerSelect.value = selectedPlayer.playerId;
            }
        }
        else playerSelect.style.display = 'none';

        if (rounds) {
            for (let i = 1; i <= rounds; i++) {
                let option = document.createElement("option")
                option.value = i;
                option.textContent = `Round ${i}`
                roundSelect.appendChild(option);
            }
        }
        if (round) roundSelect.value = parseInt(round)

        playerSelect.onchange = async () => {
            canvas.style.pointerEvents = 'auto';
            try {
                replayData = await fetchReplayData(currentGameId, playerSelect.value, roundSelect.value)
                selectedPlayer = playersList.find(player => player.playerId == playerSelect.value)
            }
            catch (e) {
                console.error("Error fetching replay data")
                return
            }
            updateChartData(replayData);
            updateEventAnalysisData(replayData);
            toggleHeatmap();
        };

        roundSelect.onchange = async () => {
            canvas.style.pointerEvents = 'auto';
            try {
                replayData = await fetchReplayData(currentGameId, playerSelect.value || selectedPlayer.playerId, roundSelect.value)
            }
            catch (e) {
                console.error("Error fetching replay data")
                return
            }
            updateChartData(replayData);
            updateEventAnalysisData(replayData);
            toggleHeatmap();
        };
    }
    else {
        playerSelect.style.display = 'none';
        roundSelect.style.display = 'none';
    }

    updateChartData(replayData);
    updateEventAnalysisData(replayData);
}

function updateEventAnalysisData(data) {
    const { eventDensity, switchCount, stagnationTime, stagnationCount, AvgGapTime, streetViewRatio, mapEventRatio, firstMapZoomTime, firstPanoZoomTime, longestGapTime, avgPovSpeed } = updateEventAnalysis(data);
    document.getElementById('eventDensity').textContent = eventDensity.toFixed(2) + " times/s";
    document.getElementById('stagnationTime').textContent = stagnationTime.toFixed(2) + " s";
    document.getElementById('longestGapTime').textContent = longestGapTime.toFixed(2) + " s";
    document.getElementById('avgPovSpeed').textContent = avgPovSpeed.toFixed(2) + " °/s";
    document.getElementById('switchCount').textContent = `${switchCount / 2} times`;
    document.getElementById('AvgGapTime').textContent = !stagnationCount ? 'None' : `${(parseFloat(stagnationTime / stagnationCount)).toFixed(2)}s`;
    document.getElementById('streetViewRatio').textContent = (streetViewRatio * 100).toFixed(2) + "%";
    document.getElementById('mapEventRatio').textContent = (mapEventRatio * 100).toFixed(2) + "%";
    document.getElementById('firstMapZoomTime').textContent = firstMapZoomTime === null ? "None" : "At " + firstMapZoomTime + " s";
    document.getElementById('firstPanoZoomTime').textContent = firstPanoZoomTime === null ? "None" : "At " + firstPanoZoomTime + " s";
}

function drawHeatMapOnImage(canvas, heatData, centerHeading, points) {
    const ctx = canvas.getContext('2d');
    heatData.forEach((point, index) => {
        let headingDifference = point.heading - centerHeading;
        if (headingDifference > 180) {
            headingDifference -= 360;
        } else if (headingDifference < -180) {
            headingDifference += 360;
        }
        const x = (headingDifference + 180) / 360 * canvas.width;
        const y = (90 - point.pitch) / 180 * canvas.height;

        ctx.beginPath();
        if (canvas.width === 13312) ctx.arc(x, y, (points.includes(index)) ? 80 : 40, 0, 2 * Math.PI);
        else ctx.arc(x, y, (points.includes(index)) ? 30 : 15, 0, 2 * Math.PI);

        if (points.includes(index)) {
            ctx.fillStyle = 'yellow';
        } else if (point.type === "PanoZoom") {
            ctx.fillStyle = '#FF0000';
        } else if (point.type === "PanoPov") {
            ctx.fillStyle = '#00FF00';
        }

        ctx.fill();
    });
}

function updateEventAnalysis(data) {
    let totalEvents = 0;
    let totalTime = 0;
    let stagnationTime = 0;
    let stagnationCount = 0;
    let switchCount = 0;
    let streetViewEvents = 0;
    let mapEvents = 0;
    let lastEventTime = null;
    let longestGapTime = 0;

    let totalHeadingDifference = 0;
    let totalTimeGap = 0;

    let lastPanoPovEventTime = null;
    let lastHeading = null;

    data.forEach(event => {
        const eventTime = event.time;
        const relativeTime = Math.floor((eventTime - data[0].time) / 1000);

        totalEvents++;
        totalTime = relativeTime;

        if (event.type.includes("Pano")) {
            streetViewEvents++;
        } else if (event.type.includes("Map")) {
            mapEvents++;
        }

        if (lastEventTime !== null) {
            const timeGap = (eventTime - lastEventTime) / 1000;

            if (timeGap >= 3) {
                if (timeGap > longestGapTime) longestGapTime = timeGap;
                stagnationTime += timeGap;
                stagnationCount++;
            }
        }

        if (event.type === "PanoPov" && lastPanoPovEventTime !== null) {
            const headingDifference = Math.abs(event.payload.heading - lastHeading);
            const timeGap = (eventTime - lastPanoPovEventTime) / 1000;

            totalHeadingDifference += headingDifference;
            totalTimeGap += timeGap;
        }

        lastEventTime = eventTime;

        if (event.type === "PanoPov") {
            lastPanoPovEventTime = eventTime;
            lastHeading = event.payload.heading;
        }

        if (event.type === "Focus" && !event.payload.focus) {
            switchCount++;
        }
    });

    const eventDensity = totalEvents / totalTime;

    const streetViewRatio = streetViewEvents / totalEvents;
    const mapEventRatio = mapEvents / totalEvents;

    let firstMapZoomTime = null;
    let firstMapZoomTime_ = null;
    let firstPanoZoomTime_ = null;
    let firstPanoZoomTime = null;
    data.forEach(event => {
        if (event.type === "MapZoom" && !firstMapZoomTime) {
            if (firstMapZoomTime_ === null) firstMapZoomTime_ = 1;
            else {
                firstMapZoomTime = Math.floor((event.time - data[0].time) / 1000);
            }
        }
        if (event.type === "PanoZoom" && !firstPanoZoomTime) {
            if (firstPanoZoomTime_ === null) firstPanoZoomTime_ = 1;
            else {
                firstPanoZoomTime = Math.floor((event.time - data[0].time) / 1000);
            }
        }
    });

    let avgPovSpeed = 0;
    if (totalTimeGap > 0) {
        avgPovSpeed = totalHeadingDifference / totalTimeGap;
    }

    return {
        eventDensity,
        stagnationTime,
        switchCount,
        stagnationCount,
        streetViewRatio,
        mapEventRatio,
        firstPanoZoomTime,
        firstMapZoomTime,
        longestGapTime,
        avgPovSpeed
    };
}

// ============================================================================
