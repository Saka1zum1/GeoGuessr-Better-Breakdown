// INITIALIZATION
function main() {
    startMapObserver();
    startMarkerObserver();
    loadState();
    window.addEventListener("urlchange", () => {
        startMapObserver();
        startMarkerObserver();
        loadState();
    });

    window.addEventListener("popstate", () => {
        startMapObserver();
        startMarkerObserver();
        loadState();
    });

        injectGlobalStyles();
}
