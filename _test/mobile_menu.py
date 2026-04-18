# -*- coding: utf-8 -*-
"""Test mobile hamburger menu open/close."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent / "shots"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
    page = ctx.new_page()
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(2500)

    # Click hamburger
    page.get_by_label("메뉴 열기").click()
    page.wait_for_timeout(400)
    page.screenshot(path=str(OUT / "mobile-menu-open.png"), full_page=False)
    print("mobile menu opened; captured shots/mobile-menu-open.png")

    # Click a nav item
    page.get_by_role("link", name="프로젝트").first.click()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1500)
    page.screenshot(path=str(OUT / "mobile-after-nav.png"), full_page=False)
    print("navigated to projects; captured shots/mobile-after-nav.png")
    print(f"final URL: {page.url}")

    browser.close()
