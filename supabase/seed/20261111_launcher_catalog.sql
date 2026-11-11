-- 방구석게이머 런처 카탈로그 시드 (slug 기준 upsert). 납품작은 external_url을 비우고 아이스크림으로만 연결.
insert into public.projects (slug, title_ko, description, category, accent, tech_stack, tag, grade, external_url, featured, featured_order, partner, partner_url, track_slug, status, published_at) values
  ('math-baseball', '숫자야구', '방 코드만으로 참여하는 실시간 숫자야구. 교실 TV에 QR을 띄우면 최대 60명이 함께 겨뤄요.', 'edutech', 'primary', '{}', '게임 · 실시간 대결', '전 학년', 'https://math-baseball.sunhak989.workers.dev', true, 1, null, null, 'math-baseball', 'published', now()),
  ('plane-puzzle', '한 판! 돌리고 뒤집기', '조각을 밀고 뒤집고 돌려 판을 채우는 도형 퍼즐. 그림 힌트부터 최소 이동 도전까지 단계별로 올라가요.', 'edutech', 'primary', '{}', '게임 · 수학', '3~4학년', 'https://989-alt.github.io/plane-puzzle/', true, 2, null, null, 'plane-puzzle', 'published', now()),
  ('grandma-album', '할머니의 사진첩', '할머니가 손주에게 들려주는 이야기로 식민 통치와 저항, 전쟁의 시대를 되짚는 스토리텔링 게임.', 'edutech', 'primary', '{}', '게임 · 사회', '5~6학년', null, true, 3, 'i-scream', 'https://issamgpt.com/ai-mart?type=ALL', null, 'published', now()),
  ('traveling-world-game', '돌아라! 지구 한 바퀴', '세계의 자연환경을 30칸 세계 여행 보드게임으로 배우는 교실용 4인 온라인 게임.', 'edutech', 'primary', '{}', '게임 · 사회', '6학년', null, true, 4, 'i-scream', 'https://issamgpt.com/ai-mart?type=ALL', null, 'published', now()),
  ('sokdam-chain', '이어라! 언어 표현 한 바퀴', '그림과 말로 언어 표현을 이어 가는 교실 그림 전달 게임.', 'edutech', 'primary', '{}', '게임 · 국어', '초등', null, true, 6, 'i-scream', 'https://issamgpt.com/ai-mart?type=ALL', null, 'published', now()),
  ('space-puzzle', '큐브 왕국 건축가', '조각을 쌓아 단서와 같은 모양을 만드는 3D 쌓기나무 퍼즐.', 'edutech', 'primary', '{}', '게임 · 수학', '6학년', null, true, 8, 'i-scream', 'https://issamgpt.com/ai-mart?type=ALL', null, 'published', now()),
  ('quiz-survivor', '퀴즈 서바이벌', '반 전체가 함께 살아남는 교실 퀴즈 서바이벌 게임.', 'edutech', 'primary', '{}', '게임 · 퀴즈', '초등', null, false, null, 'i-scream', 'https://issamgpt.com/ai-mart?type=ALL', null, 'published', now()),
  ('kiwora', '키워라! 식물 한살이', '식물을 직접 키우며 한살이를 관찰하는 과학 게임.', 'edutech', 'primary', '{}', '게임 · 과학', '초등', null, false, null, 'i-scream', 'https://issamgpt.com/ai-mart?type=ALL', null, 'published', now()),
  ('circle', '원의 넓이 탐험대', '원을 굴려 원주를 재고, 잘라서 직사각형으로 바꿔 보며 원의 넓이를 눈으로 이해해요.', 'edutech', 'primary', '{}', '게임 · 수학', '6학년', 'https://989-alt.github.io/circle/', true, 5, null, null, 'circle', 'published', now()),
  ('cosmic-edu', '천체 시뮬레이터 COSMIC-EDU', '우주를 직접 조작하며 밤하늘 관찰부터 지구의 운동과 계절 변화까지 탐구해요.', 'edutech', 'primary', '{}', '시뮬레이션 · 과학', '4~6학년', 'https://cosmic-edu.vercel.app', true, 7, null, null, 'cosmic-edu', 'published', now()),
  ('world-flags-drawing', '국기 따라 그리기', '77개 나라 국기를 크게 보고 종이에 따라 그리며 나라 정보도 함께 배워요.', 'edutech', 'primary', '{}', '수업 도구 · 사회', '초등', 'https://world-flags-drawing-seonbis-projects.vercel.app', false, null, null, null, 'world-flags-drawing', 'published', now()),
  ('quiz', '퀴즈 생성기', 'PDF·PPT·HWPX·이미지·영상에서 객관식·주관식·서술형 퀴즈를 자동으로 만들어요.', 'edutech', 'primary', '{}', '수업 도구', '전 학년', 'https://989-alt.github.io/quiz/', false, null, null, null, 'quiz', 'published', now()),
  ('art-class-workspace', 'AI 미술 도안 워크스페이스', '주제·작풍·난이도를 고르면 미술 수업용 도안을 만들고 SVG·PDF로 내보내요.', 'edutech', 'primary', '{}', '수업 도구 · 미술', '전 학년', 'https://art-class-workspace.vercel.app', false, null, null, null, 'art-class-workspace', 'published', now()),
  ('movie-worksheet', 'CineEdu 영화 학습지', '영화 제목과 대상 연령만 넣으면 캐릭터 분석, 토론 질문, 활동지를 만들어요.', 'edutech', 'primary', '{}', '수업 도구', '대상 연령 선택', 'https://movie-worksheet.vercel.app/', false, null, null, null, 'movie-worksheet', 'published', now()),
  ('democracy-journey', '민주주의의 여정', '한 사람의 일생으로 민주화와 산업화를 따라가는 6학년 사회 스토리텔링 게임.', 'edutech', 'primary', '{}', '게임 · 사회', '6학년', null, false, null, null, null, 'democracy-journey', 'draft', null),
  ('korean-history-map', '한국사 역사 지도', '고조선부터 대한제국까지 18개 장면의 영토 지도와 사건을 한 화면에서 봐요.', 'edutech', 'primary', '{}', '수업 도구 · 사회', '5~6학년', null, false, null, null, null, 'korean-history-map', 'draft', null),
  ('woorimal-rpg', '말빛 한울', '고유어 50개를 이야기 속에서 모으고 퀴즈 전투로 익히는 웹 RPG.', 'edutech', 'primary', '{}', '게임 · 국어', '6학년', null, false, null, null, null, 'woorimal-rpg', 'draft', null),
  ('seat-changer', '자리바꾸기 프로그램', '명단을 한 번 등록하면 시험·짝·U자·모둠 배치를 바로 만들고 미리 볼 수 있어요.', 'class', 'primary', '{}', '학급운영', '전 학년', 'https://seat-changer-two.vercel.app', true, 1, null, null, 'seat-changer', 'published', now()),
  ('class-picker', '발표자 뽑기', '학생 명단에서 아직 안 뽑힌 학생 중 발표자를 무작위로 뽑아요.', 'class', 'primary', '{}', '학급운영', '전 학년', null, true, 2, null, null, 'class-picker', 'draft', null),
  ('classroom-board', '학급 활동 기록판', '학급 코드와 번호로 들어와 활동을 기록하는 우리 반 활동판.', 'class', 'primary', '{}', '학급운영', '전 학년', 'https://classroom-board-nine.vercel.app', true, 3, null, null, 'classroom-board', 'published', now()),
  ('evaluationapp', 'AI 평어·행발 생성 도구', '성취기준을 넣으면 단계별 평어를 만들어요. 행발·창체·과목별 평어까지 지원해요.', 'admin', 'primary', '{}', '학교행정 · 평어', '교사용', 'https://989-alt.github.io/evaluationapp/', true, 1, null, null, 'evaluationapp', 'published', now()),
  ('time-table', '전담 시간표 편성 도구', '특별실 정원·전담교사·학년별 과목을 넣으면 충돌 없이 시간표를 짜고 Excel로 내보내요.', 'admin', 'primary', '{}', '학교행정', '교사용', 'https://time-table-fawn.vercel.app/', true, 2, null, null, 'time-table', 'published', now())
on conflict (slug) do update set
  title_ko = excluded.title_ko, description = excluded.description, category = excluded.category,
  tag = excluded.tag, grade = excluded.grade, external_url = excluded.external_url,
  featured = excluded.featured, featured_order = excluded.featured_order,
  partner = excluded.partner, partner_url = excluded.partner_url, track_slug = excluded.track_slug,
  status = excluded.status,
  published_at = coalesce(public.projects.published_at, excluded.published_at);

-- 카탈로그에 없는 기존 공개 프로젝트는 숨김(archived) — 삭제하지 않음
update public.projects set status = 'archived'
where status = 'published' and slug not in ('math-baseball', 'plane-puzzle', 'grandma-album', 'traveling-world-game', 'sokdam-chain', 'space-puzzle', 'quiz-survivor', 'kiwora', 'circle', 'cosmic-edu', 'world-flags-drawing', 'quiz', 'art-class-workspace', 'movie-worksheet', 'democracy-journey', 'korean-history-map', 'woorimal-rpg', 'seat-changer', 'class-picker', 'classroom-board', 'evaluationapp', 'time-table');

-- 픽셀아트 썸네일(사이트 정적 파일) 연결
update public.projects p set
  thumbnail_path = '/launcher/apps/' || p.slug || '.webp',
  hero_image_path = '/launcher/apps/' || p.slug || '-lg.webp'
where p.slug in ('plane-puzzle','math-baseball','circle','cosmic-edu','quiz','art-class-workspace','movie-worksheet','seat-changer','evaluationapp','time-table');
