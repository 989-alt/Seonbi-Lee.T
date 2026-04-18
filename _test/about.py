# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent / "shots"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    page.goto("http://localhost:3000/about", wait_until="networkidle")
    page.wait_for_timeout(2500)
    page.screenshot(path=str(OUT / "about-v2.png"), full_page=True)
    print("captured about-v2.png")

    # Scroll to bottom to trigger reveal on 경력/이력 section
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)
    page.screenshot(path=str(OUT / "about-v2-bottom.png"), full_page=True)
    print("captured about-v2-bottom.png")

    # Verify elements
    text = page.inner_text("main")
    print(f"'sunhak98@naver.com' present? {'sunhak98@naver.com' in text}")
    print(f"'(이선학)' present? {'(이선학)' in text}")
    print(f"'이천송정초등학교 이선학' present? {'이천송정초등학교 이선학' in text}")
    profile_exists = page.locator('img[alt="선비이선생 프로필"]').count()
    print(f"profile image count: {profile_exists}")

    browser.close()
