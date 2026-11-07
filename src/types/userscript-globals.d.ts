declare const GM_download: (
  details: string | { url: string; name?: string; saveAs?: boolean }
) => void;
declare const GM_addStyle: (css: string) => HTMLElement;
declare function GM_getValue<T>(key: string, defaultValue?: T): T;
declare function GM_setValue(key: string, value: unknown): void;
declare function GM_deleteValue(key: string): void;
declare function GM_setClipboard(
  data: string,
  info?: string,
  cb?: () => void
): void;
declare const GM_xmlhttpRequest: (details: {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  data?: string;
  onload?: (response: { responseText: string; status: number }) => void;
  onerror?: (error: unknown) => void;
}) => void;
declare const unsafeWindow: Window &
  typeof globalThis & {
    google?: typeof google;
  };

declare const googleMapsPromise: Promise<void>;
declare function runAsClient<T>(fn: () => T): T;

declare const Swal: import("sweetalert2").default;
declare const Chart: import("chart.js").Chart;
declare const deck: typeof import("@deck.gl/core");

interface Window {
  google?: typeof google;
}
