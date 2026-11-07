let styled = false;

function ensureDialogStyles() {
    if (styled) return;
    styled = true;
    GM_addStyle(`
      .ggbb-dialog-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.45);
        font-family: system-ui, sans-serif;
      }
      .ggbb-dialog {
        width: min(420px, calc(100vw - 32px));
        background: #fff;
        color: #1a1a1a;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
      }
      .ggbb-dialog h3 { margin: 0 0 8px; font-size: 18px; }
      .ggbb-dialog p, .ggbb-dialog .ggbb-dialog-body { margin: 0 0 12px; font-size: 14px; line-height: 1.45; }
      .ggbb-dialog input {
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 8px;
        padding: 8px 10px;
        border: 1px solid #ccc;
        border-radius: 8px;
      }
      .ggbb-dialog-error { min-height: 1.2em; color: #b42318; font-size: 13px; margin: 0 0 8px; }
      .ggbb-dialog-actions { display: flex; justify-content: flex-end; gap: 8px; }
      .ggbb-dialog button {
        border: 0;
        border-radius: 8px;
        padding: 8px 14px;
        cursor: pointer;
      }
      .ggbb-dialog [data-confirm] { background: #007bff; color: #fff; }
      .ggbb-dialog [data-cancel] { background: #eee; color: #222; }
    `);
}

function openDialog({ title, text, html, placeholder, confirmText, cancelText, withInput, emptyMessage }) {
    ensureDialogStyles();
    return new Promise((resolve) => {
        const root = document.createElement("div");
        root.className = "ggbb-dialog-backdrop";
        const body = html
            ? `<div class="ggbb-dialog-body">${html}</div>`
            : `<p>${text || ""}</p>`;
        root.innerHTML = `
          <div class="ggbb-dialog" role="dialog" aria-modal="true">
            <h3>${title || ""}</h3>
            ${body}
            ${withInput ? `<input type="text" placeholder="${placeholder || ""}" />` : ""}
            <p class="ggbb-dialog-error"></p>
            <div class="ggbb-dialog-actions">
              ${cancelText ? `<button type="button" data-cancel>${cancelText}</button>` : ""}
              <button type="button" data-confirm>${confirmText || "OK"}</button>
            </div>
          </div>`;
        const host = document.fullscreenElement || document.body;
        host.appendChild(root);
        const input = root.querySelector("input");
        const error = root.querySelector(".ggbb-dialog-error");
        input?.focus();

        const close = (result) => {
            root.remove();
            resolve(result);
        };
        root.querySelector("[data-confirm]").addEventListener("click", () => {
            if (!withInput) {
                close({ isConfirmed: true });
                return;
            }
            const value = input.value.trim();
            if (!value) {
                error.textContent = emptyMessage || "This field is required";
                return;
            }
            close({ isConfirmed: true, value });
        });
        root.querySelector("[data-cancel]")?.addEventListener("click", () => {
            close({ isConfirmed: false });
        });
    });
}

export function alertDialog({ title, text }) {
    return openDialog({ title, text, confirmText: "OK" });
}

export function promptText({ title, html, placeholder, emptyMessage }) {
    return openDialog({
        title,
        html,
        placeholder,
        confirmText: "Save",
        cancelText: "Cancel",
        withInput: true,
        emptyMessage,
    });
}
