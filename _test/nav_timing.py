# -*- coding: utf-8 -*-
"""Measure time-to-visible for page titles after client navigation."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from playwright.sync_api import sync_playwright

def measure_title_visible(page, url: str, selector: str) -> float:
    """Navigate and measure ms until the heading becomes fully opaque."""
    start = page.evaluate("performance.now()")
    page.goto(url, wait_until="domcontentloaded")
    # Wait for element to be opacity 1
    page.wait_for_function(
        """([sel]) => {
            const el = document.querySelector(sel);
            if (!el) return false;
            const style = getComputedStyle(el);
            return parseFloat(style.opacity) >= 0.99;
        }""",
        arg=[selector],
        timeout=5000,
    )
    end = page.evaluate("performance.now()")
    return round(end - start, 1)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()

    # Home first (warm up)
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(500)

    # Simulate client-side navigation via link clicks
    print("--- Client-side navigation timings ---")
    for label, sel in [
        ("projects", "main h1"),
        ("news", "main h1"),
        ("about", "main h1"),
    ]:
        page.click(f'nav[aria-label="주요 탐색"] >> text={"프로젝트" if label == "projects" else "AI 뉴스" if label == "news" else "소개"}')
        page.wait_for_function(
            """([sel]) => {
                const el = document.querySelector(sel);
                return el && parseFloat(getComputedStyle(el).opacity) >= 0.99;
            }""",
            arg=["main h1"],
            timeout=5000,
        )
        # Approximate timing via JS performance
        t = page.evaluate("""() => {
            const nav = performance.getEntriesByType('navigation')[0];
            return nav ? nav.domContentLoadedEventEnd : 0;
        }""")
        print(f"  {label:10s} h1 visible (opacity=1)")

    # Test "문의/요청 메일 보내기" link
    print("\n--- Mail link routing ---")
    page.goto("http://localhost:3000/about", wait_until="networkidle")
    page.wait_for_timeout(800)
    link = page.get_by_role("link", name="문의/요청 메일 보내기")
    href = link.get_attribute("href")
    print(f"  link href: {href}")
    link.click()
    page.wait_for_url("**/contact", timeout=5000)
    print(f"  navigated to: {page.url}")

    browser.close()
