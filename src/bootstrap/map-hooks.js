export const polylineApi = {
    /** Original page constructor, captured before the wrapper is installed. */
    original: null,
};

export function setPreserveDrawingBuffer(enabled) {
    unsafeWindow.__ggbbPreserveBuffer = !!enabled;
}

export function installMapHooks() {
    runAsClient(() => {
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        if (originalGetContext.__ggbbPatched) return;
        function patched(type, options) {
            if (type === "webgl" || type === "webgl2") {
                options = Object.assign({}, options, { preserveDrawingBuffer: true });
            }
            return originalGetContext.call(this, type, options);
        }
        patched.__ggbbPatched = true;
        HTMLCanvasElement.prototype.getContext = patched;
    });

    return googleMapsPromise.then(() => {
        runAsClient(() => {
            const google = window.google;
            if (!google?.maps?.Polyline || google.maps.Polyline.__ggbbWrapped) return;

            const OldPolyline = google.maps.Polyline;
            window.__ggbbOriginalPolyline = OldPolyline;

            function WrappedPolyline(...args) {
                const polyline = new OldPolyline(...args);
                try {
                    polyline._isPagePolyline = true;
                    if (!window.allPolylinesRef) window.allPolylinesRef = [];
                    const list = window.allPolylinesRef;
                    list.push(polyline);
                    if (list.length > 300) list.splice(0, list.length - 300);
                } catch (e) {
                    console.warn("[Polyline hook][onCreate error]", e);
                }
                return polyline;
            }

            WrappedPolyline.prototype = OldPolyline.prototype;
            WrappedPolyline.__ggbbWrapped = true;
            Object.setPrototypeOf(WrappedPolyline, OldPolyline);
            google.maps.Polyline = WrappedPolyline;
        });

        polylineApi.original = unsafeWindow.__ggbbOriginalPolyline || unsafeWindow.google?.maps?.Polyline;
    });
}
