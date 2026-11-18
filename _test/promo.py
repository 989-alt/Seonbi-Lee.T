# -*- coding: utf-8 -*-
"""강의 홍보 띠·카드와 아이스크림 '준비 중' 확인. 사용: python _test/promo.py [BASE_URL]"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from playwright.sync_api import sync_playwright, expect

BASE = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:3000")
VIVASAM = "https://t.vivasam.com/courses/job/t26-016"
fails = []
def check(name, fn):
    try:
        fn(); print("PASS", name)
    except Exception as e:  # noqa
        fails.append(name); print("FAIL", name, "-", str(e).splitlines()[0][:240])

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    ctx.add_init_script("try{localStorage.setItem('bg_intro_seen_v1','1')}catch(e){}")
    page = ctx.new_page()

    def bar_shows_and_links():
        page.goto(BASE + "/")
        bar = page.locator("[data-lecture-promo]")
        expect(bar).to_be_visible()
        expect(bar).to_contain_text("15차시 · 1학점")
        btn = bar.get_by_role("link", name="강의 보러 가기 ▶")
        expect(btn).to_have_attribute("href", VIVASAM)
        expect(btn).to_have_attribute("target", "_blank")
        assert "vivasam" not in bar.inner_text(), "url must not be shown as text"
    check("home top bar promotes the lecture with a button", bar_shows_and_links)

    def bar_click_opens_vivasam():
        page.goto(BASE + "/")
        with ctx.expect_page() as pop:
            page.locator("[data-lecture-promo]").get_by_role("link", name="강의 보러 가기 ▶").click()
        newp = pop.value
        assert newp.url.startswith("https://t.vivasam.com/") , newp.url
        print("   opened:", newp.url); newp.close()
    check("button opens the vivasam course page in a new tab", bar_click_opens_vivasam)

    def bar_dismiss_sticks():
        page.goto(BASE + "/")
        page.get_by_role("button", name="강의 소식 닫기").click()
        expect(page.locator("[data-lecture-promo]")).to_have_count(0)
        page.reload(); page.wait_for_timeout(500)
        expect(page.locator("[data-lecture-promo]")).to_have_count(0)
    check("closing the bar keeps it closed after reload", bar_dismiss_sticks)

    def not_for_students():
        c2 = b.new_context(); pg = c2.new_page()
        for path in ["/students", "/students/privacy"]:
            pg.goto(BASE + path)
            assert pg.locator("[data-lecture-promo], [data-lecture-card]").count() == 0, path
            assert pg.locator("a[href*='vivasam']").count() == 0, path
        c2.close()
    check("student pages show no lecture promo", not_for_students)

    def learn_card():
        page.goto(BASE + "/learn")
        card = page.locator("[data-lecture-card]")
        expect(card).to_be_visible()
        expect(card.get_by_role("link", name="▶ 연수 신청하러 가기")).to_have_attribute("href", VIVASAM)
        expect(card.locator("ol > li")).to_have_count(15)
        expect(card).to_contain_text("15차시")
        expect(card).to_contain_text("1학점")
    check("learn page shows the lecture card with 15 stages", learn_card)

    def students_preparing():
        page.goto(BASE + "/students")
        prep = page.locator("[data-preparing]")
        assert prep.count() >= 1
        expect(prep.first).to_contain_text("업로드 준비 중")
        assert prep.first.locator("a").count() == 0
        ready = page.get_by_role("link", name="퀴즈 서바이벌")
        expect(ready).to_have_attribute("href", "https://issamgpt.com/ai-mart?type=ALL")
    check("student page: preparing games are not links, ready game still links", students_preparing)

    page.goto(BASE + "/learn"); page.screenshot(path="/tmp/learn.png", full_page=True)
    c3 = b.new_context(viewport={"width": 1280, "height": 900}); c3.add_init_script("try{localStorage.setItem('bg_intro_seen_v1','1')}catch(e){}")
    p3 = c3.new_page(); p3.goto(BASE + "/?app=grandma-album"); p3.wait_for_timeout(800); p3.screenshot(path="/tmp/home.png")
    p3.set_viewport_size({"width": 390, "height": 844}); p3.wait_for_timeout(300); p3.screenshot(path="/tmp/home-m.png")
    b.close()
print("RESULT", "FAIL " + ", ".join(fails) if fails else "ALL PASS")
sys.exit(1 if fails else 0)
