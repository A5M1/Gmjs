// ==UserScript==
// @name         GMUI
// @namespace    abn
// @version      1.0
// @description  Utility
// @match        *://*
// @grant        unsafeWindow
// ==/UserScript==
(function() {
	unsafeWindow.GMUI = {
		addStyle: function(e, t) {
			t = t || document;
			const n = t.createElement("style");
			n.textContent = e, (t.head || t.documentElement)
				.appendChild(n)
		}
	};
	unsafeWindow.UIState = function() {
		let e, t;

		function n(o) {
			t && (o ? (document.head.contains(t) || document.head.appendChild(t), t.disabled = !1) : t
				.disabled = !0)
		}
		return {
			init: function(o) {
				e = o.key, t = document.createElement("style"), t.textContent = o.css, document
					.addEventListener("keydown", function(t) {
						t.altKey && t.key.toLowerCase() === o.hotkey && function() {
							const t = !("true" === localStorage.getItem(e));
							localStorage.setItem(e, String(t)), n(t)
						}()
					}), document.addEventListener("DOMContentLoaded", function() {
						n("true" === localStorage.getItem(e)), o.bodyClass && document.body
							.classList.add(o.bodyClass)
					})
			}
		}
	}();
})();
