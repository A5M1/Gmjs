export const GMUI = {
    addStyle(css, doc = document) {
        const style = doc.createElement('style');
        style.textContent = css;
        (doc.head || doc.documentElement).appendChild(style);
    }
};

export const UIState = (() => {
    let key, style;

    function set(state) {
        if (!style) return;
        if (state) {
            if (!document.head.contains(style)) document.head.appendChild(style);
            style.disabled = false;
        } else {
            style.disabled = true;
        }
    }

    function toggle() {
        const curr = localStorage.getItem(key) === 'true';
        const next = !curr;
        localStorage.setItem(key, String(next));
        set(next);
    }

    function init(cfg) {
        key = cfg.key;
        style = document.createElement('style');
        style.textContent = cfg.css;
        document.addEventListener('keydown', e => {
            if (e.altKey && e.key.toLowerCase() === cfg.hotkey) toggle();
        });
        document.addEventListener('DOMContentLoaded', () => {
            set(localStorage.getItem(key) === 'true');
            if (cfg.bodyClass) document.body.classList.add(cfg.bodyClass);
        });
    }

    return { init };
})();
