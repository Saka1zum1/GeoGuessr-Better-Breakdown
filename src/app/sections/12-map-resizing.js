// MAP RESIZING
function makeMapResizable() {
    const summaryContainer = domCache.queryOne('[class^="game-summary_innerContainer"]');
    const summaryBottom = domCache.queryOne('[class^="game-summary_bottom"]');
    if (summaryContainer) summaryContainer.style.paddingBottom = '0'
    if (summaryBottom) summaryBottom.style.minHeight = '4rem'
    const mapContainer = summaryContainer.querySelector('[class*="game-summary_mapContainer"]');
    if (!mapContainer) return;

    const containerData = initializedContainers.get(mapContainer) || {};
    if (containerData.resizable) return;

    containerData.resizable = true;
    initializedContainers.set(mapContainer, containerData);
    mapContainer.style.position = 'relative';

    const savedSize = GM_getValue('mapContainerSize', { width: null, height: null });
    if (savedSize.width && savedSize.height) {
        mapContainer.style.width = `${savedSize.width}px`;
        mapContainer.style.height = `${Math.min(window.innerHeight - 160, savedSize.height)}px`;
    }

    const resizerStyle = {
        position: 'fixed',
        background: 'rgba(100, 100, 255, 0.3)',
        transition: 'background 0.2s',
        zIndex: 10010
    };

    const resizers = [
        { name: 'top', cursor: 'n-resize', style: 'top: 0; left: 0; right: 0; height: 5px;' },
        { name: 'bottom', cursor: 's-resize', style: 'bottom: 0; left: 0; right: 0; height: 5px;' },
        { name: 'left', cursor: 'w-resize', style: 'left: 0; top: 0; bottom: 0; width: 5px;' },
        { name: 'right', cursor: 'e-resize', style: 'right: 0; top: 0; bottom: 0; width: 5px;' },
        { name: 'top-left', cursor: 'nw-resize', style: 'top: 0; left: 0; width: 10px; height: 10px;' },
        { name: 'top-right', cursor: 'ne-resize', style: 'top: 0; right: 0; width: 10px; height: 10px;' },
        { name: 'bottom-left', cursor: 'sw-resize', style: 'bottom: 0; left: 0; width: 10px; height: 10px;' },
        { name: 'bottom-right', cursor: 'se-resize', style: 'bottom: 0; right: 0; width: 10px; height: 10px;' }
    ];

    let isResizing = false;
    let currentResizer = null;
    let startX = 0, startY = 0;
    let startWidth = 0, startHeight = 0;
    let startLeft = 0, startTop = 0;

    const baseResizerStyle = `position: absolute; z-index: ${resizerStyle.zIndex}; background: ${resizerStyle.background};`;

    for (const config of resizers) {
        const resizer = document.createElement('div');
        resizer.className = `map-resizer-${config.name}`;
        resizer.style.cssText = `${config.style} ${baseResizerStyle} cursor: ${config.cursor};`;

        const updateResizerBg = (bg) => resizer.style.background = bg;
        resizer.addEventListener('mouseenter', () => updateResizerBg('rgba(100, 100, 255, 0.6)'));
        resizer.addEventListener('mouseleave', () => {
            if (!isResizing) updateResizerBg(resizerStyle.background);
        });

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            currentResizer = config.name;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = mapContainer.offsetWidth;
            startHeight = mapContainer.offsetHeight;

            const rect = mapContainer.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;

            applyStyles(document.body, { cursor: config.cursor, userSelect: 'none' });
            e.preventDefault();
            e.stopPropagation();
        });

        mapContainer.appendChild(resizer);
    }

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;

        if (currentResizer.includes('right')) {
            newWidth = startWidth + deltaX;
        } else if (currentResizer.includes('left')) {
            newWidth = startWidth - deltaX;
        }

        if (currentResizer.includes('bottom')) {
            newHeight = startHeight + deltaY;
        } else if (currentResizer.includes('top')) {
            newHeight = startHeight - deltaY;
        }

        const minWidth = 300;
        const maxWidth = window.innerWidth - 100;
        const minHeight = 250;
        const maxHeight = window.innerHeight - 160;

        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

        applyStyles(mapContainer, { width: `${newWidth}px`, height: `${newHeight}px` });
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            currentResizer = null;
            applyStyles(document.body, { cursor: '', userSelect: '' });

            GM_setValue('mapContainerSize', {
                width: mapContainer.offsetWidth,
                height: mapContainer.offsetHeight
            });

            const resizerElements = mapContainer.querySelectorAll('[class^="map-resizer-"]');
            for (const r of resizerElements) {
                r.style.background = resizerStyle.background;
            }
        }
    });
}

// ============================================================================
