// FULLSCREEN CONTROLS
function enterFullscreen(el) {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
    }
}

function exitFullscreen() {
    document.exitFullscreen?.();
    document.webkitExitFullscreen?.();
    document.msExitFullscreen?.();
}

// ============================================================================
