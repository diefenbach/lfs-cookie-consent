class DjangoCookieManager {
    #cookieName = 'cookie-consent';
    #consent = null;
    
    /**
     * Initialize the cookie manager: load consent, show banner or apply consent, and setup events.
     */
    init() {
        this.#loadConsent();
        if (!this.#consent) {
            this.#showBanner();
        } else {
            this.#applyConsent();
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
        
        // Toggle Switches
        document.querySelector('#lcc-analytics-toggle')?.addEventListener('click', (e) => this.#toggleSwitch(e.target));
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
        if (this.#consent) {
            this.#setToggle(analyticsToggle, this.#consent.analytics);
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
     * Accept all cookies (necessary, analytics), save and apply consent, hide banner.
     */
    #acceptAll() {
        this.#consent = {
            necessary: true,
            analytics: true,
            timestamp: Date.now()
        };
        this.#saveConsent();
        this.#applyConsent();
        this.#hideBanner();
    }
    
    /**
     * Decline all non-necessary cookies, save and apply consent, hide banner.
     */
    #declineAll() {
        this.#consent = {
            necessary: true,
            analytics: false,
            timestamp: Date.now()
        };
        this.#saveConsent();
        this.#applyConsent();
        this.#deleteGACookies();
        this.#hideBanner();
    }
    
    /**
     * Save the current settings from the modal, apply consent, hide banner and modal.
     */
    #saveSettings() {
        const analyticsToggle = document.querySelector('#lcc-analytics-toggle');
        const analyticsActive = analyticsToggle?.classList.contains('lcc-active') ?? false;
        
        this.#consent = {
            necessary: true,
            analytics: analyticsActive,
            timestamp: Date.now()
        };
        
        this.#saveConsent();
        this.#applyConsent();
        
        if (!analyticsActive) {
            this.#deleteGACookies();
        }
        
        this.#hideBanner();
        this.#hideModal();
    }
    
    /**
     * Apply the consent settings to Google Consent Mode and GTM dataLayer.
     */
    #applyConsent() {
        if (!this.#consent) return;
        
        // Google Consent Mode V2
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': this.#consent.analytics ? 'granted' : 'denied',
            });
        }
        
        // GTM Events
        window.dataLayer = window.dataLayer || [];
        const event = this.#consent.analytics ? 'analytics_consent_granted' : 'analytics_consent_denied';
        window.dataLayer.push({ event });
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
    
    /**
     * Delete all Google Analytics cookies.
     */
    #deleteGACookies() {
        const allCookies = document.cookie.split(';').map(c => c.trim().split('=')[0]);
        const prefixes = ['_ga', '_gid', '_gat', '_gat_gtag', '_gat_UA', '__utma', '__utmb', '__utmc', '__utmz', '__utmt'];
        const domain = window.location.hostname.replace(/^www\./, '');
        const paths = ['/', window.location.pathname];
        const domains = [undefined, domain, '.' + domain];
        
        const gaCookies = allCookies.filter(name => 
            prefixes.some(prefix => name.startsWith(prefix))
        );
        
        gaCookies.forEach(name => {
            paths.forEach(path => {
                domains.forEach(d => {
                    let cookieString = `${name}=; Max-Age=0; path=${path};`;
                    if (d) cookieString += ` domain=${d};`;
                    document.cookie = cookieString;
                });
            });
        });
    }    
}

// Create singleton instance
const cookieManager = new DjangoCookieManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => cookieManager.init());

// Global functions for external use
window.showCookieSettings = () => cookieManager.showModal();