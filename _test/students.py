# -*- coding: utf-8 -*-
"""학생 화면에서 교사용 화면으로 새는 길이 막혔는지 확인. 사용: python _test/students.py [BASE_URL]"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from playwright.sync_api import sync_playwright, expect

BASE = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:3000")
STUDENT_OK = ("/students", "/students/privacy", "/play/")
fails = []
def check(name, fn):
    try:
        fn(); print("PASS", name)
    except Exception as e:  # noqa
        fails.append(name); print("FAIL", name, "-", str(e).splitlines()[0][:240])

def internal_hrefs(page):
    hs = page.eval_on_selector_all("a[href]", "as => as.map(a => a.getAttribute('href'))")
    return [h for h in hs if h.startswith("/") and not h.startswith("/_next")]

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    ctx.add_init_script("try{localStorage.setItem('bg_intro_seen_v1','1')}catch(e){}")
    page = ctx.new_page()

    page.goto(BASE + "/students")
    play_href = page.locator('a[href^="/play/"]').first.get_attribute("href")
    slug = play_href.split("/play/")[1].split("?")[0]
    print("   using", slug)

    def students_links():
        bad = [h for h in internal_hrefs(page) if not h.startswith(STUDENT_OK)]
        assert not bad, bad
        expect(page.get_by_role("link", name="개인정보처리방침")).to_have_attribute("href", "/students/privacy")
    check("/students only links to student pages", students_links)

    def student_privacy():
        page.goto(BASE + "/students"); page.get_by_role("link", name="개인정보처리방침").click()
        page.wait_for_url("**/students/privacy")
        expect(page.get_by_role("heading", name="개인정보처리방침").first).to_be_visible()
        expect(page.get_by_role("link", name="← 교실 놀이터로 돌아가기")).to_have_attribute("href", "/students")
        bad = [h for h in internal_hrefs(page) if not h.startswith(STUDENT_OK)]
        assert not bad, f"leaks to {bad}"
        assert page.get_by_role("link", name="라이브러리").count() == 0, "site menu shown"
    check("student privacy page has no site menu and no teacher links", student_privacy)

    def play_with_param():
        page.goto(f"{BASE}/play/{slug}?from=students")
        expect(page.get_by_role("link", name="← 교실 놀이터")).to_have_attribute("href", "/students")
        expect(page.get_by_role("link", name="개인정보처리방침")).to_have_attribute("href", "/students/privacy")
    check("play ?from=students links back to student pages", play_with_param)

    def play_param_removed():
        page.goto(BASE + "/students")
        page.goto(f"{BASE}/play/{slug}")
        expect(page.get_by_role("link", name="← 교실 놀이터")).to_have_attribute("href", "/students")
        expect(page.get_by_role("link", name="개인정보처리방침")).to_have_attribute("href", "/students/privacy")
    check("student tab stays in student mode even without ?from=students", play_param_removed)

    def teacher_fresh_tab():
        c2 = b.new_context(); pg = c2.new_page()
        pg.goto(f"{BASE}/play/{slug}")
        pg.wait_for_timeout(500)
        expect(pg.get_by_role("link", name="← 교실 놀이터")).to_have_attribute("href", f"/?app={slug}")
        expect(pg.get_by_role("link", name="개인정보처리방침")).to_have_attribute("href", "/privacy")
        c2.close()
    check("teacher (no student visit) still goes back to launcher", teacher_fresh_tab)

    def launcher_clears():
        page.goto(BASE + "/students"); page.goto(BASE + "/"); page.wait_for_timeout(500)
        page.goto(f"{BASE}/play/{slug}"); page.wait_for_timeout(500)
        expect(page.get_by_role("link", name="← 교실 놀이터")).to_have_attribute("href", f"/?app={slug}")
    check("opening the teacher launcher turns student mode off", launcher_clears)

    def public_privacy_unchanged():
        page.goto(BASE + "/privacy")
        assert page.get_by_role("link", name="라이브러리").count() >= 1
    check("/privacy keeps the site menu", public_privacy_unchanged)
    b.close()
print("RESULT", "FAIL " + ", ".join(fails) if fails else "ALL PASS")
sys.exit(1 if fails else 0)
