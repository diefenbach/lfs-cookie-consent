import pytest
from django.template import Context, Template


@pytest.mark.django_db
def test_cookie_banner_tag_renders():
    tpl = Template("{% load lfs_cookie_consent_tags %}{% cookie_banner %}")
    html = tpl.render(Context())
    assert "lcc-cookie-banner" in html
    assert "lcc-cookie-btn" in html


@pytest.mark.django_db
def test_cookie_modal_tag_renders():
    tpl = Template("{% load lfs_cookie_consent_tags %}{% cookie_modal %}")
    html = tpl.render(Context())
    assert "lcc-cookie-modal" in html
    assert "lcc-modal-content" in html
