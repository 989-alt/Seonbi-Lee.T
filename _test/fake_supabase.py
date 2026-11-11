# -*- coding: utf-8 -*-
"""테스트용 가짜 Supabase REST (projects 조회 + app_stats RPC + app_visits 기록).
사용: python _test/fake_supabase.py [port] [--stats-fail]"""
import json, sys
from http.server import BaseHTTPRequestHandler, HTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 54321
STATS_FAIL = "--stats-fail" in sys.argv
ISCREAM = "https://issamgpt.com/ai-mart?type=ALL"

def row(slug, title, cat, url=None, featured=False, order=None, partner=None, tag=None, grade=None):
    return {"id": slug, "slug": slug, "title_ko": title, "title_en": None, "description": f"{title} 설명",
            "category": cat, "accent": "primary", "version": None, "tech_stack": [], "thumbnail_path": None,
            "external_url": url, "status": "published", "published_at": None, "created_at": "2026-01-01",
            "updated_at": "2026-01-01", "featured": featured, "featured_order": order, "tag": tag, "grade": grade,
            "hero_image_path": None, "partner": partner, "partner_url": ISCREAM if partner else None,
            "track_slug": None if partner else slug}

ROWS = [
    row("math-baseball", "숫자야구", "edutech", "https://math-baseball.example.dev", True, 1, tag="게임 · 실시간 대결"),
    row("plane-puzzle", "한 판! 돌리고 뒤집기", "edutech", "https://plane.example.io/", True, 2, tag="게임 · 수학", grade="3~4학년"),
    row("grandma-album", "할머니의 사진첩", "edutech", None, True, 3, partner="i-scream", tag="게임 · 사회"),
    row("circle", "원의 넓이 탐험대", "edutech", "https://circle.example.io/", False, None, tag="게임 · 수학"),
    row("seat-changer", "자리바꾸기 프로그램", "class", "https://seat.example.app", True, 1),
    row("evaluationapp", "AI 평어·행발 생성 도구", "admin", "https://eval.example.io/", True, 1),
]
STATS = [{"slug": "portal", "today": 12, "total": 345}, {"slug": "math-baseball", "today": 3, "total": 40},
         {"slug": "plane-puzzle", "today": 1, "total": 9}]
VISITS = []
POSTS = [
    {"id": "p1", "slug": "claude-in-class", "title": "교실에서 Claude로 학습지 10분 만에 만들기", "excerpt": "수업 준비 시간을 줄이는 프롬프트 세 가지를 정리했어요.",
     "content_md": "## 들어가며\n본문", "accent": "primary", "tags": ["AI", "수업"], "hero_image_path": None, "status": "published",
     "published_at": "2026-11-01T00:00:00Z", "created_at": "2026-11-01", "updated_at": "2026-11-01"},
    {"id": "p2", "slug": "devlog-launcher", "title": "방구석게이머 런처를 만들며", "excerpt": "포트폴리오를 게임 런처로 바꾼 이야기.",
     "content_md": "본문", "accent": "secondary", "tags": ["작업일지"], "hero_image_path": None, "status": "published",
     "published_at": "2026-11-10T00:00:00Z", "created_at": "2026-11-10", "updated_at": "2026-11-10"},
]
COURSES = [{"id": "c1", "slug": "claude-basic", "title": "바로 쓰는 Claude 기초", "description": "처음 쓰는 선생님을 위한 15차시 연수",
            "accent": "primary", "sort_order": 1, "status": "published", "published_at": "2026-10-01", "created_at": "2026-10-01", "updated_at": "2026-10-01"}]

class H(BaseHTTPRequestHandler):
    def _send(self, code, body=None):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        if body is not None:
            self.wfile.write(json.dumps(body, ensure_ascii=False).encode())
    def do_GET(self):
        if self.path.startswith("/rest/v1/projects"):
            if "is.null" in self.path:  # trackables 조회
                return self._send(200, [{"track_slug": r["track_slug"], "external_url": r["external_url"]} for r in ROWS if not r["partner"]])
            return self._send(200, ROWS)
        if self.path.startswith("/rest/v1/posts"):
            return self._send(200, POSTS)
        if self.path.startswith("/rest/v1/courses"):
            return self._send(200, COURSES)
        if self.path.startswith("/rest/v1/resources"):
            return self._send(200, [])
        if self.path.startswith("/__visits"):
            return self._send(200, VISITS)
        self._send(404, {})
    def do_POST(self):
        n = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(n) if n else b""
        if self.path.startswith("/rest/v1/rpc/app_stats"):
            return self._send(500, {"message": "boom"}) if STATS_FAIL else self._send(200, STATS)
        if self.path.startswith("/rest/v1/app_visits"):
            VISITS.append(json.loads(body or b"{}"))
            return self._send(201, [])
        self._send(404, {})
    def log_message(self, *a):
        pass

HTTPServer(("127.0.0.1", PORT), H).serve_forever()
