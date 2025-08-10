// ==UserScript==
// @name             ui
// @namespace       abn
// @version         0.0.0
// @run-at          document-start
// @author          abn
// @description     
// @license         MIT
// ==/UserScript==
class OverlayUI {
    constructor() {
        this.root = document.createElement('div');
        this.root.style = 'position:fixed;z-index:999999;all:initial;';
        document.documentElement.appendChild(this.root);
        this.shadow = this.root.attachShadow({ mode: 'open' });
        this.wrap = document.createElement('div');
        this.wrap.dataset.ui = 'wrap';
        this.shadow.appendChild(this.wrap);
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Raleway&display=swap');
            [data-ui=overlay] {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,.7);
                backdrop-filter: blur(8px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: 'Raleway', sans-serif;
            }
            [data-ui=overlay]:hover {
                backdrop-filter: blur(3px);
                background: rgba(0,0,0,.4);
            }
            [data-ui=panel] {
                position: relative;
                background: #1a1a1a;
                color: #eee;
                border: 1px solid #555;
                padding: 22px;
                border-radius: 10px;
                width: 500px;
                max-width: 95vw;
                box-shadow: 0 0 20px #000c;
                display: flex;
                flex-direction: column;
                gap: 12px;
                z-index: 10001;
            }
            [data-ui=panel] button {
                padding: 8px 14px;
                background: #2a2a2a;
                border: 1px solid #666;
                color: #eee;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                width: 100%;
            }
            [data-ui=panel] button:hover {
                background: #444;
            }
            [data-ui=textarea] {
                background: #000;
                color: #eee;
                font-family: monospace;
                border-radius: 6px;
                width: 100%;
                height: 300px;
                padding: 8px;
                border: 2px solid #444;
                resize: vertical;
            }
            [data-ui=select] {
                width: 100%;
                margin: 8px 0;
                background: #111;
                color: #eee;
                border: 1px solid #444;
                padding: 6px;
            }
            .ui-close-btn {
                position: absolute;
                top: 8px;
                right: 10px;
                background: #b22222;
                color: white;
                border: none;
                font-size: 18px;
                padding: 4px 10px;
                border-radius: 4px;
                cursor: pointer;
                z-index: 10001;
            }
            .ui-close-btn:hover {
                background: #ff4444;
            }
        `;
        this.shadow.appendChild(style);
    }

    show({ title = '', html = '', buttons = [], textarea = null, select = null }) {
        const overlay = document.createElement('div');
        overlay.dataset.ui = 'overlay';

        const panel = document.createElement('div');
        panel.dataset.ui = 'panel';

        const close = document.createElement('button');
        close.className = 'ui-close-btn';
        close.textContent = '×';
        close.onclick = () => this.close();
        panel.appendChild(close);

        if (title) {
            const h2 = document.createElement('h2');
            h2.textContent = title;
            h2.style.margin = '0 0 10px';
            panel.appendChild(h2);
        }

        if (html) {
            const div = document.createElement('div');
            div.innerHTML = html;
            panel.appendChild(div);
        }

        if (textarea !== null) {
            const ta = document.createElement('textarea');
            ta.dataset.ui = 'textarea';
            ta.value = textarea.value || '';
            panel.appendChild(ta);
            this._textarea = ta;
        }

        if (select !== null && Array.isArray(select.options)) {
            const sel = document.createElement('select');
            sel.dataset.ui = 'select';
            sel.innerHTML = `<option value="">Select</option>` +
                select.options.map(o => `<option value="${o}">${o}</option>`).join('');
            panel.appendChild(sel);
            this._select = sel;
        }

        for (const btn of buttons) {
            const b = document.createElement('button');
            b.textContent = btn.label;
            b.onclick = () => {
                if (btn.onClick) btn.onClick({
                    textarea: this._textarea?.value || '',
                    select: this._select?.value || ''
                });
                if (!btn.noClose) this.close();
            };
            panel.appendChild(b);
        }

        overlay.appendChild(panel);
        this.wrap.innerHTML = '';
        this.wrap.appendChild(overlay);

        overlay.addEventListener('click', e => {
            if (e.target === overlay) this.close();
        });
    }

    close() {
        this.wrap.innerHTML = '';
    }
}
