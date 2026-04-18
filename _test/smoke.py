# -*- coding: utf-8 -*-
"""Smoke test: navigate every route, capture screenshots after shutter animation."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = Path(__file__).parent / "shots"
OUT.mkdir(exist_ok=True)

ROUTES = [
    ("home", "/"),
    ("projects", "/projects"),
    ("news", "/news"),
    ("about", "/about"),
    ("contact", "/contact"),
    ("admin-login", "/admin/login"),
    ("admin-root", "/admin"),
]

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # prefers-reduced-motion NOT set — we want to see animations
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        console_issues = []
        page.on("pageerror", lambda e: console_issues.append(f"PAGEERROR: {e}"))
        page.on("console", lambda m: console_issues.append(f"CONSOLE[{m.type}]: {m.text}") if m.type in ("error", "warning") else None)

        print("=" * 60)
        print("SMOKE TEST")
        print("=" * 60)

        for name, route in ROUTES:
            url = BASE + route
            try:
                response = page.goto(url, wait_until="networkidle", timeout=15000)
                status = response.status if response else "?"
                # Wait for shutter + stagger animations to finish
                page.wait_for_timeout(2500)
                print(f"\n[{name}] {url}")
                print(f"  status: {status}")
                print(f"  title : {page.title()}")
                print(f"  final : {page.url}")
                page.screenshot(path=str(OUT / f"{name}.png"), full_page=True)
                print(f"  shot  : shots/{name}.png")
            except Exception as e:
                print(f"\n[{name}] {url} — FAILED: {e}")

        # Also test mobile viewport on home
        mobile = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
        mp = mobile.new_page()
        mp.goto(BASE, wait_until="networkidle")
        mp.wait_for_timeout(2500)
        mp.screenshot(path=str(OUT / "home-mobile.png"), full_page=True)
        print("\n[home-mobile] captured")

        if console_issues:
            print("\n--- Console issues ---")
            for e in console_issues[:20]:
                print(f"  {e}")
        else:
            print("\n--- No console errors ---")

        browser.close()

if __name__ == "__main__":
    main()
