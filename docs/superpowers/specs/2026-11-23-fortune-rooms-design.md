# 사주방·타로방 설계 (2026-11-23)

선생님이 쉬는 시간에 재미로 보고, 결과에서 교실 놀이터 콘텐츠로 이어지게 한다.
기준 문서는 사용자가 승인한 `fortune_design_handoff/README.md`(A+B, 화풍 C)와 PR 989-alt/Seonbi-Lee.T#27의 `saju-tarot-logic.md`다.

## 범위
- 포함: `/fortune`(허브·오늘의 카드), `/fortune/saju`, `/fortune/tarot`, 홈·상단 메뉴 입구, 이미지 96장(GPT 이미지 생성).
- 제외: Claude API 실시간 상담(P6), 문장 사전 생성(P5), 이용 통계. 질문은 낱말로 주제를 찾아 계산 결과로 답한다.

## 결정
| 항목 | 선택 | 이유 |
|---|---|---|
| 모션 | `motion`의 명령형 `animate` | 78장 개별 이동·호버를 중간에 끊고 이어야 한다 |
| 카드 판정 | DOM 호버 대신 포인터 좌표 계산(`hitCard`) | 떠오른 카드가 포인터 밑에서 빠져나가 깜빡이는 문제를 막는다 |
| 좁은 화면 | 13장×6층 | 26장×3층은 카드 폭이 12px만 보여 누를 수 없다. 78장이 한 화면인 원칙은 같다 |
| 음력 | `korean-lunar-calendar` | 한국 음력 기준(중국 라이브러리 금지) |
| 절기 | Meeus 저정밀식 | 오차 15분 안쪽. 경계 근처는 화면에 알린다 |
| 성별 | 선택 | 고르면 대운, 아니면 12개월 월운 |

## 개인정보
생년월일·질문은 브라우저 메모리에만 있다. `localStorage`에는 오늘의 카드용 무작위 ID(`bg_fortune_id`)만 둔다. 학생 화면에는 링크를 두지 않는다.

## 검증
- `npm test` (계산·배치·상태)
- `python _test/fortune.py <주소>` (fake_supabase + next 서버, 설치된 크롬은 `PW_CHANNEL=chrome`)
