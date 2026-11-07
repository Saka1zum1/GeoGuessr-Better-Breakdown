const HEAT_COLORS = ["#0000ff", "#00ffff", "#00ff00", "#ffff00", "#ffa500", "#ff0000"];

function colorForIndex(index, total) {
    if (total <= 1) return HEAT_COLORS[HEAT_COLORS.length - 1];
    const slot = Math.round((index / (total - 1)) * (HEAT_COLORS.length - 1));
    return HEAT_COLORS[slot];
}

/**
 * Lightweight stand-in for deck.gl HeatmapLayer.
 * Circles stay in meters so the overlay can live on a Google Map without an extra library.
 */
export function createGuessHeatmap(points) {
    let circles = [];
    let map = null;
    let data = points || [];

    function clear() {
        for (const circle of circles) circle.setMap(null);
        circles = [];
    }

    function draw() {
        clear();
        if (!map || !data.length) return;
        const maps = unsafeWindow.google.maps;
        data.forEach((point, index) => {
            const [lng, lat] = point.position;
            if (lat == null || lng == null) return;
            circles.push(new maps.Circle({
                map,
                center: { lat, lng },
                radius: 20000,
                fillColor: colorForIndex(index, data.length),
                fillOpacity: 0.35,
                strokeWeight: 0,
                clickable: false,
            }));
        });
    }

    return {
        setMap(next) {
            map = next || null;
            if (!map) {
                clear();
                return;
            }
            draw();
        },
        setData(next) {
            data = next || [];
            draw();
        },
    };
}
