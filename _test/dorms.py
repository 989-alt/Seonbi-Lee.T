# -*- coding: utf-8 -*-
"""도름스 서재 확인. 사용: python _test/dorms.py [BASE_URL]
피드를 직접 읽어 화면과 비교한다(읽기 전용)."""
import sys, io, json, urllib.request
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from playwright.sync_api import sync_playwright, expect

BASE = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:3000")
FEED = "https://dorms.school/api/library-site/ReZLNB1Rs5fxP1suyjBAxQ0ew_Q9kmE5"
feed = json.load(urllib.request.urlopen(FEED, timeout=30))
items = feed["apps"] + feed["posts"]
fails = []
def check(name, fn):
    try:
        fn(); print("PASS", name)
    except Exception as e:  # noqa
        fails.append(name); print("FAIL", name, "-", str(e).splitlines()[0][:240])

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 1280, "height": 900})
    ctx.add_init_script("try{localStorage.setItem('bg_intro_seen_v1','1')}catch(e){}")
    page = ctx.new_page()

    def meta_on_home():
        html = urllib.request.urlopen(urllib.request.Request(BASE + "/", headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read().decode()
        assert '<meta name="dorms-library" content="ReZLNB1Rs5fxP1suyjBAxQ0ew_Q9kmE5"' in html, "meta missing in server HTML"
    check("home <head> has dorms-library meta (server HTML)", meta_on_home)

    def profile_card(path="/dorms"):
        page.goto(BASE + path)
        card = page.locator("[data-dorms-profile] a").first
        expect(card).to_have_attribute("href", feed["profile"]["url"])
        expect(card).to_have_attribute("target", "_blank")
        expect(page.locator("[data-dorms-profile]")).to_contain_text(feed["profile"]["name"])
        img = page.locator("[data-dorms-profile] img").first
        want = feed["profile"]["avatar"] or "/launcher/char-pick.webp"
        assert img.get_attribute("src") == want, img.get_attribute("src")
    check("profile card shows and links to dorms profile", profile_card)

    def all_items(path="/dorms"):
        page.goto(BASE + path)
        cards = page.locator("[data-dorms-item]")
        expect(cards).to_have_count(len(items))
        for i, it in enumerate(items):
            c = cards.nth(i)
            expect(c).to_contain_text(it["title"])
            link = c.locator("a").first
            assert link.get_attribute("href") == it["url"], (it["title"], link.get_attribute("href"))
            if it.get("locked"):
                assert c.get_attribute("data-locked") is not None
            elif it.get("image"):
                assert c.locator(f'img[src="{it["image"]}"]').count() == 1, it["title"]
            else:
                assert c.locator("[data-default-image]").count() == 1, it["title"]
    check(f"all {len(items)} apps/posts shown with their dorms links and pictures", all_items)

    check("HOME: profile card shows and links to dorms profile", lambda: profile_card("/"))
    check(f"HOME: all {len(items)} apps/posts shown", lambda: all_items("/"))

    def home_server_html_has_feed():
        html = urllib.request.urlopen(urllib.request.Request(BASE + "/", headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read().decode()
        assert feed["profile"]["url"] in html, "profile url not in server HTML"
        for it in items:
            assert it["url"] in html, it["url"]
    check("HOME server HTML already contains profile and item links", home_server_html_has_feed)

    def click_goes_to_dorms():
        page.goto(BASE + "/dorms")
        with ctx.expect_page() as pop:
            page.locator("[data-dorms-item] a").first.click()
        newp = pop.value; newp.wait_for_load_state("domcontentloaded")
        assert newp.url.startswith(items[0]["url"].split("?")[0]) or "dorms.school" in newp.url, newp.url
        print("   opened:", newp.url); newp.close()
        with ctx.expect_page() as pop:
            page.locator("[data-dorms-profile] a").first.click()
        newp = pop.value; newp.wait_for_load_state("domcontentloaded")
        assert "dorms.school" in newp.url, newp.url
        print("   opened:", newp.url); newp.close()
    check("clicking an item and the profile opens dorms.school", click_goes_to_dorms)

    def no_raw_html():
        src = open("src/app/dorms/page.tsx", encoding="utf-8").read() if BASE.startswith("http://localhost") else ""
        assert "dangerouslySetInnerHTML" not in src and "innerHTML" not in src
    check("dorms page never injects HTML", no_raw_html)
    page.screenshot(path="/tmp/dorms.png", full_page=True)
    b.close()
print("RESULT", "FAIL " + ", ".join(fails) if fails else "ALL PASS")
sys.exit(1 if fails else 0)
