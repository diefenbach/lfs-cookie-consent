# LFS Cookie Consent

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/diefenbach/lfs-cookie-consent)
[![PyPI](https://img.shields.io/pypi/v/lfs-cookie-consent?label=PyPI)](https://pypi.org/project/lfs-cookie-consent/)
[![Python Versions](https://img.shields.io/badge/python-%3E%3D3.8-blue)](https://www.python.org/downloads/)
[![Django Versions](https://img.shields.io/badge/django-%3E%3D3.2-blue)](https://www.djangoproject.com/download/)
[![Test](https://github.com/diefenbach/git-fleet-manager/actions/workflows/test.yml/badge.svg)](https://github.com/diefenbach/lfs-cookie-consent/actions/workflows/test.yml)


A reusable Django app for GDPR-compliant cookie consent management, featuring integration with Google Tag Manager (GTM) and Google Consent Mode V2. Originally developed for [Lightning Fast Shop](https://github.com/diefenbach/django-lfs), it is designed for use in any Django project.

> **Note:** LFS Cookie Consent currently supports only Google Analytics cookies. Additional cookie types will be supported in upcoming releases.

## Features
- Cookie banner with options to accept, decline, or customize consent
- Granular control over necessary and analytics cookies
- Google Tag Manager (GTM) integration
- Google Consent Mode V2 support (currently only for `analytics_storage`)

## Installation
1. Add the app to your Django project:
   - Install `lfs_cookie_consent` by running: `pip install lfs-cookie-consent`.
   - Add `'lfs_cookie_consent'` to your `INSTALLED_APPS` in `settings.py`.

2. Configure your GTM ID in `settings.py`:
   ```python
   GTM_ID = "GTM-XXXXXXX"  # Replace with your GTM container ID
   ```

3. Collect static files:
   ```bash
   python manage.py collectstatic
   ```

## Usage
1. Include the template tags and the provided CSS and JavaScript in your base template:
   ```django
   {% load static %}
   {% load lfs_cookie_consent_tags %}
   <head>
       <link rel="stylesheet" href="{% static 'lfs_cookie_consent/lfs_cookie_consent.css' %}">
       <script src="{% static 'lfs_cookie_consent/lfs_cookie_consent.js' %}"></script>
       {% gtm_script %}
   </head>
   <body>
       {% gtm_noscript %}
       {% cookie_banner %}
       {% cookie_modal %}
   </body>
   ```

2. Add a link to open the modal anywhere:
   ```html
   <a href="#" onclick="window.showCookieSettings(); return false;">Open cookie settings</a>
   ```

## How it works
- On the first visit, a cookie banner is displayed.
- Users can accept all, decline all, or customize their preferences (currently only analytics cookies).
- Consent is stored in a cookie and applied via Google Consent Mode V2 (`analytics_storage`).
- GTM and Google Analytics tags will only fire if consent is granted.

## Google Tag Manager Setup
1. Create a GTM container and use the ID in your Django settings.
2. Add a Google Analytics 4 tag in GTM.
3. Add a `Page View` trigger to your tag
4. Don't forget to publish your changes
5. Consent Mode is automatically handled by this app (no extra GTM configuration needed).
6. Test with Tag Assistant or GTM Preview to ensure tags fire only after consent.

## Test View and Temporary URL Inclusion
This package includes a simple test view that lets you quickly try out the cookie banner and modal. The view renders a sample page with all relevant components.

**How to use the test view:**

1. Temporarily add the test view URL to your project:
   Open your main `urls.py` (e.g., in your main project or test project) and add:
   ```python
   from lfs_cookie_consent.views import test_cookie_banner
   from django.urls import path

   urlpatterns = [
       # ... your other URLs ...
       path("", test_cookie_banner, name="test_cookie_banner"),
   ]
   ```
   
2. Open your project's start page in the browser.
   You should see the cookie banner and modal as intended.

3. Open your browser's developer tools, go to the cookies section, and observe how cookies are set or deleted based on your consent choices.

4. Remove the temporary URL once you have finished testing the functionality.

## License
MIT License 
