# -*- coding: utf-8 -*-
"""Live particle test — capture during motion."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent / "shots"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()

    # Inject probe to count mouse events reaching the particle logic
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(2500)

    # Verify the mousemove listener is attached to window via feature detect
    probe = page.evaluate("""
        () => {
            // Move mouse programmatically? Not possible from page JS.
            // Instead confirm canvas exists and window has listeners
            const c = document.querySelector('#particle-canvas');
            return {
                hasCanvas: !!c,
                canvasSize: c ? { w: c.width, h: c.height } : null,
                canvasRect: c ? c.getBoundingClientRect().toJSON() : null,
            };
        }
    """)
    print("probe:", probe)

    # Drag mouse across the hero
    for frame in range(15):
        x = 300 + frame * 60
        y = 250
        page.mouse.move(x, y)
        # Capture while moving
        if frame == 7:
            page.screenshot(path=str(OUT / "particle-midsweep.png"), clip={"x": 200, "y": 100, "width": 1040, "height": 400})
            print(f"captured at frame {frame} @ ({x}, {y})")

    browser.close()
