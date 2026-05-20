class DjangoCookieManager {
    #cookieName = 'cookie-consent';
    #consent = null;
    #toggleListenersAdded = false;

    /**
     * Initialize the cookie manager: load consent, show banner or publish consent, and setup events.
     */
    init() {
        this.#loadConsent();
        if (!this.#consent) {
            this.#showBanner();
        } else {
            this.#publishConsent();
        }
        this.#setupEvents();
    }

    /**
     * Set up all event listeners for banner and modal buttons and toggles.
     */
    #setupEvents() {
        document.querySelector('#lcc-accept-all')?.addEventListener('click', () => this.#acceptAll());
        document.querySelector('#lcc-decline-all')?.addEventListener('click', () => this.#declineAll());
        document.querySelector('#lcc-show-settings')?.addEventListener('click', () => this.showModal());
        document.querySelector('#lcc-save-settings')?.addEventListener('click', () => this.#saveSettings());
        document.querySelector('#lcc-close-modal')?.addEventListener('click', () => this.#hideModal());

        // Toggle switches will be set up when modal is shown
    }

    /**
     * Show the cookie banner.
     */
    #showBanner() {
        document.querySelector('#lcc-cookie-banner')?.classList.add('lcc-show');
    }

    /**
     * Hide the cookie banner.
     */
    #hideBanner() {
        document.querySelector('#lcc-cookie-banner')?.classList.remove('lcc-show');
    }

    /**
     * Show the cookie settings modal and update toggles based on current consent.
     */
    showModal() {
        const analyticsToggle = document.querySelector('#lcc-analytics-toggle');
        const advertisingToggle = document.querySelector('#lcc-advertising-toggle');

        if (this.#consent) {
            this.#setToggle(analyticsToggle, this.#consent.analytics);
            this.#setToggle(advertisingToggle, this.#consent.advertising);
        }

        // Set up toggle event listeners only once
        if (!this.#toggleListenersAdded) {
            // Use event delegation on the modal container
            const modal = document.querySelector('#lcc-cookie-modal');
            modal?.addEventListener('click', (e) => {
                if (e.target.id === 'lcc-analytics-toggle' || e.target.closest('#lcc-analytics-toggle')) {
                    const toggle = e.target.id === 'lcc-analytics-toggle' ? e.target : e.target.closest('#lcc-analytics-toggle');
                    this.#toggleSwitch(toggle);
                } else if (e.target.id === 'lcc-advertising-toggle' || e.target.closest('#lcc-advertising-toggle')) {
                    const toggle = e.target.id === 'lcc-advertising-toggle' ? e.target : e.target.closest('#lcc-advertising-toggle');
                    this.#toggleSwitch(toggle);
                }
            });

            this.#toggleListenersAdded = true;
        }

        document.querySelector('#lcc-cookie-modal')?.classList.add('lcc-show');
    }

    /**
     * Hide the cookie settings modal.
     */
    #hideModal() {
        document.querySelector('#lcc-cookie-modal')?.classList.remove('lcc-show');
    }

    /**
     * Toggle the active state of a switch (unless disabled).
     * @param {HTMLElement} toggle - The toggle element to switch.
     */
    #toggleSwitch(toggle) {
        if (toggle?.classList.contains('lcc-disabled')) return;
        toggle?.classList.toggle('lcc-active');
    }

    /**
     * Set the toggle to active or inactive.
     * @param {HTMLElement} toggle - The toggle element.
     * @param {boolean} active - Whether the toggle should be active.
     */
    #setToggle(toggle, active) {
        if (!toggle) return;

        if (active) {
            toggle.classList.add('lcc-active');
        } else {
            toggle.classList.remove('lcc-active');
        }
    }

    /**
     * Accept all cookies (necessary, analytics, advertising), save and notify listeners, hide banner.
     */
    #acceptAll() {
        this.#consent = {
            necessary: true,
            analytics: true,
            advertising: true,
            timestamp: Date.now()
        };
        this.#saveConsent();
        this.#publishConsent();
        this.#hideBanner();
    }

    /**
     * Decline all non-necessary cookies (analytics, advertising), save and notify listeners, hide banner.
     */
    #declineAll() {
        this.#consent = {
            necessary: true,
            analytics: false,
            advertising: false,
            timestamp: Date.now()
        };
        this.#saveConsent();
        this.#publishConsent();
        this.#hideBanner();
    }

    /**
     * Save the current settings from the modal, notify listeners, hide banner and modal.
     */
    #saveSettings() {
        const analyticsToggle = document.querySelector('#lcc-analytics-toggle');
        const advertisingToggle = document.querySelector('#lcc-advertising-toggle');
        const analyticsActive = analyticsToggle?.classList.contains('lcc-active') ?? false;
        const advertisingActive = advertisingToggle?.classList.contains('lcc-active') ?? false;

        this.#consent = {
            necessary: true,
            analytics: analyticsActive,
            advertising: advertisingActive,
            timestamp: Date.now()
        };

        this.#saveConsent();
        this.#publishConsent();

        this.#hideBanner();
        this.#hideModal();
    }

    /**
     * Notify integrations (e.g. lfs_gtm) via a DOM event. detail mirrors the stored consent object.
     */
    #publishConsent() {
        if (!this.#consent) return;
        document.dispatchEvent(new CustomEvent('lfs:consent-changed', {
            bubbles: true,
            detail: {
                necessary: this.#consent.necessary,
                analytics: this.#consent.analytics,
                advertising: this.#consent.advertising,
                timestamp: this.#consent.timestamp
            }
        }));
    }

    /**
     * Save the consent object as a cookie.
     */
    #saveConsent() {
        try {
            const expires = new Date();
            expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
            const cookieString = `${this.#cookieName}=${JSON.stringify(this.#consent)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            document.cookie = cookieString;
        } catch (error) {}
    }

    /**
     * Load the consent object from the cookie, if present.
     */
    #loadConsent() {
        try {
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === this.#cookieName && value) {
                    this.#consent = JSON.parse(value);
                    return;
                }
            }
        } catch (error) {}
    }
}

// Create singleton instance
const cookieManager = new DjangoCookieManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => cookieManager.init());

// Global functions for external use
window.showCookieSettings = () => cookieManager.showModal();
