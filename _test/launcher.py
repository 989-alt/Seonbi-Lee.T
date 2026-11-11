# -*- coding: utf-8 -*-
"""런처 스모크 테스트. 사용: python _test/launcher.py [BASE_URL] [--stats-fail]
fake_supabase.py를 띄운 next 서버(또는 프리뷰 URL)에 대해 실행."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from playwright.sync_api import sync_playwright, expect

BASE = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:3000")
STATS_FAIL = "--stats-fail" in sys.argv
ISCREAM = "https://issamgpt.com/ai-mart?type=ALL"
fails = []

def check(name, fn):
    try:
        fn(); print("PASS", name)
    except Exception as e:  # noqa
        fails.append(name); print("FAIL", name, "-", str(e).splitlines()[0][:200])

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    ctx.add_init_script("try{localStorage.setItem('bg_intro_seen_v1','1')}catch(e){}")
    page = ctx.new_page()

    def home_loads():
        page.goto(BASE + "/")
        expect(page.get_by_role("heading", level=1)).to_have_text("숫자야구")
        expect(page.get_by_role("link", name="▶ PLAY")).to_have_attribute("href", "https://math-baseball.example.dev")
    check("home shows first featured app with PLAY", home_loads)

    def partner_hides_original():
        page.goto(BASE + "/")
        page.get_by_role("button", name="할머니의 사진첩").click()
        link = page.get_by_role("link", name="🍦 아이스크림 AI마트에서 이용하기")
        expect(link).to_have_attribute("href", ISCREAM)
        expect(page.get_by_text("아이스크림에 납품한 작품이에요")).to_be_visible()
        assert "▶ PLAY" not in page.inner_text("#bg-stage")
    check("partner app links only to i-scream", partner_hides_original)

    def unknown_slug():
        page.goto(BASE + "/?app=nope")
        expect(page.get_by_role("heading", level=1)).to_have_text("숫자야구")
    check("unknown ?app falls back to first featured", unknown_slug)

    def deep_link():
        page.goto(BASE + "/?app=circle")
        expect(page.get_by_role("heading", level=1)).to_have_text("원의 넓이 탐험대")
    check("?app selects a library app", deep_link)

    def search_none():
        page.goto(BASE + "/")
        page.get_by_label("앱 찾기").fill("zzzz")
        expect(page.get_by_text("찾는 앱이 없어요")).to_be_visible()
        page.get_by_label("앱 찾기").fill("수학")
        expect(page.get_by_role("button", name="원의 넓이 탐험대")).to_be_visible()
    check("search filters and shows empty message", search_none)

    def stats_shown():
        page.goto(BASE + "/")
        status = page.get_by_label("앱 라이브러리")
        if STATS_FAIL:
            expect(page.get_by_text("집계 준비 중").first).to_be_visible()
            expect(page.get_by_role("heading", name="많이 플레이한 앱")).to_have_count(0)
        else:
            expect(status.get_by_text("12명")).to_be_visible()
            expect(page.get_by_role("heading", name="많이 플레이한 앱")).to_be_visible()
    check("server status / top played reflect stats", stats_shown)

    def no_header_counter():
        page.goto(BASE + "/")
        assert "누적" not in page.inner_text("header")
    check("no visitor counter in header", no_header_counter)

    b.close()

print("RESULT", "FAIL " + ", ".join(fails) if fails else "ALL PASS")
sys.exit(1 if fails else 0)
