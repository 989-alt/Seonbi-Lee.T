# -*- coding: utf-8 -*-
"""내부 페이지 스모크 테스트. 사용: python _test/pages.py [BASE_URL]"""
import sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from playwright.sync_api import sync_playwright, expect

BASE = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:3000")
fails = []
def check(name, fn):
    try:
        fn(); print("PASS", name)
    except Exception as e:  # noqa
        fails.append(name); print("FAIL", name, "-", str(e).splitlines()[0][:200])

NAV = ["라이브러리", "AI 소식", "배우기", "소개", "제보함"]
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 1280, "height": 900})
    ctx.add_init_script("try{localStorage.setItem('bg_intro_seen_v1','1')}catch(e){}")
    page = ctx.new_page()

    def same_menu_everywhere():
        for path in ["/", "/news", "/learn", "/about", "/contact"]:
            page.goto(BASE + path)
            for label in NAV:
                expect(page.get_by_role("link", name=label, exact=True).first).to_be_attached()
    check("same menu on every page", same_menu_everywhere)

    def heroes_have_character():
        for path, alt in [("/news", "신문과 태블릿"), ("/learn", "칠판 앞에서"), ("/contact", "우체통에"), ("/about", "윙크하는")]:
            page.goto(BASE + path)
            expect(page.locator(f'img[alt*="{alt}"]')).to_be_visible()
    check("each page hero shows its character", heroes_have_character)

    def about_lectures():
        page.goto(BASE + "/about")
        link = page.get_by_role("link", name="수업을 채우는 동료")
        expect(link).to_have_attribute("href", "https://t.vivasam.com/courses/job/t26-016")
        for t in ["Claude Code 중급반", "Claude A to Z", "찾아가는 학교컨설팅"]:
            expect(page.get_by_text(t).first).to_be_visible()
    check("about lists lectures with vivasam link", about_lectures)

    def contact_topic_prefix():
        sent = {}
        def handle(route):
            sent.update(json.loads(route.request.post_data)); route.fulfill(status=200, body='{"ok":true}', content_type="application/json")
        page.route("**/api/contact", handle)
        page.goto(BASE + "/contact")
        page.get_by_label("버그 제보").check()
        page.locator("#subject").fill("숫자야구가 안 열려요")
        page.locator("textarea[name=message]").fill("교실 TV에서 QR이 안 보여요. 확인 부탁드려요.")
        page.get_by_role("button", name="보내기").click()
        page.wait_for_timeout(800)
        assert sent.get("subject") == "[버그 제보] 숫자야구가 안 열려요", sent
    check("contact topic is prefixed to subject", contact_topic_prefix)

    def news_version_dates():
        page.goto(BASE + "/news")
        expect(page.get_by_text("v2026.11.10")).to_be_visible()
    check("news shows version-style dates", news_version_dates)
    b.close()
print("RESULT", "FAIL " + ", ".join(fails) if fails else "ALL PASS")
sys.exit(1 if fails else 0)
