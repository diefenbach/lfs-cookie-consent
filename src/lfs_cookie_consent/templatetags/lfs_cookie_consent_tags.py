from django import template
from django.template.loader import render_to_string

register = template.Library()


@register.simple_tag
def cookie_banner():
    return render_to_string("lfs_cookie_consent/cookie_banner.html")


@register.simple_tag
def cookie_modal():
    return render_to_string("lfs_cookie_consent/cookie_modal.html")
