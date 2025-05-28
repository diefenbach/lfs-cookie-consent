import pytest
from django.test import Client


@pytest.mark.django_db
def test_base_template_renders_banner_and_modal():
    client = Client()
    response = client.get("/")
    assert response.status_code == 200
    assert "lcc-cookie-banner" in response.content.decode()
    assert "lcc-cookie-modal" in response.content.decode()
