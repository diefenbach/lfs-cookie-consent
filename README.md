# LFS Cookie Consent

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/diefenbach/lfs-cookie-consent)
[![PyPI](https://img.shields.io/pypi/v/lfs-cookie-consent?label=PyPI)](https://pypi.org/project/lfs-cookie-consent/)
[![Python Versions](https://img.shields.io/badge/python-%3E%3D3.8-blue)](https://www.python.org/downloads/)
[![Django Versions](https://img.shields.io/badge/django-%3E%3D3.2-blue)](https://www.djangoproject.com/download/)
[![Test](https://github.com/diefenbach/git-fleet-manager/actions/workflows/test.yml/badge.svg)](https://github.com/diefenbach/lfs-cookie-consent/actions/workflows/test.yml)


A reusable Django app for GDPR-oriented cookie **consent UI**: banner, detailed modal, and storing the user choice in a first-party cookie. Originally developed for [Lightning Fast Shop](https://github.com/diefenbach/django-lfs), it stays **agnostic of any tag manager** (no GTM/GA code in this package).

> **Note:** This app does not load third-party scripts. Wire your analytics (e.g. the companion **`lfs-gtm`** package or your own listener) to the browser event described below.

## Features

- Cookie banner (accept all, decline all, open settings)
- Settings modal with toggles for analytics and advertising (in addition to necessary cookies)
- Consent persisted in a cookie (`cookie-consent`)
- **`CustomEvent('lfs:consent-changed')`** so other scripts can react (e.g. Google Consent Mode via `lfs_gtm`)

## Installation

1. Install and add the app:

   ```bash
   pip install lfs-cookie-consent
   ```

   ```python
   INSTALLED_APPS = [
       # ...
       "lfs_cookie_consent",
   ]
   ```

2. Collect static files:

   ```bash
   python manage.py collectstatic
   ```

## Usage

In your base template:

```django
{% load static %}
{% load lfs_cookie_consent_tags %}
<head>
    <link rel="stylesheet" href="{% static 'lfs_cookie_consent/lfs_cookie_consent.css' %}">
</head>
<body>
    {% cookie_banner %}
    {% cookie_modal %}
    <script defer src="{% static 'lfs_cookie_consent/lfs_cookie_consent.js' %}"></script>
</body>
```

Link to reopen settings (footer, etc.):

```html
<a href="#" onclick="window.showCookieSettings(); return false;">Cookie settings</a>
```

## Browser event contract

Whenever consent is applied (including on first paint if a consent cookie already exists), the script dispatches:

```text
lfs:consent-changed
```

`event.detail` is a plain object:

| Field         | Type    | Description                    |
|---------------|---------|--------------------------------|
| `necessary`   | boolean | Always `true` in current UI    |
| `analytics`   | boolean | User choice for analytics      |
| `advertising` | boolean | User choice for advertising    |
| `timestamp`   | number  | Milliseconds (`Date.now()`)    |

Integrations (e.g. **lfs-gtm**) should listen on `document` and must be loaded **after** `lfs_cookie_consent.js` if they need to observe the event fired during `DOMContentLoaded` init.

## Migrating from 1.x

Version **2.0** removes GTM template tags and JavaScript from this package.

- Add **`lfs_gtm`** (or your own integration) if you use Google Tag Manager.
- Replace `{% gtm_script %}`, `{% gtm_noscript %}`, and `{% added_to_cart_script %}` with the equivalents from `lfs_gtm_tags`; see the **lfs-gtm** README for load order (`gtm_script` in `<head>`, then consent assets, then `lfs_gtm_consent.js` with `defer` after consent JS).

## Test view

This package includes a minimal test page (`lfs_cookie_consent.views.test_cookie_banner` → template `lfs_cookie_consent/base.html`). Wire it in your `urls.py` temporarily to try the banner locally, then remove the URL.

## License

MIT License
