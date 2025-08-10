// ==UserScript==
// @name        HelperLib
// @namespace   https://example.com/
// @version     1.0.0
// @description A collection of utility functions for userscripts.
// @match       *://*/*
// @grant       unsafeWindow
// @run-at      document-start
// ==/UserScript==
"use strict";
(() => {
    if (typeof unsafeWindow.HelperLib !== 'undefined') {
        return;
    }

    /**
     * @class HelperLib
     * @description Provides a collection of utility functions for userscripts.
     */
    class HelperLib {
        constructor() {
            this.t = typeof unsafeWindow !== 'undefined' ? unsafeWindow : typeof window !== 'undefined' ?
                window : {};
            this.jQuery = this.t.jQuery || null;
            if (!this.t.history || !this.t.history.pushState) {
                this.t.history = this.t.history || {};
                this.t.history._state = null;
                this.t.history.pushState = (t, e, o) => {
                    this.t.history._state = t;
                    this.t.location.href = o;
                };
                this.t.history.replaceState = (t, e, o) => {
                    this.t.history._state = t;
                    this.t.location.replace(o);
                };
                this.t.onpopstate = this.t.onpopstate || function() {};
            }
        }

        /**
         * Checks if the current page's hostname contains any of the provided strings.
         * @param {Array<string>} t - An array of strings to check against the hostname.
         * @returns {boolean} - True if a match is found, otherwise false.
         */
        hostnameContains(t) {
            return !(!this.t.location || !this.t.location.hostname) && t.some(t => this.t.location.hostname
                .includes(t));
        }

        /**
         * Adds a cookie with the specified properties.
         * @param {object} options - The cookie options.
         * @param {string} options.name - The name of the cookie.
         * @param {string} options.value - The value of the cookie.
         * @param {number} options.expirationDate - The expiration date in seconds (Unix timestamp).
         * @param {string} [options.path="/"] - The path for the cookie.
         * @param {string} [options.domain] - The domain for the cookie.
         * @param {boolean} [options.secure=false] - Whether the cookie should be secure.
         */
        addCookie({
            name,
            value,
            expirationDate,
            path = "/",
            domain,
            secure = false
        }) {
            if (!this.t.document || !this.t.document.cookie) return;
            const expires = new Date(expirationDate * 1000).toUTCString();
            const cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ` +
                `expires=${expires}; path=${path}; ` + `domain=${domain}${secure ? "; secure" : ""}`;
            this.t.document.cookie = cookie;
        }

        /**
         * Checks if a cookie with the specified name exists.
         * @param {string} name - The name of the cookie to check.
         * @returns {boolean} - True if the cookie exists, otherwise false.
         */
        cookieExists(name) {
            return this.t.document.cookie.split(";").some(c => c.trim().startsWith(encodeURIComponent(name) +
                "="));
        }

        /**
         * Gets the value of a cookie by its name.
         * @param {string} name - The name of the cookie.
         * @returns {string|null} - The cookie's value, or null if it doesn't exist.
         */
        getCookieValue(name) {
            if (!this.t.document || !this.t.document.cookie) return null;
            const cookies = this.t.document.cookie.split(';').map(c => c.trim());
            for (const c of cookies) {
                if (c.startsWith(encodeURIComponent(name) + '=')) {
                    return decodeURIComponent(c.substring(name.length + 1));
                }
            }
            return null;
        }

        /**
         * Generates a Unix timestamp for a future date.
         * @param {number} days - The number of days from now.
         * @returns {number} - The Unix timestamp in seconds.
         */
        generateTimestamp(days) {
            return Math.floor(Date.now() / 1000) + 24 * days * 60 * 60;
        }
        
        /**
         * Fetches CSS and adds it to a specified root element.
         * @param {string} url - The URL of the CSS file.
         * @param {Element} rootElement - The DOM element to append the style to.
         */
        async addCss(url, rootElement) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch CSS from ${url}: ${response.statusText}`);
                }
                const cssText = await response.text();
                const styleElement = document.createElement('style');
                styleElement.textContent = cssText;
                rootElement.appendChild(styleElement);
                console.log(`Successfully added CSS from ${url} to Shadow DOM.`);
            } catch (error) {
                console.error(`Error fetching or adding CSS from ${url}:`, error);
            }
        }
    
        /**
         * Executes a callback function when the DOM is fully loaded.
         * @param {Function} callback - The function to execute.
         */
        onReady(callback) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', callback);
            } else {
                callback();
            }
        }
        
        /**
         * Watches for URL changes and executes a callback function.
         * @param {Function} cb - The callback function to execute on URL change.
         */
        watchUrl(cb) {
            let last = location.href;
            new MutationObserver(() => {
                if (location.href !== last) {
                    last = location.href;
                    cb();
                }
            }).observe(document, { childList: true, subtree: true });
        }
        
        /**
         * Adds a keydown event listener for a specific key combination (Ctrl + key).
         * @param {string} key - The key to listen for (e.g., 'm').
         * @param {Function} cb - The callback function to execute when the key combo is pressed.
         */
        onKeydown(key, cb) {
            $(document).on('keydown', e => {
                if (e.ctrlKey && e.key === key) {
                    cb();
                }
            });
        }
    }

    unsafeWindow.HelperLib = HelperLib;
})();
