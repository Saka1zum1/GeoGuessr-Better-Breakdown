export const globalStyles = `
      .analysis-panel {
        position: absolute;
        top: 10%;
        left: 25%;
        width: 700px;
        height: 640px;
        min-width: 360px;
        min-height: 320px;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        resize: both;
        overflow: auto;
        z-index: 9999;
      }

      .panel-header {
        background: #007bff;
        color: white;
        padding: 10px;
        cursor: move;
        border-radius: 10px 10px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .panel-header h2 {
        margin: 0;
        font-size: 16px;
      }

      .close-btn {
        background: transparent;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
      }

      .close-btn:hover {
          color: red;
      }

      .panel-body {
        padding: 15px;
        flex: 1;
        overflow-y: auto;
      }

      .controls {
        text-align: center;
      }

      .controls select, .controls button {
        font-size: 14px;
        padding: 8px 15px;
        border: none;
        border-radius: 6px;
        margin: 5px;
        cursor: pointer;
      }

      #roundSelect { background: #db173e; color: white; }
      #playerSelect { background: #007bff; color: white; }
      #toggleEventBtn { background: #28a745; color: white; border: 2px solid grey; }
      #toggleHeatMapBtn { background: #6144af; color: white; }
      #toggleSVBtn { background: #ffc107; color: black; }

      #chartCanvas {
        width: 90%;
        height: auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }

      .stats-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 5px;
        margin-top: 5px;
        font-size: 14px;
      }

      .stats-card {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        width: 250px;
        text-align: center;
      }

      @media (max-width: 700px) {
        .analysis-panel {
          width: 90%;
          left: 5%;
          top: 50px;
        }
        .stats-card {
          width: 100%;
        }
      }
.peek-tooltip {
    display: none;
    position: absolute;
    width: 300px;
    background: rgba(26, 26, 26, 0.95);
    color: white;
    border: 1px solid #ffd700;
    border-radius: 4px;
    padding: 8px;
    font-size: 12px;
    left: 50%;
    bottom: 45px;
    transform: translateX(-50%);
    z-index: 10000;
    pointer-events: none;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.peek-duel-tooltip {
    display: none;
    position: absolute;
    width: 280px;
    background: rgba(26, 26, 26, 0.95);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px;
    font-size: 12px;
    left: 50%;
    bottom: 45px;
    transform: translateX(-50%);
    z-index: 10000;
    pointer-events: none;
    text-align: center;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.6);
}

.peek-duel-answer-tooltip {
    display: none;
    position: absolute;
    width: 280px;
    background: rgba(30, 30, 35, 0.96);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0;
    left: 50%;
    bottom: 45px;
    transform: translateX(-50%);
    z-index: 10000;
    pointer-events: none;
    text-align: center;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.65);
    overflow: hidden;
}

[data-pano="true"]:hover .peek-duel-tooltip,
[data-pano="false"]:hover .peek-duel-tooltip {
    display: block;
}

[class*='result-map_roundPin']:hover .peek-duel-answer-tooltip {
    display: block;
}

.peek-answer-tooltip {
    display: none;
    position: absolute;
    width: 300px;
    background: rgba(30, 30, 35, 0.96);
    color: white;
    border: 1px solid #4ade80;
    border-radius: 6px;
    padding: 0;
    left: 50%;
    bottom: 45px;
    transform: translateX(-50%);
    z-index: 10000;
    pointer-events: none;
    text-align: center;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.65);
    overflow: hidden;
}

.peek-close-btn {
    position: absolute;
    top: 2px;
    right: 4px;
    background: rgba(0, 0, 0, 0.4);
    color: #ff6b6b;
    border: none;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 12px;
    line-height: 16px;
    cursor: pointer;
    z-index: 10003;
}

.peek-close-btn:hover {
    background: rgba(255, 107, 107, 0.3);
}

.peek-split-container {
    display:none;
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    background: #000;
    z-index: 10006;
    transition: right 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
    overflow: hidden;
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
}

.peek-split-container.active {
    display:block;
}

.peek-split-resizer {
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background: #7dcc4c;
    cursor: ew-resize;
    z-index: 10007;
}

.peek-split-pano {
    width: 100%;
    height: 100%;
}

.pano-control {
    background: none rgb(68, 68, 68);
    border: 0px;
    color: #b3b3b3;
    font-size: 32px;
    margin: 8px 10px;
    padding: 0px;
    text-transform: none;
    appearance: none;
    position: absolute;
    cursor: pointer;
    user-select: none;
    border-radius: 2px;
    height: 40px;
    width: 40px;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
    overflow: hidden;
    z-index: 10008;
}

.pano-control:hover {
    color: #e6e6e6;
}

.pano-control.loading svg {
    animation: rotate 2s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.map-control {
    background: rgb(0, 0, 0, 0.8);
    color: white;
    border: 0px;
    top: 100px;
    padding: 8px;
    text-transform: none;
    appearance: none;
    position: absolute;
    cursor: pointer;
    user-select: none;
    border-radius: 100%;
    height: 40px !important;
    width: 40px !important;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
    overflow: hidden;
    opacity: 0.8;
    z-index: 9999;
}

.map-control:hover {
    opacity: 1.0;
    color:#ffcf4a;
}

#sv-coverage-toggle {
    left: 1rem;
}

#map-type-toggle {
    left: 4.5rem;
}

#path-focus {
    left: 8rem;
}

#sv-opacity-control {
    left: 1rem;
    top: 64px;
    width: 100px !important;
    border-radius: 5px !important;
    height: 24px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 10px !important;
    background: #ffffff !important;
    opacity: 0.9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

.sv-opacity-control__slider {
    width: 100%;
    height: 5px;
    borde: none;
    padding: 0;
    background: linear-gradient(to right, #e8e8e8, #d0d0d0);
    outline: none;
    appearance: auto;
    cursor: pointer;
    transition: all 0.2s ease;
}

#pano-jump {
    display: flex !important;
    gap: 0 !important;
    padding: 0 !important;
    margin: 8px 10px !important;
    width: auto !important;
    height: auto !important;
    background: none rgb(68, 68, 68) !important;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px !important;
    border-radius: 2px !important;
}

.pano-jump-btn {
    padding: 8px 12px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    background: transparent;
    color: inherit;
    flex: 0 1 auto;
    border-right: 1px solid rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
    font-size: 14px;
    line-height: 1;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pano-jump-btn:first-child {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
}

.pano-jump-btn:last-child {
    border-right: none;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
}

.pano-jump-btn:hover {
    background-color: rgba(100, 100, 100, 0.5);
    color: #e6e6e6;
}

.pano-jump-btn:active {
    background-color: rgba(80, 80, 80, 0.7);
}

.peek-modal {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.peek-modal .dim {
    position: fixed;
    inset: 0;
    z-index: 0;
    background: rgba(0, 0, 0, 0.75);
}

.peek-modal .text {
    position: relative;
    z-index: 1;
}

.peek-modal .inner {
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    background: #fff;
    padding: 20px;
    margin: 20px;
    width: calc(100% - 40px);
    max-width: 500px;
    overflow: auto;
    color: #000;
    flex: 0 1 auto;
}

#peek-loader {
    color: #fff;
    font-weight: bold;
}

.peek-credit {
    position: absolute !important;
    top: 0.5rem !important;
    left: 1rem !important;
    right: auto !important;
    bottom: auto !important;
    width: max-content !important;
    height: auto !important;
    max-width: calc(100% - 2rem);
    flex: none !important;
    pointer-events: none;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
}

.peek-credit a {
    pointer-events: auto;
}

#peek-main {
    position: absolute;
    width: 40px;
    height: 40px;
    top: 0.85rem;
    right: 4rem;
    z-index: 9;
    display: flex;
    border: none;
    border-radius: 50%;
    background: #00000099;
    background-repeat: no-repeat;
    background-position: 50%;
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
}

#peek-main:hover {
    cursor: pointer;
    opacity: 0.8;
}

#peek-main::after {
    display: none;
    content: attr(data-text);
    position: absolute;
    top: 120%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 1);
    color: #fff;
    padding: 5px;
    border-radius: 5px;
    font-weight: normal;
    font-size: 11px;
    line-height: 1;
    height: auto;
    white-space: nowrap;
    transition: opacity 0.5s ease;
}

#peek-main:hover::after {
    opacity: 1;
    display: block;
}

.peek-credit.extra-pad {
    top: 2.5rem;
}

.peek-credit-title {
    font-size: 15px;
    font-weight: bold;
    text-shadow: rgb(204, 48, 46) 2px 0px 0px, rgb(204, 48, 46) 1.75517px 0.958851px 0px, rgb(204, 48, 46) 1.0806px 1.68294px 0px, rgb(204, 48, 46) 0.141474px 1.99499px 0px, rgb(204, 48, 46) -0.832294px 1.81859px 0px, rgb(204, 48, 46) -1.60229px 1.19694px 0px, rgb(204, 48, 46) -1.97998px 0.28224px 0px, rgb(204, 48, 46) -1.87291px -0.701566px 0px, rgb(204, 48, 46) -1.30729px -1.5136px 0px, rgb(204, 48, 46) -0.421592px -1.95506px 0px, rgb(204, 48, 46) 0.567324px -1.91785px 0px, rgb(204, 48, 46) 1.41734px -1.41108px 0px, rgb(204, 48, 46) 1.92034px -0.558831px 0px;
    position: relative;
    z-index: 1;
}

.peek-credit-subtitle {
    font-size: 12px;
    background: rgba(204, 48, 46, 0.4);
    padding: 3px 5px;
    border-radius: 5px;
    position: relative;
    z-index: 0;
    top: -8px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.peek-credit-subtitle a:hover {
    text-decoration: underline;
}

.peek-settings-option {
    background: var(--ds-color-purple-100);
    padding: 6px 10px;
    border-radius: 5px;
    font-size: 12px;
    cursor: pointer;
    opacity: 0.75;
    transition: opacity 0.2s;
    pointer-events: auto;
}

.peek-settings-option:hover {
    opacity: 1;
}

#peek-map-list h3 {
    margin-bottom: 10px;
}

#peek-map-list .tag-input {
    display: block;
    width: 100%;
    font: inherit;
    border: 1px solid #ccc;
}

#peek-map-list .maps {
    max-height: 200px;
    overflow-x: hidden;
    overflow-y: auto;
    font-size: 15px;
}

#peek-map-list .map {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 8px;
    transition: background 0.2s;
}

#peek-map-list .map:nth-child(2n) {
    background: #f0f0f0;
}

#peek-map-list .map-buttons:not(.is-added) .map-added {
    display: none !important;
}

#peek-map-list .map-buttons.is-added .map-add {
    display: none !important;
}

#peek-map-list .map-add {
    background: green;
    color: #fff;
    padding: 3px 6px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
}

#peek-map-list .map-added {
    background: #000;
    color: #fff;
    padding: 3px 6px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: bold;
}

#pano-select {
    width: 200px;
    height: 40px;
    padding: 5px;
    font-size: 14px;
    color: #FFFFFF;
    position: absolute;
    bottom: 8px !important;
    border-radius: 5px;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
    border: none;
    cursor: pointer;
    text-align: left;
    z-index: 10007;
    background-color: rgb(34, 34, 34, 0.9);
}

.map-name {
    color: #007b8b;
    text-decoration: underline;
}

.tag-buttons {
    margin-top: 10px;
}

.tag-button {
    margin: 5px 5px 0 0;
    padding: 4px 10px;
    border: 1px solid #ccc;
    background: #f0f0f0;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.2s;
    font-size: 16px;
    font-weight: bold;
}

.tag-button:hover {
    background: #e0e0e0;
}

.tag-button.active {
    background-color: green;
    color: white;
    border-color: green;
}

[data-pano="true"]:hover .peek-tooltip,
[data-pano="false"]:hover .peek-tooltip {
    display: block;
}

[data-qa='correct-location-marker']:hover .peek-answer-tooltip {
    display: block;
}

[data-pano="true"]> :first-child {
    cursor: pointer;
    --border-size-factor: 1.5 !important;
}

[data-pano="true"]:not([class*='result-map_roundPin'])> :first-child {
--border-color: #E91E63 !important;
}

[data-pano="false"]:not([class*='result-map_roundPin'])> :first-child {
    cursor: initial;
    --border-color: #323232 !important;
}

[data-qa='guess-marker'] {
    cursor: pointer !important;
    z-index: 1000 !important;
    transition: transform 0.2s;
}

.peek-header {
    background: #111;
    padding: 6px;
    font-size: 11px;
    color: #888;
    text-align: center;
    border-bottom: 1px solid #333;
}

.peek-dist {
    color: #ffd700;
    font-weight: bold;
    font-size: 13px;
}

.peek-note {
    font-size: 10px;
    color: #ffd700;
    margin-top: 4px;
}

.peek-body {
    height: 150px;
    background: #000;
    overflow: hidden;
    cursor: default;
}

.peek-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.peek-error {
    padding: 15px;
    color: #ff4d4d;
    font-size: 12px;
    text-align: center;
}

#peek-duel-panel-toggle {
    position: absolute;
    top: 48px;
    left: 15px;
    z-index: 10005;
    width: 44px;
    height: 44px;
    background: rgba(34, 34, 34, 0.9);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 2px 6px;
    transition: all 0.2s;
    opacity:0.7;
}

#peek-duel-panel-toggle:hover {
    background: rgba(50, 50, 50, 0.95);
    transform: scale(1.05);
}

#peek-duel-panel-toggle.active {
    background: rgba(66, 133, 244, 0.9);
}

.peek-duel-rounds-button {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 10005;
    width: 44px;
    height: 44px;
    background: rgba(34, 34, 34, 0.9);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 2px 6px;
    transition: all 0.2s;
    opacity:0.7;
}

.peek-duel-rounds-button:hover {
    background: rgba(50, 50, 50, 0.95);
    transform: scale(1.05);
}

.peek-duel-rounds-button.active {
    background: rgba(66, 133, 244, 0.9);
}

.peek-duel-rounds-panel {
    position: absolute;
    top: 0;
    left: -600px;
    width: 600px;
    height: 100%;
    background: rgba(28, 28, 30, 0.98);
    backdrop-filter: blur(10px);
    z-index: 10004;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    opacity:0.9;
}

.peek-duel-rounds-panel.active {
    left: 0;
}

.peek-duel-rounds-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 15px;
    padding-top: 50px;
}

.peek-duel-game-header {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.peek-duel-game-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.peek-duel-game-info * {
    position: static !important;
    transform: none !important;
    left: auto !important;
    top: auto !important;
    right: auto !important;
    bottom: auto !important;
}

.peek-duel-game-info [class*="game-mode-brand_selected"] {
    margin: 0;
}

.peek-duel-game-info [class*="game-mode-brand_mapName"] {
    font-size: 14px;
    opacity: 0.8;
    margin: 0;
}

.peek-duel-rounds-list {
    transform: scale(0.85);
    transform-origin: top left;
    width: 117.65%;
    margin-bottom: -70%;
}

.peek-duel-rounds-content [class*="game-summary_playedRound"] {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    margin-bottom: 8px;
    transition: background 0.2s;
    cursor: pointer;
    font-size: 0.75em;
}

.peek-duel-rounds-content [class*="game-summary_playedRound"]:hover {
    background: rgba(255, 255, 255, 0.08);
}

.peek-duel-rounds-content [class*="game-summary_selectedRound"] {
    background: rgba(66, 133, 244, 0.3) !important;
    border-left: 3px solid rgba(66, 133, 244, 0.9);
}

.peek-duel-rounds-close {
    position: absolute;
    top: 15px;
    right: 20px;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: #ffffff;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
}

.peek-duel-rounds-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

.peek-duel-rounds-pin {
    position: absolute;
    top: 15px;
    right: 64px;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: #ffffff;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
}

.peek-duel-rounds-pin.active {
    color:#97e851;
    transform: rotate(90deg);
}

.peek-duel-rounds-pin:hover {
    background: rgba(255, 255, 255, 0.3);
    color:#97e851;
    transform: rotate(90deg);
}

.peek-round-indicator {
    position: absolute;
    top: 15px;
    right: 50%;
    z-index: 10003;
    background: linear-gradient(135deg, rgba(121, 80, 229, 0.95) 0%, rgba(74, 35, 153, 0.95) 100%);
    backdrop-filter: blur(10px);
    color: rgb(255, 255, 255);
    padding: 0.5rem 1.25rem;
    border-radius: 6px;
    font-family: 'ggFont', sans-serif;
    font-size: 1rem;
    line-height: 1.25rem;
    font-weight: 700;
    font-style: italic;
    box-shadow: 0 0.375rem 0.625rem rgb(26 26 26/30%), 0 0.125rem 1.25rem 0 rgb(26 26 26/20%);
    border: 1px solid rgba(166, 133, 255, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    user-select: none;
}

.peek-round-indicator:hover {
    transform: translateY(-2px);
    box-shadow: 0 0.5rem 1rem rgb(26 26 26/40%), 0 0.25rem 1.5rem 0 rgb(26 26 26/30%);
}

@media (max-width: 768px) {
    .peek-duel-rounds-panel {
        width: 100%;
        left: -100%;
    }

    .peek-duel-rounds-panel.active {
        left: 0;
    }

    .peek-round-indicator {
        top: 10px;
        right: 10px;
        padding: 0.4rem 1rem;
        font-size: 0.875rem;
        line-height: 1rem;
    }
}

    @keyframes snakeBorderTop {
        0% { left: -100%; }
        50%, 100% { left: 100%; }
    }

    @keyframes snakeBorderRight {
        0% { top: -100%; }
        50%, 100% { top: 100%; }
    }

    @keyframes snakeBorderBottom {
        0% { right: -100%; }
        50%, 100% { right: 100%; }
    }

    @keyframes snakeBorderLeft {
        0% { bottom: -100%; }
        50%, 100% { bottom: 100%; }
    }

    [class^="result-list_listWrapper"] {
        pointer-events: auto !important;
        z-index: 1000 !important;
    }

    [class*="result-list_listItemWrapper"] {
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        pointer-events: auto !important;
        overflow: hidden;
    }

    [class*="result-list_listItemWrapper"]:hover {
        transform: scale(1.2);
        box-shadow: 0 8px 16px rgba(255, 198, 40, 0.3);
    }

    [class*="result-list_listItemWrapper"]:active {
        transform: scale(1.15);
        box-shadow: 0 4px 8px rgba(255, 198, 40, 0.2);
    }

    [class*="result-list_listItemWrapper"] .snake-border-top,
    [class*="result-list_listItemWrapper"] .snake-border-right,
    [class*="result-list_listItemWrapper"] .snake-border-bottom,
    [class*="result-list_listItemWrapper"] .snake-border-left {
        position: absolute;
        display: none;
        animation-play-state: paused;
    }

    [class*="result-list_listItemWrapper"] .snake-border-top {
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background-image: linear-gradient(90deg, transparent, #ffc628);
        animation: snakeBorderTop 1.5s linear infinite;
    }

    [class*="result-list_listItemWrapper"] .snake-border-right {
        top: -100%;
        right: 0;
        width: 2px;
        height: 100%;
        background-image: linear-gradient(180deg, transparent, #ffc628);
        animation: snakeBorderRight 1.5s linear 0.375s infinite;
    }

    [class*="result-list_listItemWrapper"] .snake-border-bottom {
        bottom: 0;
        right: -100%;
        width: 100%;
        height: 2px;
        background-image: linear-gradient(270deg, transparent, #ffc628);
        animation: snakeBorderBottom 1.5s linear 0.75s infinite;
    }

    [class*="result-list_listItemWrapper"] .snake-border-left {
        bottom: -100%;
        left: 0;
        width: 2px;
        height: 100%;
        background-image: linear-gradient(360deg, transparent, #ffc628);
        animation: snakeBorderLeft 1.5s linear 1.125s infinite;
    }

    [class*="result-list_listItemWrapper"].show-border .snake-border-top,
    [class*="result-list_listItemWrapper"].show-border .snake-border-right,
    [class*="result-list_listItemWrapper"].show-border .snake-border-bottom,
    [class*="result-list_listItemWrapper"].show-border .snake-border-left {
        display: block;
        animation-play-state: running;
    }

    [class*="result-list_roundNumber"],
    [class*="result-list_points"],
    [class*="result-list_roundInfo"] {
        transition: color 0.3s ease;
        pointer-events: auto !important;
    }

    [class*="result-list_listItemWrapper"]:hover [class*="result-list_roundNumber"],
    [class*="result-list_listItemWrapper"]:hover [class*="result-list_points"],

    [class^="duel-breakdown_classicCompass"] {
        left: .5rem !important;
        bottom : 18rem !important;
    }
    [class^="duel-breakdown_cluesPanel_"] {
        z-index: 10009 !important;
    }
    [class^="replay-map_guessMap"] {
        opacity: 0.7 !important;
    }
    [class^="replay-map_guessMap"]:hover {
        opacity: 1 !important;
    }
    img[src*="google-logo"] {
        display: none !important;
    }
`;

export function injectGlobalStyles() {
  GM_addStyle(globalStyles);
}
