from django.shortcuts import render


def test_cookie_banner(request):
    return render(request, "lfs_cookie_consent/base.html")
