# -*- coding: utf-8 -*-
"""사주방·타로방 검증. 사용: python _test/fortune.py [BASE_URL] [--shots 폴더]
fake_supabase.py를 띄운 next 서버에 대해 실행한다."""
import io, os, re, sys
from pathlib import Path
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from playwright.sync_api import sync_playwright, expect

BASE = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:3000")
SHOTS = Path(sys.argv[sys.argv.index("--shots") + 1]) if "--shots" in sys.argv else None
if SHOTS:
    SHOTS.mkdir(parents=True, exist_ok=True)
fails, console = [], []


def check(name, fn):
    try:
        fn(); print("PASS", name)
    except Exception as e:  # noqa
        fails.append(name); print("FAIL", name, "-", str(e).replace("\n", " ")[:400])


def shot(page, name, full=False):
    if SHOTS:
        page.screenshot(path=str(SHOTS / f"{name}.png"), full_page=full)


def watch(page):
    page.on("pageerror", lambda e: console.append(f"{page.url} {e}"))
    page.on("console", lambda m: console.append(f"{page.url} {m.text}") if m.type == "error" else None)


DECK = "() => [...document.querySelectorAll('[data-tarot-card]')].map(e => e.dataset.tarotCard)"
# 카드의 실제 화면 사각형(회전 포함) 가운데에서 맨 위에 보이는 점을 찾는다
VISIBLE_POINT = """(id) => {
  const cards = [...document.querySelectorAll('[data-tarot-card]:not([data-slot])')];
  const el = cards.find(c => c.dataset.tarotCard === id);
  const r = el.getBoundingClientRect();
  const inside = (c, x, y, pad) => {
    const q = c.getBoundingClientRect();
    const m = new DOMMatrix(getComputedStyle(c).transform);
    const a = -Math.atan2(m.b, m.a), s = Math.hypot(m.a, m.b);
    const dx = x - (q.left + q.width / 2), dy = y - (q.top + q.height / 2);
    const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
    return Math.abs(lx) <= c.offsetWidth * s / 2 + pad && Math.abs(ly) <= c.offsetHeight * s / 2 + pad;
  };
  const z = c => Number(c.style.zIndex) || 0;
  const pts = [];
  for (let y = r.top; y < r.bottom; y += 3) for (let x = r.left; x < r.right; x += 3) {
    if (!inside(el, x, y, -2)) continue;
    if (!cards.some(c => c !== el && z(c) > z(el) && inside(c, x, y, 2))) pts.push([x, y]);
  }
  return pts.length ? pts[Math.floor(pts.length / 2)] : null;
}"""


def open_tarot(page):
    page.goto(BASE + "/fortune/tarot")
    page.locator("#table-title").scroll_into_view_if_needed()
    page.wait_for_timeout(600)


def spread_cards(page):
    page.get_by_role("button", name="카드 78장 섞기").click()
    page.get_by_role("button", name="펼치기", exact=True).click(timeout=14000)
    expect(page.locator(".fx-layer")).to_have_attribute("data-phase", "READY_FAN", timeout=5000)
    page.locator(".fx-layer").evaluate("e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 160)")
    page.mouse.move(2, 2)
    page.wait_for_timeout(500)


def click_card(page, card_id):
    page.mouse.move(2, 2)
    page.wait_for_timeout(260)
    pt = page.evaluate(VISIBLE_POINT, card_id)
    assert pt, f"{card_id} 보이는 곳이 없음"
    page.mouse.move(*pt)
    page.wait_for_timeout(230)
    assert page.locator(f"[data-tarot-card='{card_id}']").get_attribute("data-hover") == "true", f"{card_id} 호버 안 됨"
    page.mouse.click(*pt)
    expect(page.locator(".fx-layer")).to_have_attribute("data-phase", "READY_FAN", timeout=3000)
    assert page.locator(f"[data-tarot-card='{card_id}']").get_attribute("data-slot") is not None, f"{card_id} 선택 안 됨"


with sync_playwright() as p:
    b = p.chromium.launch(channel=os.environ.get("PW_CHANNEL"))
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page(); watch(page)

    def hub():
        page.goto(BASE + "/fortune")
        expect(page.get_by_role("heading", level=1)).to_be_visible()
        page.wait_for_load_state("networkidle")
        shot(page, "hub", True)
        page.get_by_role("button", name="오늘의 카드 뒤집기").click()
        expect(page.locator("#daily-title")).to_contain_text("오늘은")
        first = page.locator("#daily-title").inner_text()
        page.wait_for_timeout(900)
        page.locator("#daily-title").scroll_into_view_if_needed()
        shot(page, "hub-daily")
        page.reload()
        page.get_by_role("button", name="오늘의 카드 뒤집기").click()
        expect(page.locator("#daily-title")).to_have_text(first)
    check("허브: 오늘의 카드가 같은 기기에서 같다", hub)

    def nav():
        page.goto(BASE + "/fortune")
        link = page.get_by_role("navigation", name="주요 탐색").get_by_role("link", name="오늘의 운세")
        expect(link).to_have_attribute("aria-current", "page")
        for w in (768, 900, 1024):
            page.set_viewport_size({"width": w, "height": 800})
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), f"{w}px 가로 넘침"
        page.set_viewport_size({"width": 1440, "height": 900})
    check("상단 메뉴에 운세가 있고 768~1024px에서 넘치지 않는다", nav)

    def stack():
        open_tarot(page)
        ids = page.evaluate(DECK)
        assert len(ids) == 78 and len(set(ids)) == 78, len(ids)
        assert page.locator("[data-tarot-card] .fx-front").count() == 0, "고르기 전 앞면이 DOM에 있음"
        assert not any("/fortune/tarot/major" in s for s in page.eval_on_selector_all("img", "es => es.map(e => e.src)"))
        shot(page, "tarot-stack")
    check("타로: 카드 78장이 모두 DOM에 있고 앞면은 숨겨져 있다", stack)

    def shuffle_spread():
        open_tarot(page)
        before = page.evaluate(DECK)
        page.get_by_role("button", name="카드 78장 섞기").click()
        page.wait_for_timeout(2600)
        box = "es => { const m = es.map(e => new DOMMatrix(getComputedStyle(e).transform)); return [Math.max(...m.map(x => x.e)) - Math.min(...m.map(x => x.e)), Math.max(...m.map(x => x.f)) - Math.min(...m.map(x => x.f))] }"
        w, h = page.eval_on_selector_all("[data-tarot-card]", box)
        assert w > 600 and h > 300, f"섞는 궤도가 작음 {w}x{h}"
        shot(page, "tarot-shuffling")
        page.get_by_role("button", name="펼치기", exact=True).click(timeout=14000)
        page.wait_for_timeout(900)
        shot(page, "tarot-spreading")
        expect(page.locator(".fx-layer")).to_have_attribute("data-phase", "READY_FAN", timeout=5000)
        page.wait_for_timeout(600)
        assert page.evaluate(DECK) != before, "데이터 순서가 그대로"
        rots = page.eval_on_selector_all("[data-tarot-card]", "es => es.map(e => { const m = new DOMMatrix(getComputedStyle(e).transform); return Math.atan2(m.b, m.a) * 180 / Math.PI })")
        assert max(abs(r) for r in rots) <= 12.1, max(abs(r) for r in rots)
        ys = page.eval_on_selector_all("[data-tarot-card]", "es => es.map(e => Math.round(new DOMMatrix(getComputedStyle(e).transform).f))")
        mids = [ys[13], ys[39], ys[65]]
        assert mids[0] < mids[1] < mids[2], mids
        page.locator(".fx-layer").evaluate("e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 160)")
        page.wait_for_timeout(200)
        shot(page, "tarot-fan")
    check("타로: 섞으면 순서가 바뀌고 3층 얕은 아치로 펼쳐진다", shuffle_spread)

    def hover_lift():
        open_tarot(page); spread_cards(page)
        ids = page.evaluate(DECK)
        pos = "(id) => { const m = new DOMMatrix(getComputedStyle(document.querySelector(`[data-tarot-card='${id}']`)).transform); return [m.e, m.f] }"
        t, nb = ids[38], ids[39]
        a, n = page.evaluate(pos, t), page.evaluate(pos, nb)
        pt = page.evaluate(VISIBLE_POINT, t)
        page.mouse.move(*pt); page.wait_for_timeout(350)
        a2, n2 = page.evaluate(pos, t), page.evaluate(pos, nb)
        # 카드가 커지면서(1.12배) 원점은 그대로라 이동량만 본다
        assert 12 <= a[1] - a2[1] <= 24, f"상승 {a[1] - a2[1]}"
        assert 8 <= n2[0] - n[0] <= 16, f"옆 카드 {n2[0] - n[0]}"
        shot(page, "tarot-hover")
        page.mouse.move(2, 2); page.wait_for_timeout(350)
        assert abs(page.evaluate(pos, t)[1] - a[1]) < 1, "원위치 안 됨"
    check("타로: 호버하면 카드가 살짝(12~24px) 올라오고 옆 카드가 비켜난다", hover_lift)

    def ten_picks():
        picked = 0
        for group in ([0, 25, 26], [51, 52, 77], [13, 39, 65], [5, 47, 70]):
            open_tarot(page); spread_cards(page)
            ids = page.evaluate(DECK)
            for i in group:
                click_card(page, ids[i]); picked += 1
        assert picked == 12
    check("타로: 세 층의 끝·가운데 카드 12장을 실제 커서로 고를 수 있다", ten_picks)

    def full_reading():
        open_tarot(page)
        page.get_by_label("마음속 질문 (적지 않아도 돼요)").fill("새 업무를 어떻게 시작하면 좋을까?")
        page.get_by_role("button", name="일·진로").click()
        spread_cards(page)
        ids = page.evaluate(DECK)
        reveal = page.get_by_role("button", name="카드 열기")
        expect(reveal).to_be_disabled()
        for i in (10, 40, 66):
            click_card(page, ids[i])
        expect(reveal).to_be_enabled()
        expect(page.locator("[data-remaining]")).to_have_text("75")
        chosen = page.eval_on_selector_all("[data-slot]", "es => es.sort((a,b)=>a.dataset.slot-b.dataset.slot).map(e => e.dataset.tarotCard)")
        assert chosen == [ids[10], ids[40], ids[66]] and len(set(chosen)) == 3, chosen
        page.wait_for_timeout(500); shot(page, "tarot-picked")
        reveal.click()
        expect(page.locator("[data-tarot-result]")).to_be_visible(timeout=9000)
        shown = page.eval_on_selector_all("[data-result-card]", "es => es.map(e => e.dataset.resultCard)")
        assert shown == chosen, (shown, chosen)
        text = page.locator("[data-tarot-result]").inner_text()
        for w in ("과거", "현재", "미래", "결론부터 말하면", "그래서 이렇게 해 보세요", "지금 할 일", "카드의 뜻", "새 업무를"):
            assert w in text, w
        assert len(re.findall("정방향,|역방향,", text)) == 3
        page.wait_for_timeout(1900); shot(page, "tarot-result")
        page.get_by_role("button", name="다시 뽑기").click()
        assert page.locator("[data-slot]").count() == 0
        expect(page.get_by_role("button", name="카드 78장 섞기")).to_be_visible()
    check("타로: 3장 선택→공개→리딩이 이어지고 다시 뽑으면 초기화", full_reading)

    def keyboard():
        open_tarot(page); spread_cards(page)
        page.locator("[data-tarot-card][tabindex='0']").focus()
        page.keyboard.press("ArrowDown"); page.keyboard.press("ArrowRight")
        page.wait_for_timeout(300)
        f = page.evaluate("document.activeElement.dataset.tarotCard")
        expect(page.locator(f"[data-tarot-card='{f}']")).to_have_attribute("data-hover", "true")
        assert "번째 위치" in page.evaluate("document.activeElement.ariaLabel")
        page.keyboard.press("Enter")
        expect(page.locator(f"[data-tarot-card='{f}']")).to_have_attribute("data-slot", "0")
    check("타로: 방향키와 엔터로 고른다", keyboard)

    def keyboard_all():
        open_tarot(page); spread_cards(page)
        page.locator("[data-tarot-card][tabindex='0']").focus()
        for _ in range(3):
            page.keyboard.press("ArrowRight"); page.keyboard.press("Enter")
            page.wait_for_timeout(1000)
        assert page.locator("[data-slot]").count() == 3
        assert page.evaluate("document.activeElement.textContent") == "카드 열기"
        page.keyboard.press("Enter")
        expect(page.locator("#result-title")).to_be_focused(timeout=9000)
    check("타로: 키보드만으로 3장을 고르고 결과에 초점이 간다", keyboard_all)

    def header_on_top():
        open_tarot(page); spread_cards(page)
        page.locator(".fx-layer").evaluate("e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY + 120)")
        page.wait_for_timeout(300)
        assert page.evaluate("!!document.elementFromPoint(720, 40).closest('header')")
        shot(page, "tarot-header")
        expect(page.locator("#tarot-q")).to_be_disabled()
    check("타로: 카드가 고정 헤더를 덮지 않고, 섞은 뒤 질문이 잠긴다", header_on_top)

    def blocked():
        open_tarot(page)
        page.locator("#tarot-q").fill("이번에 무슨 주식 살까")
        page.get_by_role("button", name="카드 78장 섞기").click()
        expect(page.get_by_role("alert").filter(has_text="투자 종목")).to_be_visible()
        expect(page.locator(".fx-layer")).to_have_attribute("data-phase", "READY_STACK")
    check("타로: 답하지 않는 질문은 안내한다", blocked)

    def celtic():
        open_tarot(page)
        page.get_by_role("button", name="켈틱 크로스").click()
        spread_cards(page)
        ids = page.evaluate(DECK)
        for i in range(0, 60, 6):
            click_card(page, ids[i])
        shot(page, "tarot-celtic")
        page.get_by_role("button", name="카드 열기").click()
        expect(page.locator("[data-result-card]")).to_have_count(10, timeout=20000)
    check("타로: 켈틱 크로스 10장", celtic)

    def saju_sample():
        page.goto(BASE + "/fortune/saju"); page.wait_for_load_state("networkidle")
        expect(page.get_by_text("지금 보이는 내용은 예시")).to_be_visible()
        expect(page.locator(".fx-pillars")).to_contain_text("乙")
        page.wait_for_timeout(1500); shot(page, "saju-sample", True)
    check("사주: 입력 전에는 예시임을 밝힌다", saju_sample)

    sent = []
    page.on("request", lambda r: sent.append(r.url + " " + (r.post_data or "")))

    def saju_submit():
        page.goto(BASE + "/fortune/saju"); page.wait_for_load_state("networkidle")
        page.get_by_role("button", name="분석 시작").click()
        expect(page.get_by_role("alert").filter(has_text="연·월·일")).to_be_visible()
        page.locator("#by").fill("1991"); page.locator("#bm").fill("7"); page.locator("#bd").fill("17")
        page.locator("#bt").fill("09:40"); page.locator("#bg").select_option("F")
        sent.clear()
        page.get_by_role("button", name="분석 시작").click()
        expect(page.get_by_role("heading", name="나의 사주 원국")).to_be_visible()
        expect(page.get_by_role("heading", name="대운 흐름")).to_be_visible()
        expect(page.locator("[data-relationship]")).to_contain_text("어디에서 만날까")
        page.wait_for_timeout(1600); shot(page, "saju-result", True)
        for name in ("평생 운세", "연애·결혼", "재물운", "직장·승진", "학업·시험", "궁합", "신년운", "삼재", "이사·이동", "생활 리듬", "좋은 날", "가족운"):
            page.locator(".fx-tile", has_text=name).first.click()
            assert len(page.locator("[data-answer]").inner_text()) > 40, name
        page.locator("#saju-q").fill("내년에는 어떤 흐름일까?"); page.get_by_role("button", name="질문하기").click()
        expect(page.locator("[data-answer='newyear']")).to_be_visible()
        leak = [u for u in sent if re.search(r"1991|09(:|%3A)40", u)]
        assert not leak, leak
    check("사주: 결과·대운·인연·12질문이 나오고 생년월일이 전송되지 않는다", saju_submit)

    def saju_lunar():
        page.goto(BASE + "/fortune/saju"); page.wait_for_load_state("networkidle")
        page.get_by_role("button", name="음력").click()
        page.get_by_label("윤달").check()
        page.locator("#by").fill("1990"); page.locator("#bm").fill("1"); page.locator("#bd").fill("3")
        page.get_by_label("시각 모름").check()
        page.get_by_role("button", name="분석 시작").click()
        expect(page.get_by_role("alert").filter(has_text="윤달")).to_be_visible()
        page.get_by_label("윤달").uncheck()
        page.get_by_role("button", name="분석 시작").click()
        expect(page.get_by_text("여섯 글자로 읽었어요")).to_be_visible()
        expect(page.get_by_role("heading", name="앞으로 열두 달 흐름")).to_be_visible()
    check("사주: 음력·윤달·시각 모름", saju_lunar)

    def home():
        page.add_init_script("try{localStorage.setItem('bg_intro_seen_v1','1')}catch(e){}")
        page.goto(BASE + "/")
        expect(page.get_by_role("link", name="타로방")).to_have_attribute("href", "/fortune/tarot")
        expect(page.locator("header [data-hot]")).to_have_attribute("href", "/fortune")
        page.locator("#fortune-card-title").scroll_into_view_if_needed(); page.wait_for_timeout(500)
        shot(page, "home-card")
        page.goto(BASE + "/students")
        assert page.locator("a[href^='/fortune']").count() == 0, "학생 화면에 운세 링크"
    check("홈에 입구가 있고 학생 화면에는 없다", home)

    # 모바일
    mctx = b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
    mp = mctx.new_page(); watch(mp)

    def mobile_pages():
        for path in ("/fortune", "/fortune/saju", "/fortune/tarot"):
            mp.goto(BASE + path); mp.wait_for_load_state("networkidle"); mp.wait_for_timeout(900)
            w = mp.evaluate("document.documentElement.scrollWidth")
            assert w <= 390, f"{path} 가로 {w}px"
            shot(mp, "m" + path.replace("/", "-"), True)
    check("모바일 390px: 가로 넘침 없음", mobile_pages)

    def mobile_tarot():
        mp.goto(BASE + "/fortune/tarot"); mp.locator("#table-title").scroll_into_view_if_needed(); mp.wait_for_timeout(500)
        mp.get_by_role("button", name="카드 78장 섞기").tap()
        mp.get_by_role("button", name="펼치기", exact=True).tap(timeout=14000)
        expect(mp.locator(".fx-layer")).to_have_attribute("data-phase", "READY_FAN", timeout=5000)
        mp.locator(".fx-layer").evaluate("e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 90)")
        mp.wait_for_timeout(400)
        ids = mp.evaluate(DECK)
        for k, i in enumerate((4, 33, 70)):
            pt = mp.evaluate(VISIBLE_POINT, ids[i])
            mp.touchscreen.tap(*pt); mp.wait_for_timeout(300)
            c = mp.locator(f"[data-tarot-card='{ids[i]}']")
            expect(c).to_have_attribute("data-hover", "true")
            assert c.get_attribute("data-slot") is None, "첫 탭에 선택됨"
            if k == 0:
                shot(mp, "m-tarot-focus")
                mp.get_by_role("button", name="이 카드 고르기").tap()
            else:
                mp.touchscreen.tap(*pt)
            expect(c).to_have_attribute("data-slot", str(k), timeout=2000)
            mp.wait_for_timeout(900)
        shot(mp, "m-tarot-picked")
        mp.get_by_role("button", name="카드 열기").tap()
        expect(mp.locator("[data-result-card]")).to_have_count(3, timeout=10000)
        mp.wait_for_timeout(1900); shot(mp, "m-tarot-result")
    check("모바일 타로: 첫 탭은 확대, 두 번째 탭·버튼으로 선택", mobile_tarot)

    # 동작 줄이기
    rctx = b.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    rp = rctx.new_page(); watch(rp)

    def reduced():
        rp.goto(BASE + "/fortune/tarot"); rp.wait_for_timeout(400)
        expect(rp.get_by_label("동작 줄이기")).to_be_checked()
        rp.get_by_role("button", name="카드 78장 섞기").click()
        rp.get_by_role("button", name="펼치기", exact=True).click(timeout=700)
        expect(rp.locator(".fx-layer")).to_have_attribute("data-phase", "READY_FAN", timeout=700)
    check("동작 줄이기: 연출을 건너뛴다", reduced)

    check("콘솔 오류 없음", lambda: (_ for _ in ()).throw(AssertionError(console[:4])) if console else None)
    b.close()

print("FAILED" if fails else "ALL PASS", fails)
sys.exit(1 if fails else 0)
