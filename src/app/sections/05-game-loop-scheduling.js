// GAME LOOP & SCHEDULING
function scheduleGameLoop(delay = 200) {
    if (state.gameLoopTimer) {
        clearTimeout(state.gameLoopTimer);
    }

    state.gameLoopTimer = setTimeout(async () => {
        if (state.gameLoopRunning) return;

        state.gameLoopRunning = true;
        try {
            await gameLoop();
        } catch (err) {
            console.error('[Guess Peek] gameLoop error:', err);
        } finally {
            state.gameLoopRunning = false;
        }
    }, delay);
}

// Throttled game loop scheduler to reduce callback frequency
const throttledScheduleGameLoop = throttle(() => scheduleGameLoop(150), 100);

async function gameLoop() {
    if (!domCache.nextRoot) return;

    const isReplay = domCache.queryOne(SELECTORS.replay);
    const investigationEl = domCache.queryOne(SELECTORS.investigation);
    const analyticsMap = domCache.queryOne(SELECTORS.analyticsMap);
    if (isReplay) {
        addAnalyzeControl(isReplay)
        return;
    }
    else if(investigationEl){
        addAnalyzeBtn();
        return;
    }
    else if (analyticsMap){
        addExportBtns();
        return;
    }

    const token = getGameToken(location.pathname);
    if (token) {
        if (state.currentGameToken && state.currentGameToken !== token) {
            cleanupPanoCache();
        }
        if (!state.currentGameToken) state.currentGameToken = token
    }

    const round = getCurrentRound();
    const screen = readResultScreen();
    const ischallengeEnd = screen.daily;
    const isGameEnd = screen.classic;
    const isTeamDuelEnd = screen.legacyTeam;
    const isNewDuelEnd = screen.duel;
    const isRoundEnd = !!domCache.queryOne(SELECTORS.roundEnd);
    const resultMap = domCache.queryOne(SELECTORS.resultMap);
    const duelMap = domCache.queryOne(SELECTORS.duelMap);
    const reactionBtn = domCache.queryOne('[class*="styles_hudButton__"]')

    if (!screen.isResult) {
        removeBBUI();
        if(!state.isInGame){
            removePeekMarker();
            stopPathPlayback();
            clearMovementPaths();
            clearMovementPath();
            toggleMapType(true);
            if (state.heatmapOverlay) state.heatmapOverlay.setMap(null);
            if (state.isCoverageLayer) toggleCoverageLayer("off");
            if (unsafeWindow.allPolylinesRef?.length) unsafeWindow.allPolylinesRef.length = 0;
        }
        setPreserveDrawingBuffer(true);
        state.isInGame = true
        ensureMovementTracking();
        return
    }

    if (screen.isResult) {
        state.isInGame = false
        if (reactionBtn) reactionBtn.remove()
        if (isRoundEnd) persistMovementPath();

        if (!isRoundEnd) {
            attachRoundElementInteractions();
            addCreditToPage(resultMap, duelMap);
        }
        if (screen.classic && !screen.duel) {
            const xpDiv = domCache.queryOne("[class*='level-up-xp-button']");
            if (xpDiv) xpDiv.style.display = "none";
        }

        attachVisibleMap();
        if (!state.isPlayingPath) {
            renderMovementPaths(isRoundEnd ? state.currentMovementRound : undefined);
        }

        if (isTeamDuelEnd || isNewDuelEnd) {
            if(isNewDuelEnd && !state.viewer){
                state.viewer = getGameViewer(queryStreetViewHost());
                if(state.viewer){
                    state.viewer.setOptions({
                        fullscreenControl: true,
                        attributeConrol: true,
                        motionTracking: false,
                        motionTrackingControl: false,
                    });
                    disableMotionTracking(state.viewer);
                    addPanoControls(isNewDuelEnd);
                    trackMovement();
                    updatePanoSelector({ panoId: state.viewer.getPano() }, state.panoSelector);

                    state.viewer.addListener("position_changed",trackMovement);

                    state.viewer.addListener("pano_changed", function () {
                        updatePanoSelector({ panoId: state.viewer.getPano() }, state.panoSelector);
                    });

                    if (!state.duelHotkeysBound) {
                        state.duelHotkeysBound = true;
                        document.addEventListener('keydown', (e) => {
                            if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                                e.preventDefault();
                                document.querySelector(".gm-fullscreen-control")?.click();
                            }
                            if (e.key === '4' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                                e.preventDefault();
                                moveStreetView('backward');
                            } else if (e.key === '3' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                                e.preventDefault();
                                moveStreetView('forward');
                            }
                            if (e.key.toLowerCase() === 'n') animatePovNorth();
                        });
                    }
                }
            }

            if (isTeamDuelEnd) addDuelRoundsPanel();

            const markers = domCache.queryAll(SELECTORS.duelMarker);
            for (const marker of markers) {
                const data = getDuelData(marker);
                if (!data) continue
                await applyPanoToDuelMarker(marker, data);
            }
        }
        else updateMarkers();

        const innerMap = domCache.queryOne('[class*="coordinate-result-map_map"]');
        setMapControls(screen.duel ? (duelMap || innerMap) : (innerMap || resultMap || domCache.queryOne(SELECTORS.controlHost)));
    }
}

function readResultScreen() {
    const path = location.pathname;
    const summaryUrl = /\/(?:team-)?duels\/[^/]+\/summary\/?$/.test(path);
    const daily = path.startsWith("/daily-challenges") || !!domCache.queryOne(SELECTORS.challengeEnd);
    const duel = summaryUrl || !!domCache.queryOne(SELECTORS.newDuelEnd);
    const legacyTeam = !!domCache.queryOne(SELECTORS.teamDuelEnd);
    const classic = !!domCache.queryOne(SELECTORS.gameEnd)
        || !!domCache.queryOne('[data-qa="final-result-score"], [class*="standard-final-result"], [class*="result-layout_root"]');
    const roundResult = !!domCache.queryOne(SELECTORS.roundEnd);
    return {
        daily,
        duel,
        legacyTeam,
        classic: classic || roundResult,
        isResult: daily || duel || legacyTeam || classic || roundResult,
    };
}

// ============================================================================
