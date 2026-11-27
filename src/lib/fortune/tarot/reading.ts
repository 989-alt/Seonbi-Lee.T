import { cardById, type TarotCard, type TarotGroup } from "@/data/fortune/tarot-cards";
import topicJson from "@/data/fortune/tarot-topics.json";

type Side = { meaning: string; action: string };
/** 카드 × 주제 × 방향별 해석(scripts/fortune/pregenerate.ts로 만든 것). 없는 카드는 기본 뜻을 쓴다 */
const TOPIC_TEXT = topicJson as Record<string, Record<string, { up: Side; rev: Side }> | undefined>;

export const TOPICS = [
  { id: "today", label: "오늘", hint: "오늘 하루의 힌트" },
  { id: "love", label: "연애", hint: "좋아하는 마음과 인연" },
  { id: "money", label: "금전", hint: "돈의 흐름과 씀씀이" },
  { id: "work", label: "일·진로", hint: "직장, 이직, 새 도전" },
  { id: "study", label: "학업", hint: "시험, 자격증, 배움" },
  { id: "people", label: "관계", hint: "동료, 가족, 친구" },
  { id: "choice", label: "선택", hint: "할까 말까, 이쪽저쪽" },
] as const;
export type TopicId = (typeof TOPICS)[number]["id"];

export const SPREADS = [
  { id: "three", name: "과거·현재·미래", positions: ["과거", "현재", "미래"], desc: "흐름을 읽는 기본 3장" },
  { id: "one", name: "원카드", positions: ["핵심"], desc: "질문 하나에 카드 한 장" },
  { id: "choice", name: "A냐 B냐", positions: ["A를 고르면", "B를 고르면", "조언"], desc: "두 갈래를 나란히" },
  { id: "celtic", name: "켈틱 크로스", positions: ["현재", "걸림돌", "뿌리", "지난 일", "목표", "가까운 미래", "나", "주변", "희망과 걱정", "결과"], desc: "10장으로 깊이 보기" },
] as const;
export type SpreadId = (typeof SPREADS)[number]["id"];
export const spreadById = (id: SpreadId) => SPREADS.find((s) => s.id === id)!;

/** 자리가 뜻하는 것 */
const FRAMES: Record<string, string> = {
  과거: "지금 상황이 어디서 왔는지 보여 주는 자리예요.",
  현재: "지금 내 상태를 보여 주는 자리예요.",
  미래: "이대로 가면 닿게 될 모습이에요. 정해진 결과가 아니라 지금 흐름의 방향이에요.",
  핵심: "질문에 대한 가장 직접적인 답이에요.",
  "A를 고르면": "A를 골랐을 때 벌어질 일이에요.",
  "B를 고르면": "B를 골랐을 때 벌어질 일이에요.",
  조언: "어느 쪽을 고르든 챙겨야 할 태도예요.",
  걸림돌: "일을 가로막는 점이에요. 좋은 뜻의 카드라도 이 자리에서는 지나치거나 모자라 문제가 된다는 뜻이에요.",
  뿌리: "이 일이 생긴 진짜 이유예요.",
  "지난 일": "최근에 지나온 일이에요.",
  목표: "내가 바라는 모습이에요.",
  "가까운 미래": "몇 주 안에 다가올 일이에요.",
  나: "이 일을 대하는 내 태도예요.",
  주변: "주변 사람과 환경이 주는 영향이에요.",
  "희망과 걱정": "내가 기대하면서도 걱정하는 것이에요.",
  결과: "지금 흐름대로 가면 닿는 곳이에요. 행동을 바꾸면 달라져요.",
};

/** 주제별 풀이: [조심, 지켜보기, 순조로움] */
const TOPIC_TONE: Record<TopicId, [string, string, string]> = {
  today: ["오늘은 무리하지 말고 꼭 필요한 일만 하세요.", "오늘은 평소대로 하되 아래 한 가지만 챙기면 돼요.", "오늘은 하고 싶던 일을 해도 좋은 날이에요."],
  love: ["연애에서는 서두르면 어긋나요. 오해를 푸는 일이 먼저예요.", "연애에서는 아직 지켜볼 때예요. 상대의 말보다 행동을 조금 더 보세요.", "연애에서는 다가가도 좋다는 신호예요."],
  money: ["돈 문제는 새로 벌이지 말고 지키는 쪽이 안전해요.", "돈 문제는 큰 변화 없이 이어져요. 계획을 점검하기 좋은 때예요.", "돈 문제는 흐름이 좋아요. 계획한 일을 진행해도 돼요."],
  work: ["일에서는 새 일을 늘리기보다 하던 일을 정리하는 것이 먼저예요.", "일에서는 지금 방식을 유지하면서 준비할 때예요.", "일에서는 나서도 좋은 때예요. 맡거나 제안해 보세요."],
  study: ["공부는 양을 줄이고 쉬는 시간을 넣어야 오래가요.", "공부는 지금 속도를 유지하면서 방법을 점검하세요.", "공부는 흐름이 좋아요. 미뤄 둔 과정을 시작하세요."],
  people: ["관계에서는 거리를 조금 두고 감정을 가라앉히는 것이 먼저예요.", "관계에서는 지금 거리를 유지하며 지켜보세요.", "관계에서는 먼저 다가가면 반응이 좋아요."],
  choice: ["이 선택은 서두르지 않는 편이 좋아요.", "이 선택은 정보가 더 필요해요.", "이 선택은 해 봐도 좋은 쪽이에요."],
};

const VERDICT = [
  "지금은 조심할 때예요. 새로 벌이기보다 정리하고 쉬는 쪽이 좋아요.",
  "나쁘지 않지만 아직 지켜볼 때예요. 준비하면서 기다리세요.",
  "흐름이 좋아요. 마음먹은 대로 움직여도 돼요.",
];

/** 주제 풀이를 붙이는 자리(지금과 앞날을 말하는 자리) */
const AHEAD = new Set(["현재", "미래", "핵심", "A를 고르면", "B를 고르면", "가까운 미래", "결과"]);
/** 할 일 목록에 올리는 자리와 그 이름표 */
const ACTION_LABEL: Record<string, string> = {
  현재: "지금 할 일", 미래: "앞날을 위해", 핵심: "오늘 할 일", 조언: "어느 쪽이든", "A를 고르면": "A로 간다면", "B를 고르면": "B로 간다면",
  걸림돌: "걸림돌을 넘으려면", 나: "내 태도에서", 결과: "좋은 결과를 위해",
};

const SUIT_NOTE: Record<Exclude<TarotGroup, "major">, string> = {
  wands: "완드 카드가 많아요. 이 일의 중심은 ‘의욕과 행동’이라는 뜻이에요.",
  cups: "컵 카드가 많아요. 이 일의 중심은 ‘감정과 관계’라는 뜻이에요.",
  swords: "소드 카드가 많아요. 이 일의 중심은 ‘생각과 결정’이라는 뜻이에요.",
  pentacles: "펜타클 카드가 많아요. 이 일의 중심은 ‘돈과 현실적인 조건’이라는 뜻이에요.",
};

export type Tone = -1 | 0 | 1;
/** 뒤집히면 좋은 카드와 조심 카드는 '지켜보기'로, 중간 카드는 '조심'으로 읽는다 */
export const toneOf = (card: TarotCard, reversed: boolean): Tone => (!reversed ? card.tone : card.tone === 0 ? -1 : 0);
const firstKeyword = (card: TarotCard) => card.keywords.split(" · ")[0];

export type PositionReading = {
  position: string; card: TarotCard; reversed: boolean; tone: Tone;
  /** 이 자리가 뜻하는 것 */
  frame: string;
  /** 카드의 뜻 */
  meaning: string;
  /** 고른 주제에서의 풀이. 지난 일을 말하는 자리에는 없다 */
  topicLine: string | null;
  action: string;
};
export type Reading = {
  positions: PositionReading[];
  /** 한 줄 결론 */
  verdict: string;
  /** 카드 흐름을 이은 설명 */
  flow: string[];
  actions: { label: string; text: string }[];
  notes: string[];
};

export function readCards(ids: readonly string[], reversedById: Record<string, boolean>, spread: SpreadId, topic: TopicId): Reading {
  const pos = spreadById(spread).positions;
  const positions = ids.map((id, i): PositionReading => {
    const card = cardById(id);
    const reversed = !!reversedById[id];
    const tone = toneOf(card, reversed);
    const own = TOPIC_TEXT[id]?.[topic]?.[reversed ? "rev" : "up"];
    return {
      position: pos[i], card, reversed, tone, frame: FRAMES[pos[i]],
      meaning: own?.meaning ?? (reversed ? card.reversed : card.upright),
      topicLine: !own && AHEAD.has(pos[i]) ? TOPIC_TONE[topic][tone + 1] : null,
      action: own?.action ?? (reversed ? card.doReversed : card.doUpright),
    };
  });
  const at = (name: string) => positions.find((p) => p.position === name)!;
  const word = (p: PositionReading) => `‘${firstKeyword(p.card)}’${p.reversed ? "(뒤집힘)" : ""}`;
  const flow: string[] = [];
  let verdict: string;

  if (spread === "one") {
    verdict = VERDICT[at("핵심").tone + 1];
  } else if (spread === "three") {
    const [now, next] = [at("현재"), at("미래")];
    verdict = VERDICT[next.tone + 1];
    flow.push(`과거 ${word(at("과거"))} → 현재 ${word(now)} → 미래 ${word(next)} 순서로 흘러요.`);
    flow.push(next.tone > now.tone ? "지금보다 앞으로가 나아지는 흐름이에요." : next.tone < now.tone ? "지금보다 앞으로 조심할 일이 생기는 흐름이에요. 아래 할 일을 해 두면 대비할 수 있어요." : ["당분간 조심스러운 흐름이 이어져요.", "큰 변화 없이 지금 상태가 이어져요.", "좋은 흐름이 그대로 이어져요."][now.tone + 1]);
  } else if (spread === "choice") {
    const [a, b] = [at("A를 고르면"), at("B를 고르면")];
    verdict = a.tone > b.tone ? "카드로 보면 A 쪽이 더 순조로워요." : a.tone < b.tone ? "카드로 보면 B 쪽이 더 순조로워요." : "두 쪽의 흐름이 비슷해요. 조언 카드를 기준으로 고르세요.";
    flow.push(`A는 ${word(a)}, B는 ${word(b)} 쪽으로 흘러요.`);
  } else {
    const [block, soon, end] = [at("걸림돌"), at("가까운 미래"), at("결과")];
    verdict = VERDICT[end.tone + 1];
    flow.push(`지금 상태는 ${word(at("현재"))}, 가장 큰 걸림돌은 ${word(block)}, 곧 다가올 일은 ${word(soon)}, 닿는 곳은 ${word(end)} 카드예요.`);
    flow.push(`이 일의 뿌리는 ${word(at("뿌리"))}, 내가 바라는 것은 ${word(at("목표"))} 카드예요. 둘이 어긋나 있다면 그 차이부터 살펴보세요.`);
  }

  const cards = positions.map((p) => p.card);
  const n = cards.length;
  const notes: string[] = [];
  if (n > 1) {
    if (cards.filter((c) => c.group === "major").length * 2 >= n) notes.push("메이저 카드가 절반 이상이에요. 사소한 일이 아니라 꽤 중요한 시기라는 뜻이에요.");
    for (const g of ["wands", "cups", "swords", "pentacles"] as const) {
      if (cards.filter((c) => c.group === g).length >= Math.max(2, Math.ceil(n * 0.4))) notes.push(SUIT_NOTE[g]);
    }
    if (cards.some((c) => c.group !== "major" && c.rank > 10)) notes.push("인물 카드가 있어요. 주변의 한 사람이 이 일에 큰 영향을 준다는 뜻이에요.");
    if (positions.filter((p) => p.reversed).length * 2 >= n) notes.push("뒤집힌 카드가 절반 이상이에요. 일이 막혀 있거나 속으로 참는 것이 많다는 뜻이에요. 서두르지 마세요.");
  }
  const actions = positions.filter((p) => ACTION_LABEL[p.position]).map((p) => ({ label: ACTION_LABEL[p.position], text: p.action }));
  return { positions, verdict, flow, actions, notes };
}

/** 답하지 않는 질문. 걸리면 안내 문구, 아니면 null */
export function blockedQuestion(q: string): string | null {
  // 겉모양만 닮은 낱말을 먼저 지우고 본다
  const t = q.replace(/\s+/g, "").replace(/병아리|질병휴직|죽고못|학생부|대학생|대학원생|학생회/g, "");
  if (/(질병|병원|병명|아픈병|큰병|무슨병|불치|암인|암일|암에|진단|수술|임신|수명|죽|사망|자살|자해)/.test(t)) return "건강 진단이나 생명에 관한 질문은 운세로 답하지 않아요. 걱정되는 점이 있다면 전문가와 이야기해 주세요.";
  if (/(주식|코인|비트|종목|로또|복권|선물옵션)/.test(t)) return "투자 종목이나 당첨에 관한 질문은 답하지 않아요. 돈을 대하는 태도를 묻는 질문은 환영해요.";
  if (/(학생|우리반아이|학부모|반아이)/.test(t)) return "특정한 다른 사람을 점치는 질문은 답하지 않아요. ‘나는 어떤 태도로 대하면 좋을까’처럼 나에 대한 질문으로 바꿔 보세요.";
  if (/(합격|당락|붙을까|떨어질까)/.test(t)) return "합격 여부는 단정하지 않아요. ‘남은 기간 무엇을 챙기면 좋을까’로 바꿔 보세요.";
  return null;
}

/** 질문에 섞인 연락처·주민번호 모양을 화면에서도 지운다 */
export const scrub = (q: string) => q.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "").replace(/\d{6}-?\d{7}/g, "").replace(/01\d-?\d{3,4}-?\d{4}/g, "").slice(0, 120);
