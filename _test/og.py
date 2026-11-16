# -*- coding: utf-8 -*-
"""앱 링크 미리보기 확인. 사용: python _test/og.py [BASE_URL] [slug]"""
import sys, io, re, urllib.request
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from PIL import Image

args = [a for a in sys.argv[1:]]
BASE = next((a for a in args if a.startswith("http")), "http://localhost:3000")
SLUG = next((a for a in args if not a.startswith("http")), "math-baseball")
UA = {"User-Agent": "facebookexternalhit/1.1 kakaotalk-scrap/1.0"}
fails = []
def get(path):
    return urllib.request.urlopen(urllib.request.Request(BASE + path, headers=UA), timeout=60)
def og(html, prop):
    m = re.search(r'<meta property="%s" content="([^"]*)"' % re.escape(prop), html)
    return m.group(1) if m else None
def check(name, fn):
    try:
        fn(); print("PASS", name)
    except Exception as e:  # noqa
        fails.append(name); print("FAIL", name, "-", str(e)[:240])

def play_page():
    html = get(f"/play/{SLUG}?from=students").read().decode()
    img = og(html, "og:image"); print("   og:image", img, "| og:title", og(html, "og:title"))
    assert img and img.endswith(f"/og/app/{SLUG}"), img
check("/play/<slug> shares the app's own image", play_page)

def launcher_page():
    html = get(f"/?app={SLUG}").read().decode()
    img = og(html, "og:image"); assert img and img.endswith(f"/og/app/{SLUG}"), img
check("/?app=<slug> shares the app's own image", launcher_page)

def home_default():
    html = get("/").read().decode()
    assert og(html, "og:image").endswith("/og.jpg"), og(html, "og:image")
check("home without ?app keeps the site image", home_default)

def image_route():
    r = get(f"/og/app/{SLUG}")
    assert r.geturl().endswith(f"/og/app/{SLUG}"), f"fell back to {r.geturl()}"
    assert r.headers["Content-Type"] == "image/jpeg", r.headers["Content-Type"]
    data = r.read(); im = Image.open(io.BytesIO(data))
    assert im.size == (1200, 630), im.size
    open(f"/tmp/og-{SLUG}.jpg", "wb").write(data); print("   ", len(data), "bytes")
check("/og/app/<slug> returns a 1200x630 JPG", image_route)

def unknown_slug():
    r = get("/og/app/no-such-app")
    assert r.geturl().endswith("/og.jpg"), r.geturl()
check("unknown app falls back to the site image", unknown_slug)
print("RESULT", "FAIL " + ", ".join(fails) if fails else "ALL PASS")
sys.exit(1 if fails else 0)
