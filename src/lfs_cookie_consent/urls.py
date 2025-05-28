from django.urls import path
from .views import test_cookie_banner

urlpatterns = [
    path("", test_cookie_banner, name="test_cookie_banner"),
]
