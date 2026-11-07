const CHART_URL = "https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js";
const ANNOTATION_URL = "https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.1.0/dist/chartjs-plugin-annotation.min.js";

let chartLibsPromise = null;

function injectUserscript(url) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url,
            onload(response) {
                if (response.status >= 400) {
                    reject(new Error(`Failed to load ${url} (${response.status})`));
                    return;
                }
                (0, eval)(response.responseText);
                resolve();
            },
            onerror: () => reject(new Error(`Failed to load ${url}`)),
        });
    });
}

/** Load Chart.js and the annotation plugin the first time the analysis panel opens. */
export function loadChartLibs() {
    if (typeof Chart !== "undefined") return Promise.resolve();
    if (!chartLibsPromise) {
        chartLibsPromise = (async () => {
            await injectUserscript(CHART_URL);
            await injectUserscript(ANNOTATION_URL);
            if (typeof Chart === "undefined") {
                throw new Error("Chart.js did not register a global");
            }
        })().catch((error) => {
            chartLibsPromise = null;
            throw error;
        });
    }
    return chartLibsPromise;
}
