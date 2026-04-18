# -*- coding: utf-8 -*-
"""Verify particle field responds to mouse over the hero center area."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent / "shots"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(2500)

    # Capture baseline — no hover
    page.screenshot(path=str(OUT / "particle-idle.png"), clip={"x": 400, "y": 80, "width": 640, "height": 420})

    # Move mouse to the center of hero area (over title)
    page.mouse.move(720, 200)
    page.wait_for_timeout(200)
    # Do a small circular sweep to force particles to displace
    for angle in range(0, 360, 20):
        import math
        x = 720 + int(120 * math.cos(math.radians(angle)))
        y = 200 + int(120 * math.sin(math.radians(angle)))
        page.mouse.move(x, y)
        page.wait_for_timeout(30)

    # Snap particles-disturbed state
    page.mouse.move(720, 200)
    page.wait_for_timeout(100)
    page.screenshot(path=str(OUT / "particle-hover-center.png"), clip={"x": 400, "y": 80, "width": 640, "height": 420})
    print("captured idle + hover screenshots; diff them visually")

    # Check that terminal header text is removed
    body_text = page.inner_text("main")
    has_terminal = "상태: 활성" in body_text
    print(f"'상태: 활성' still present? {has_terminal}")

    # Cross-check other pages
    for route, label in [("/projects", "projects"), ("/news", "news"), ("/about", "about")]:
        page.goto(f"http://localhost:3000{route}", wait_until="networkidle")
        page.wait_for_timeout(1500)
        txt = page.inner_text("main")
        print(f"  {label:10s} has '상태: 활성'? {('상태: 활성' in txt)}")

    browser.close()
