const DjangoCookieManager = {
    cookieName: 'cookie-consent',
    consent: null,
    csrfToken: '{{ csrf_token }}',
    
    /**
     * Initialize the cookie manager: load consent, show banner or apply consent, set blocker, and setup events.
     */
    init() {
        this.loadConsent();
        if (!this.consent) {
            this.showBanner();
        } else {
            this.applyConsent();
        }
        this.setupEvents();
    },
    
    /**
     * Set up all event listeners for banner and modal buttons and toggles.
     */
    setupEvents() {
        document.getElementById('lcc-accept-all')?.addEventListener('click', () => this.acceptAll());
        document.getElementById('lcc-decline-all')?.addEventListener('click', () => this.declineAll());
        document.getElementById('lcc-show-settings')?.addEventListener('click', () => this.showModal());
        document.getElementById('lcc-save-settings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('lcc-close-modal')?.addEventListener('click', () => this.hideModal());
        
        // Toggle Switches
        document.getElementById('lcc-analytics-toggle')?.addEventListener('click', (e) => this.toggleSwitch(e.target));
    },
    
    /**
     * Show the cookie banner.
     */
    showBanner() {
        document.getElementById('lcc-cookie-banner').classList.add('lcc-show');
        document.getElementById('cookie-overlay')?.classList.add('show');
        document.body.classList.add('blurred');
    },
    
    /**
     * Hide the cookie banner.
     */
    hideBanner() {
        document.getElementById('lcc-cookie-banner').classList.remove('lcc-show');
        document.getElementById('cookie-overlay')?.classList.remove('show');
        document.body.classList.remove('blurred');
    },
    
    /**
     * Show the cookie settings modal and update toggles based on current consent.
     */
    showModal() {
        const analyticsToggle = document.getElementById('lcc-analytics-toggle');
        if (this.consent) {
            this.setToggle(analyticsToggle, this.consent.analytics);
        }
        document.getElementById('lcc-cookie-modal').classList.add('lcc-show');
    },
    
    /**
     * Hide the cookie settings modal.
     */
    hideModal() {
        document.getElementById('lcc-cookie-modal').classList.remove('lcc-show');
    },
    
    /**
     * Toggle the active state of a switch (unless disabled).
     * @param {HTMLElement} toggle - The toggle element to switch.
     */
    toggleSwitch(toggle) {
        if (toggle.classList.contains('lcc-disabled')) return;
        toggle.classList.toggle('lcc-active');
    },
    
    /**
     * Set the toggle to active or inactive.
     * @param {HTMLElement} toggle - The toggle element.
     * @param {boolean} active - Whether the toggle should be active.
     */
    setToggle(toggle, active) {
        if (active) {
            toggle.classList.add('lcc-active');
        } else {
            toggle.classList.remove('lcc-active');
        }
    },
        
    /**
     * Accept all cookies (necessary, analytics), save and apply consent, hide banner and blocker.
     */
    acceptAll() {
        this.consent = {
            necessary: true,
            analytics: true,
            timestamp: Date.now()
        };
        this.saveConsent();
        this.applyConsent();
        this.hideBanner();
    },
    
    /**
     * Decline all non-necessary cookies, save and apply consent, hide banner and blocker.
     */
    declineAll() {
        this.consent = {
            necessary: true,
            analytics: false,
            timestamp: Date.now()
        };
        this.saveConsent();
        this.applyConsent();
        this.deleteGACookies();
        this.hideBanner();
    },
    
    /**
     * Save the current settings from the modal, apply consent, hide banner, modal, and blocker.
     */
    saveSettings() {
        const analyticsActive = document.getElementById('lcc-analytics-toggle').classList.contains('lcc-active');
        this.consent = {
            necessary: true,
            analytics: analyticsActive,
            timestamp: Date.now()
        };
        this.saveConsent();
        this.applyConsent();
        if (!analyticsActive) {
            this.deleteGACookies();
        }
        this.hideBanner();
        this.hideModal();
    },
    
    /**
     * Apply the consent settings to Google Consent Mode and GTM dataLayer.
     */
    applyConsent() {
        if (!this.consent) return;
        // Google Consent Mode V2
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': this.consent.analytics ? 'granted' : 'denied',
                'analytics_storage': this.consent.analytics ? 'granted' : 'denied',
                'functionality_storage': this.consent.necessary ? 'granted' : 'denied',
                'personalization_storage': this.consent.analytics ? 'granted' : 'denied',
                'security_storage': 'granted'  // Immer erlaubt für grundlegende Sicherheit
            });
        }
        // GTM Events
        window.dataLayer = window.dataLayer || [];
        if (this.consent.analytics) {
            window.dataLayer.push({'event': 'analytics_consent_granted'});
        } else {
            window.dataLayer.push({'event': 'analytics_consent_denied'});
        }
    },
    
    /**
     * Save the consent object as a cookie.
     */
    saveConsent() {
        try {
            const expires = new Date();
            expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
            document.cookie = `${this.cookieName}=${JSON.stringify(this.consent)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
        } catch (e) {
            console.error('Fehler beim Speichern des Consents:', e);
        }
    },
    
    /**
     * Load the consent object from the cookie, if present.
     */
    loadConsent() {
        try {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === this.cookieName && value) {
                    this.consent = JSON.parse(value);
                    return;
                }
            }
        } catch (e) {
            console.error('Fehler beim Laden des Consents:', e);
        }
    },
    
    deleteGACookies() {
        const allCookies = document.cookie.split(';').map(c => c.trim().split('=')[0]);
        const prefixes = ['_ga', '_gid', '_gat', '_gat_gtag', '_gat_UA', '__utma', '__utmb', '__utmc', '__utmz', '__utmt'];
        const domain = window.location.hostname.replace(/^www\./, '');
        const paths = ['/', window.location.pathname];
        const domains = [
            undefined,
            domain,
            '.' + domain
        ];
        const gaCookies = allCookies.filter(name => prefixes.some(prefix => name.startsWith(prefix)));
        gaCookies.forEach(name => {
            paths.forEach(path => {
                domains.forEach(d => {
                    let cookieString = name + '=; Max-Age=0; path=' + path + ';';
                    if (d) cookieString += ' domain=' + d + ';';
                    document.cookie = cookieString;
                });
            });
        });
    },
};

// Initialisierung
/**
 * Initialize the DjangoCookieManager when the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => DjangoCookieManager.init());

// Globale Funktionen
/**
 * Show the cookie settings modal (for external use).
 */
window.showCookieSettings = () => DjangoCookieManager.showModal();
/**
 * Reset the cookie consent and reload the page.
 */
window.resetCookies = () => {
    document.cookie = 'cookie-consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    location.reload();
};