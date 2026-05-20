from django.template.loader import render_to_string


def test_base_template_renders_banner_and_modal():
    html = render_to_string("lfs_cookie_consent/base.html", {})
    assert "lcc-cookie-banner" in html
    assert "lcc-cookie-modal" in html
