from django import template
from django.conf import settings
from django.template.loader import render_to_string

register = template.Library()


@register.simple_tag
def gtm_script(gtm_id=None):
    gtm_id = gtm_id or getattr(settings, "GTM_ID", None)
    return render_to_string("lfs_cookie_consent/gtm_script.html", {"gtm_id": gtm_id})


@register.simple_tag
def gtm_noscript(gtm_id=None):
    gtm_id = gtm_id or getattr(settings, "GTM_ID", None)
    return render_to_string("lfs_cookie_consent/gtm_noscript.html", {"gtm_id": gtm_id})


@register.simple_tag
def cookie_banner(gtm_id=None):
    return render_to_string("lfs_cookie_consent/cookie_banner.html")


@register.simple_tag
def cookie_modal():
    return render_to_string("lfs_cookie_consent/cookie_modal.html")
