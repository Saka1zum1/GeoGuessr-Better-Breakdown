// DUEL ROUNDS PANEL
const initializedContainers = new WeakMap();

function addDuelRoundsPanel() {
    const mapContainer = domCache.queryOne('[class*="game-summary_mapContainer"]');
    if (!mapContainer || initializedContainers.get(mapContainer)?.duelPanel) return;

    initializedContainers.set(mapContainer, { ...initializedContainers.get(mapContainer), duelPanel: true });
    mapContainer.style.position = 'relative';
    mapContainer.style.overflow = 'hidden';

    const playedRounds = domCache.queryAll('[class*="game-summary_playedRounds"]');

    if (!playedRounds.length) {
        console.error('Duel rounds elements not found', { playedRounds });
        return;
    }

    const toggleButton = document.createElement('button');
    toggleButton.className = 'peek-duel-rounds-button';
    toggleButton.innerHTML = SVG_SOURCE.PANEL;
    toggleButton.title = 'Toggle rounds panel';

    const panel = document.createElement('div');
    panel.className = 'peek-duel-rounds-panel';

    const panelContent = document.createElement('div');
    panelContent.className = 'peek-duel-rounds-content';

    const roundsContainer = document.createElement('div');
    roundsContainer.className = 'peek-duel-rounds-list';

    for (const round of playedRounds) {
        const clonedRound = round.cloneNode(true);
        roundsContainer.appendChild(clonedRound);
    }
    const summaryTitle = domCache.queryOne('[class*="game-summary_summaryTitle"]');
    if (summaryTitle) summaryTitle.style.display = "none";

    const gameModeBrand = domCache.queryOne('[class*="game-mode-brand_root"]');
    const gameMode = gameModeBrand.querySelector('[class*="game-mode-brand_selected"]');
    const mapName = gameModeBrand.querySelector('[class*="game-mode-brand_mapName"]');
    gameModeBrand.style.display = "none";

    const gameModeHeader = document.createElement('div');
    gameModeHeader.className = 'peek-duel-game-header';

    const gameModeContainer = document.createElement('div');
    gameModeContainer.className = 'peek-duel-game-info';

    if (gameMode) {
        const clonedGameMode = gameMode.cloneNode(true);
        applyStyles(clonedGameMode, {
            position: 'static',
            transform: 'none',
            left: 'auto',
            top: 'auto',
            right: 'auto',
            bottom: 'auto'
        });
        gameModeContainer.appendChild(clonedGameMode);
    }

    if (mapName) {
        const clonedMapName = mapName.cloneNode(true);
        applyStyles(clonedMapName, {
            position: 'static',
            transform: 'none',
            left: 'auto',
            top: 'auto',
            right: 'auto',
            bottom: 'auto'
        });
        gameModeContainer.appendChild(clonedMapName);
    }

    if (gameMode || mapName) {
        gameModeHeader.appendChild(gameModeContainer);
        panelContent.appendChild(gameModeHeader);
    }
    const clonedRoundElements = roundsContainer.querySelectorAll('[class*="game-summary_playedRound"]');
    const originalRoundElements = domCache.queryAll('[class*="game-summary_playedRounds"]:not(.peek-duel-rounds-list) [class*="game-summary_playedRound"]');

    const getSelectedClass = (element) => {
        return Array.from(element.classList).find(cls => cls.includes('game-summary_selectedRound'));
    };

    const roundIndicator = document.createElement('div');
    roundIndicator.className = 'peek-round-indicator';
    roundIndicator.textContent = 'Round 1';
    mapContainer.appendChild(roundIndicator);
    const updateRoundIndicator = () => {
        const selectedElement = roundsContainer.querySelector('[class*="game-summary_selectedRound"]');
        if (selectedElement) {
            const textElement = selectedElement.querySelector('[class*="game-summary_text__"]');
            if (textElement) {
                const match = textElement.textContent.match(/Round\s+(\d+)/i);
                if (match) {
                    roundIndicator.textContent = `Round ${match[1]}`;
                }
            }
        }
    };

    clonedRoundElements.forEach((roundElement, index) => {
        roundElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const selectedClass = getSelectedClass(roundElement);
            const isAlreadySelected = selectedClass && roundElement.classList.contains(selectedClass);

            if (isAlreadySelected) {
                return;
            }

            for (const el of clonedRoundElements) {
                const selectedClass = getSelectedClass(el);
                if (selectedClass) el.classList.remove(selectedClass);
            }

            for (const el of originalRoundElements) {
                const selectedClass = getSelectedClass(el);
                if (selectedClass) el.classList.remove(selectedClass);
            }

            const originalElement = originalRoundElements[index - 2];
            if (originalElement && typeof originalElement.click === 'function') {
                originalElement.click();

                setTimeout(() => {
                    const selectedClass = getSelectedClass(originalElement);
                    if (selectedClass) {
                        if (!originalElement.classList.contains(selectedClass)) {
                            originalElement.classList.add(selectedClass);
                        }
                        if (!roundElement.classList.contains(selectedClass)) {
                            roundElement.classList.add(selectedClass);
                        }
                    }
                    updateRoundIndicator();
                }, 50);
            }

            if (state.closeControl) state.closeControl.click();
        });
    });
    panelContent.appendChild(roundsContainer);
    panel.appendChild(panelContent);

    originalRoundElements.forEach((originalEl, index) => {
        const clonedEl = clonedRoundElements[index + 2];
        if (clonedEl) {
            originalEl.addEventListener('click', () => {
                setTimeout(() => {
                    const selectedClass = getSelectedClass(originalEl);
                    if (selectedClass && originalEl.classList.contains(selectedClass)) {
                        clonedRoundElements.forEach(el => {
                            const cls = getSelectedClass(el);
                            if (cls) el.classList.remove(cls);
                        });
                        clonedEl.classList.add(selectedClass);
                        updateRoundIndicator();
                    }
                }, 50);
            });
        }
        originalEl.style.display = 'none'
    });

    updateRoundIndicator();

    const closeButton = document.createElement('button');
    closeButton.className = 'peek-duel-rounds-close';
    closeButton.innerHTML = '×';
    closeButton.title = 'Close panel';
    panel.appendChild(closeButton);

    mapContainer.appendChild(toggleButton);
    mapContainer.appendChild(panel);

    const pinButton = document.createElement('button')
    pinButton.className = 'peek-duel-rounds-pin';
    pinButton.innerHTML = SVG_SOURCE.PIN;
    pinButton.title = 'Stick panel';
    panel.appendChild(pinButton);

    const stickPanel = () => {
        pinButton.classList.toggle('active');
    };

    const togglePanel = () => {
        const isActive = panel.classList.toggle('active');
        toggleButton.classList.toggle('active');
        toggleButton.style.opacity = isActive ? '0' : '1';
        toggleButton.style.pointerEvents = isActive ? 'none' : 'auto';
    };

    const closePanel = () => {
        panel.classList.remove('active');
        toggleButton.classList.remove('active');
        applyStyles(toggleButton, { opacity: '1', pointerEvents: 'auto' });
    };

    pinButton.addEventListener('click', stickPanel);
    toggleButton.addEventListener('click', togglePanel);
    closeButton.addEventListener('click', closePanel);

    mapContainer.addEventListener('click', (e) => {
        if (panel.classList.contains('active') &&
            !pinButton.classList.contains('active') &&
            !toggleButton.contains(e.target) &&
            !closeButton.contains(e.target) &&
            !panel.contains(e.target)) {
            closePanel();
        }
    });
}

// ============================================================================
