/* 방구석게이머 사용자 카운터 — <script src="https://s-edu.ai.kr/t.js" data-app="앱-slug" defer></script>
   브라우저마다 무작위 ID 하나만 저장하고, 하루에 한 번만 보냅니다. 개인정보는 보내지 않아요. */
(function () {
  try {
    var s = document.currentScript;
    var app = s && s.getAttribute("data-app");
    if (!app) return;
    var ls = window.localStorage;
    var vid = ls.getItem("bg_vid");
    if (!vid) {
      vid = crypto.randomUUID ? crypto.randomUUID() : null;
      if (!vid) return;
      ls.setItem("bg_vid", vid);
    }
    var day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
    var key = "bg_sent_" + app + "_" + day;
    if (ls.getItem(key)) return;
    var ok = navigator.sendBeacon && navigator.sendBeacon("https://s-edu.ai.kr/api/track", JSON.stringify({ app: app, vid: vid }));
    if (ok) ls.setItem(key, "1");
  } catch (e) { /* 저장소가 막혀 있으면 조용히 건너뜀 */ }
})();
