import { COMMUNICATION, COMPAT_EL, DISCLAIMER, EL_INFO, FRICTION, GROUP_DO, GROUP_LIFE, GROUP_LUCK, gradeOf, ILGAN, STRENGTH_TEXT } from "@/data/fortune/saju-text";
import { analyze, branchRelations, stemHap, type Analysis } from "./analysis";
import { ANIMALS, branchOf, EL_HANJA, ganjiKo, ganjiName, mod, stemEl, stemOf, type El, type Saju } from "./core";
import { goodDays, monthLuck, samjae, yearLuck, type DaeunStep } from "./luck";

export type Ctx = { saju: Saju; a: Analysis; today: { y: number; m: number; d: number }; daeun: DaeunStep[] | null; age: number };

export type RelationshipInsight = {
  compatibleTraits: string[];
  communicationStyle: string;
  frictionPoints: string[];
  meetingContexts: string[];
  practicalActions: string[];
  romance: string;
  friendshipWork: string;
  disclaimer: string;
};

const elText = (e: El) => `${EL_INFO[e].name}(${EL_HANJA[e]})`;
const has = (a: Analysis, key: string) => a.sinsal.some((x) => x.key === key);

export function relationshipInsight(s: Saju, a: Analysis): RelationshipInsight {
  const c = COMPAT_EL[a.yong];
  // 일지와 삼합·육합인 띠
  const day = branchOf(s.day);
  const animals = ANIMALS.filter((_, b) => branchRelations(day, b).some((r) => r === "육합" || r === "삼합"));
  return {
    compatibleTraits: [...c.traits],
    communicationStyle: COMMUNICATION[a.dayStem],
    frictionPoints: [FRICTION[a.dayStem], a.strength === "신강" ? "내 속도로만 끌고 갈 때" : a.strength === "신약" ? "거절하지 못하고 떠안을 때" : "양쪽을 다 맞추려 할 때"],
    meetingContexts: [...c.places],
    practicalActions: [
      `‘${c.places[0]}’에 한 번 나가 보세요`,
      has(a, "cheoneul") ? "예전에 도움을 준 사람에게 먼저 안부를 전해 보세요" : "소개를 부탁할 때 원하는 사람의 성향을 한 문장으로 말해 보세요",
      `마음에 드는 사람에게 ‘${EL_INFO[a.yong].act.split(", ")[0]}’ 같은 활동을 함께 하자고 제안해 보세요`,
    ],
    romance: `${has(a, "dohwa") ? "사람들의 호감을 쉽게 얻는 편이에요. 그 가운데 함께 있을 때 편안한 사람을 천천히 고르세요." : "첫눈에 끌리는 사람보다 오래 볼수록 좋아지는 사람과 잘 맞아요."} 나에게 부족한 ${elText(a.yong)} 기운을 가진 ‘${c.traits[0]}’ 곁에 있으면 마음이 안정돼요.`,
    friendshipWork: `${a.groups[0] >= 2 ? "나와 비슷한 성향의 동료가 많은 편이에요. 일을 시작할 때 역할을 먼저 나누면 부딪힐 일이 줄어요." : "나와 속도가 다른 동료가 내 빈 곳을 채워 줘요. 다르다고 밀어내지 마세요."} 태어난 날 기준으로 잘 맞는 띠는 ${animals.join("·")}띠예요.`,
    disclaimer: DISCLAIMER,
  };
}

/** 사주를 쉬운 말 세 줄로 */
export function overview(a: Analysis): string[] {
  const strong = EL_INFO[a.strongest];
  const yong = EL_INFO[a.yong];
  return [
    STRENGTH_TEXT[a.strength],
    a.missing.length
      ? `${strong.name} 기운이 가장 많아 ${strong.more}이 강해요. 반대로 ${a.missing.map((e) => EL_INFO[e].name).join("·")} 기운은 글자에 없으니 ${EL_INFO[a.missing[0]].less}.`
      : `${strong.name} 기운이 가장 많아 ${strong.more}이 강해요. 다섯 기운이 모두 있어 한쪽으로 크게 치우치지 않아요.`,
    `나에게 가장 도움이 되는 것은 ${yong.name} 기운(${yong.keyword})이에요. 생활에서는 ${yong.act} 같은 활동으로 채울 수 있어요.`,
  ];
}

export const QUESTIONS = [
  { id: "life", label: "평생 운세", hint: "내 인생의 큰 흐름은?", words: ["평생", "총운", "인생", "성격", "나는어떤"] },
  { id: "love", label: "연애·결혼", hint: "나에게 맞는 연애는?", words: ["연애", "결혼", "인연", "썸", "짝사랑", "애인", "남자친구", "여자친구", "배우자"] },
  { id: "money", label: "재물운", hint: "돈을 모으는 내 방식은?", words: ["돈", "재물", "금전", "저축", "재테크", "월급"] },
  { id: "work", label: "직장·승진", hint: "일과 자리의 흐름은?", words: ["승진", "전보", "직장", "업무", "이직", "커리어", "회사", "취업"] },
  { id: "study", label: "학업·시험", hint: "나에게 맞는 공부법은?", words: ["학업", "시험", "공부", "연수", "자격", "대학원", "임용"] },
  { id: "match", label: "궁합", hint: "상대 생일·띠로 보는 사이", words: ["궁합", "잘맞", "띠", "상대", "그사람", "남친", "여친", "남편", "아내"] },
  { id: "newyear", label: "신년운", hint: "내년은 어떤 해일까?", words: ["신년", "내년", "새해"] },
  { id: "samjae", label: "삼재", hint: "올해 삼재에 해당할까?", words: ["삼재"] },
  { id: "move", label: "이사·이동", hint: "옮기는 것이 좋을까?", words: ["이사", "이동", "해외", "여행", "옮기"] },
  { id: "health", label: "생활 리듬", hint: "기운을 채우는 방법은?", words: ["건강", "컨디션", "체력", "피로", "리듬", "쉬"] },
  { id: "goodday", label: "좋은 날", hint: "앞으로 30일, 좋은 날은?", words: ["좋은날", "택일", "길일", "면접", "언제"] },
  { id: "family", label: "가족운", hint: "가족과 편해지는 법은?", words: ["가족", "부모", "엄마", "아빠", "형제", "자녀"] },
] as const;
export type QuestionId = (typeof QUESTIONS)[number]["id"];

/** 자유 질문을 낱말로 가장 가까운 주제에 연결한다 */
export function routeQuestion(q: string): QuestionId | null {
  const t = q.replace(/\s+/g, "");
  return QUESTIONS.find((x) => x.words.some((w) => t.includes(w)))?.id ?? null;
}

export type Answer = {
  title: string;
  /** 한 줄 결론 */
  summary: string;
  /** 왜 그렇게 보는지, 쉬운 말로 */
  why: string;
  /** 해 볼 일 */
  actions: string[];
  /** 계산 근거(용어) */
  basis: string;
  note?: string;
};

const wonguk = (s: Saju) => [s.year, s.month, s.day, ...(s.hour === null ? [] : [s.hour])].map(ganjiName).join(" ");
const weekday = (d: { y: number; m: number; d: number }) => "일월화수목금토"[new Date(Date.UTC(d.y, d.m - 1, d.d)).getUTCDay()];

export function answer(id: QuestionId, c: Ctx, otherBranch = 0, partner: Saju | null = null): Answer {
  const { saju: s, a, today } = c;
  const me = ILGAN[a.dayStem];
  const g = a.groups;
  const yong = EL_INFO[a.yong];
  const title = QUESTIONS.find((q) => q.id === id)!.label;
  switch (id) {
    case "life": {
      const top = g.indexOf(Math.max(...g));
      return {
        title,
        summary: `${me.title}이에요. ${me.headline}이고, ${GROUP_LIFE[top]}`,
        why: `${STRENGTH_TEXT[a.strength]} 사주에서 ${EL_INFO[a.strongest].name} 기운이 가장 많아 ${EL_INFO[a.strongest].more}이 두드러져요.`,
        actions: [GROUP_DO[top], `${yong.name} 기운을 채우는 활동(${yong.act}) 가운데 하나를 골라 꾸준히 해 보세요.`, ...(c.daeun ? [bestDaeun(c.daeun)] : [])],
        basis: `원국 ${wonguk(s)} · ${a.strength} · 용신 ${elText(a.yong)}`,
      };
    }
    case "love": {
      const r = relationshipInsight(s, a);
      return {
        title,
        summary: has(a, "dohwa") ? "호감을 쉽게 얻는 편이에요. 중요한 것은 그 가운데 편안한 사람을 고르는 일이에요." : "첫눈에 반하는 연애보다 오래 볼수록 깊어지는 연애가 잘 맞아요.",
        why: `${r.communicationStyle} 나에게 부족한 ${yong.name} 기운을 가진 ‘${r.compatibleTraits[0]}’ 곁에 있을 때 가장 안정돼요.`,
        actions: [`‘${r.frictionPoints[0]}’에는 서로 어긋나기 쉬우니, 잠시 멈추고 내 마음을 짧게라도 솔직히 말해 보세요.`, `${r.practicalActions[0]}.`, `${r.practicalActions[2]}.`],
        basis: `일지 ${ganjiName(s.day)[1]} · ${has(a, "dohwa") ? "도화 있음" : "도화 없음"} · 용신 ${elText(a.yong)}`,
        note: "결혼 시기나 상대를 단정하지 않아요.",
      };
    }
    case "money":
      return {
        title,
        summary: g[2] === 0 ? "큰돈을 쫓기보다 전문성으로 꾸준히 버는 쪽이 맞아요." : g[2] >= 3 ? "돈 벌 기회는 자주 오지만 벌여 놓은 일이 많아 돈이 새기 쉬워요." : "들어오는 돈과 나가는 돈이 고른 편이에요. 꾸준히 모으면 쌓여요.",
        why: `사주에서 재물을 뜻하는 글자가 ${g[2]}개, 기술과 표현을 뜻하는 글자가 ${g[1]}개예요. ${g[1] >= 2 ? "만들고 가르치는 능력이 수입으로 이어지기 쉬운 편이에요." : "새로 벌이기보다 정해진 수입을 잘 관리하는 쪽이 유리한 편이에요."}`,
        actions: [g[2] >= 3 ? "돈이 드는 일은 한 번에 하나씩만 진행하세요." : "월급날 자동이체로 먼저 저축하세요.", g[1] >= 2 ? "만든 자료와 경력을 기록으로 남겨 두세요. 나중에 수입으로 이어질 수 있어요." : "한 달 예산표를 만들고 고정 지출부터 점검하세요."],
        basis: `재성 ${g[2]}개 · 식상 ${g[1]}개 · ${a.strength}`,
        note: "투자 종목이나 수익은 운세로 답하지 않아요.",
      };
    case "work": {
      const y = yearLuck(s, a, today.y);
      const gr = gradeOf(y.score);
      return {
        title,
        summary: `올해 일의 흐름은 ‘${gr.name}’ 단계예요. ${gr.line}`,
        why: `사주에서 책임과 자리를 뜻하는 글자가 ${g[3]}개예요. ${g[3] === 0 ? "정해진 자리보다 스스로 만든 역할로 인정받는 유형이에요." : g[3] >= 3 ? "책임지는 자리가 자주 찾아오는 유형이라 일이 몰리기 쉬워요." : "맡은 자리를 무리 없이 해내는 유형이에요."}`,
        actions: [y.score >= 68 ? "하고 싶던 일이나 자리가 있다면 올해 의사를 밝히세요." : "올해는 자리를 옮기기보다 지금 일의 성과를 정리해 두세요.", g[4] >= 2 ? "자격증이나 교육 과정처럼 기록에 남는 공부를 하나 시작해 보세요." : "일에서 낸 결과를 숫자나 자료로 눈에 보이게 정리해 두세요."],
        basis: `관성 ${g[3]}개 · 인성 ${g[4]}개 · ${today.y}년 ${ganjiName(y.pillar)}`,
      };
    }
    case "study":
      return {
        title,
        summary: g[4] >= 2 ? "읽고 이해하는 힘이 좋아요. 다만 완벽히 알 때까지 시작을 미루기 쉬워요." : "직접 해 보면서 배우는 쪽이 잘 맞아요.",
        why: `사주에서 배움을 뜻하는 글자가 ${g[4]}개, 표현을 뜻하는 글자가 ${g[1]}개예요.${has(a, "munchang") ? " 글과 공부에 밝다는 문창귀인도 있어요." : ""}`,
        actions: [g[4] >= 2 ? "절반쯤 이해했을 때 바로 문제를 풀어 보세요." : "문제부터 풀고, 틀린 부분의 개념만 찾아보세요.", g[1] >= 2 ? "배운 것을 다른 사람에게 5분 동안 설명해 보세요." : "하루 공부한 내용을 한 쪽으로 정리하세요."],
        basis: `인성 ${g[4]}개 · 식상 ${g[1]}개 · ${has(a, "munchang") ? "문창귀인 있음" : "문창귀인 없음"}`,
        note: "합격 여부는 단정하지 않아요.",
      };
    case "match": {
      if (partner) return matchAnswer(c, partner);
      const mine = branchOf(s.year);
      const rel = branchRelations(mine, otherBranch);
      const good = rel.some((r) => r === "육합" || r === "삼합");
      const kind = mine === otherBranch ? 0 : good ? 1 : rel.includes("충") ? 2 : rel.length ? 3 : 4;
      return {
        title: `${ANIMALS[mine]}띠와 ${ANIMALS[otherBranch]}띠`,
        summary: ["같은 띠라 생각하는 방식이 비슷해요. 잘 통하지만 고집도 닮았어요.", "서로 돕는 띠예요. 함께 일하면 손발이 잘 맞아요.", "정반대에 있는 띠예요. 생각이 달라 부딪히기 쉽지만 서로에게 배울 점이 많아요.", "작은 일로 엇갈리기 쉬운 띠예요. 큰 문제는 아니에요.", "특별히 끌리지도 부딪히지도 않는 띠예요. 시간을 들일수록 편해져요."][kind],
        why: ["두 사람의 띠가 같아요.", "띠끼리 서로 힘을 보태는 사이(합)예요.", "띠끼리 마주 보는 자리(충)에 있어요.", "띠끼리 살짝 어긋나는 사이(형·파·해)예요.", "두 띠 사이에 강하게 끌리거나 부딪히는 기운이 없어요."][kind],
        actions: [["의견이 갈리면 한 사람이 먼저 양보하기로 미리 정하세요.", "함께할 일을 하나 정해 같이 시작해 보세요.", "결정할 일은 서로 하루씩 생각한 뒤 이야기하세요.", "짐작하지 말고 짧게 물어보세요.", "일주일에 한 번, 함께하는 시간을 정해 두세요."][kind]],
        basis: `연지 ${ganjiName(s.year)[1]} 기준 · ${rel.length ? rel.join("·") : "합충 없음"}`,
        note: "띠는 사주 여덟 글자 가운데 하나일 뿐이에요.",
      };
    }
    case "newyear": {
      const y = yearLuck(s, a, today.y + 1);
      const gr = gradeOf(y.score);
      const group = Math.floor(y.god / 2);
      return {
        title: `${today.y + 1}년 운세`,
        summary: `${today.y + 1}년은 ‘${gr.name}’ 흐름이에요. ${gr.line}`,
        why: GROUP_LUCK[group],
        actions: [GROUP_DO[group], bestMonth(c)],
        basis: `${today.y + 1} ${ganjiName(y.pillar)}(${ganjiKo(y.pillar)})년`,
      };
    }
    case "samjae": {
      const k = samjae(branchOf(s.year), today.y);
      const n = samjae(branchOf(s.year), today.y + 1);
      return {
        title,
        summary: k ? `올해는 ${k}에 해당해요. ${n ? `내년은 ${n} 시기예요.` : "내년에는 끝나요."}` : `올해는 삼재가 아니에요. ${n ? `내년부터 ${n} 시기가 시작돼요.` : "내년도 아니에요."}`,
        why: "삼재는 띠에 따라 9년마다 3년씩 돌아온다고 보는 옛 풍습이에요. 열두 띠 가운데 늘 세 띠가 해당하니 겁낼 일은 아니에요.",
        actions: k || n ? ["큰 계약이나 결정은 하루 더 생각하고 한 번 더 확인하세요.", "건강검진, 보험, 자료 백업처럼 점검하는 일을 미리 해 두세요."] : ["삼재 걱정은 내려놓고 오늘 계획한 일을 차분히 진행하세요."],
        basis: `${ANIMALS[branchOf(s.year)]}띠 · ${today.y}년, ${today.y + 1}년`,
      };
    }
    case "move": {
      const y = has(a, "yeokma");
      return {
        title,
        summary: y ? "움직일수록 일이 풀리는 유형이에요. 이사나 이동이 도움이 돼요." : "한곳에 오래 머물 때 힘이 나는 유형이에요. 옮긴다면 신중하게 고르세요.",
        why: y ? "사주에 이동을 뜻하는 역마가 있어요. 같은 자리에 오래 있으면 답답해지기 쉬워요." : "사주에 이동을 뜻하는 역마가 없어요. 자주 옮기면 쌓아 온 것이 흩어지기 쉬워요.",
        actions: [y ? "큰 이동이 어렵다면 자리 배치나 출퇴근길부터 바꿔 보세요." : "옮기기 전에 후보지를 두 번 이상 직접 가 보세요.", `여러 곳이 비슷하다면 생활권의 ${yong.dir} 방면을 먼저 살펴보세요.`],
        basis: `${y ? "역마 있음" : "역마 없음"} · 용신 방향 ${yong.dir}`,
      };
    }
    case "health": {
      const low = (a.missing[0] ?? a.yong) as El;
      return {
        title,
        summary: `${EL_INFO[low].name} 기운을 채우면 컨디션이 살아나요.`,
        why: `사주에서 ${EL_INFO[low].name} 기운이 부족하고 ${EL_INFO[a.strongest].name} 기운이 많아요. ${["일을 많이 벌여 잠이 모자라기 쉬워요.", "말과 일정이 많아 쉽게 지치고 예민해져요.", "움직임이 적어 몸이 무거워지기 쉬워요.", "긴장을 많이 해 어깨가 굳기 쉬워요.", "생각이 많아 몸이 차가워지기 쉬워요."][a.strongest]}`,
        actions: [`${EL_INFO[low].act} 가운데 하나를 골라 일주일에 두 번 해 보세요.`, ["자는 시간을 30분 앞당기세요.", "저녁 일정을 하나 줄이세요.", "한 시간에 한 번 일어나 걸으세요.", "자기 전에 어깨와 목을 풀어 주세요.", "따뜻한 물을 자주 마시고 햇볕을 쬐세요."][a.strongest]],
        basis: `부족 ${elText(low)} · 많음 ${elText(a.strongest)}`,
        note: "몸이 불편하면 운세 대신 꼭 병원에 가세요.",
      };
    }
    case "goodday": {
      const days = goodDays(s, a, today);
      return {
        title,
        summary: `앞으로 30일 가운데 좋은 날은 ${days.map((d) => `${d.m}월 ${d.d}일(${weekday(d)})`).join(", ")}이에요.`,
        why: "그날의 기운이 내가 태어난 날과 부딪히지 않고, 나에게 도움이 되는 기운이 담긴 날을 골랐어요.",
        actions: ["면접, 발표, 중요한 약속을 이 가운데 하루로 잡아 보세요.", `가장 가까운 날은 ${days[0].m}월 ${days[0].d}일이에요. 미뤄 둔 일 하나를 그날 하세요.`],
        basis: `앞으로 30일 일진과 일지 ${ganjiName(s.day)[1]}의 합·충, 용신 ${elText(a.yong)}`,
      };
    }
    case "family": {
      const clash = branchRelations(branchOf(s.month), branchOf(s.day)).includes("충");
      return {
        title,
        summary: clash ? "가족과는 조금 떨어져 있을 때 사이가 더 좋아요." : "가족과 무리 없이 잘 지내는 편이에요.",
        why: clash ? "사주에서 가족 자리와 내 자리가 마주 보고 있어요. 가까이 붙어 있으면 사소한 일로 부딪히기 쉬워요." : "사주에서 가족 자리와 내 자리가 부딪히지 않아요.",
        actions: [clash ? "연락 횟수를 늘리기보다 한 번 만날 때 이야기를 충분히 들어 주세요." : "특별한 일보다 평범한 식사를 자주 함께하세요.", g[4] >= 2 ? "이번에는 내가 먼저 부모님이나 가족을 챙겨 보세요." : "혼자 해결하려 하지 말고 가족에게 근황을 먼저 알리세요."],
        basis: `월주 ${ganjiName(s.month)} · 일주 ${ganjiName(s.day)}`,
      };
    }
  }
}

function bestDaeun(list: DaeunStep[]): string {
  const best = list.reduce((x, y) => (y.score > x.score ? y : x));
  return `10년 단위 흐름 가운데 ${best.age}세부터 ${best.age + 9}세까지가 가장 순조로워요. 큰 계획은 그 시기에 맞춰 보세요.`;
}

function bestMonth(c: Ctx): string {
  const list = monthLuck(c.saju, c.a, { y: c.today.y + 1, m: 1 });
  const best = list.reduce((x, y) => (y.score > x.score ? y : x));
  return `열두 달 가운데 ${best.month}월이 가장 순조로워요. 중요한 일정은 그 무렵에 잡으세요.`;
}

export type MatchDetail = {
  score: number;
  grade: string;
  /** 판정 한 줄씩(쉬운 말) */
  points: string[];
  /** 계산 근거(용어) */
  basis: string[];
  tips: string[];
};

const STEM_REL = ["닮은 기운", "내가 상대를 북돋우는 사이", "내가 상대를 이끄는 사이", "상대가 나를 이끄는 사이", "상대가 나를 북돋우는 사이"];

/** 두 사람의 사주(간지)로 보는 궁합. 계산은 결정론적이고 AI는 이 판정을 풀어 쓰기만 한다 */
export function matchDetail(me: Saju, ma: Analysis, other: Saju, oa: Analysis): MatchDetail {
  const s1 = stemOf(me.day), s2 = stemOf(other.day);
  const rel = mod(stemEl(s2) - stemEl(s1), 5);
  const hap = stemHap(s1, s2);
  const dayRel = branchRelations(branchOf(me.day), branchOf(other.day));
  const yearRel = branchRelations(branchOf(me.year), branchOf(other.year));
  const good = (r: string[]) => r.some((x) => x === "육합" || x === "삼합");
  const fillMe = oa.counts[ma.yong] >= 2;
  const fillThem = ma.counts[oa.yong] >= 2;
  const covers = ma.missing.filter((e) => oa.counts[e] > 0);

  let score = 60;
  score += hap ? 12 : [3, 8, -4, -6, 8][rel];
  score += good(dayRel) ? 10 : dayRel.includes("충") ? -10 : dayRel.length ? -4 : 0;
  score += good(yearRel) ? 5 : yearRel.includes("충") ? -5 : yearRel.length ? -2 : 0;
  score += (fillMe ? 6 : 0) + (fillThem ? 6 : 0) + (covers.length ? 3 : 0);
  score = Math.max(30, Math.min(95, score));
  const grade = score >= 80 ? "아주 잘 맞는 편" : score >= 65 ? "잘 맞는 편" : score >= 50 ? "서로 맞춰 가면 좋아지는 사이" : "차이를 인정할 때 편해지는 사이";

  const me1 = ILGAN[s1], they = ILGAN[s2];
  const points = [
    `나는 ${me1.title}, 상대는 ${they.title}이에요. ${hap ? "두 사람의 중심 글자가 서로 끌어당기는 사이(합)라 처음부터 마음이 잘 열려요." : ["중심 기운이 같아 말하지 않아도 통하는 부분이 많지만, 고집도 닮았어요.", "내가 상대에게 힘을 실어 주는 사이예요. 내가 챙기는 쪽이 되기 쉬워요.", "내가 상대를 끌고 가는 사이예요. 결정은 빠르지만 상대가 눌린다고 느낄 수 있어요.", "상대가 나를 이끄는 사이예요. 배우는 것이 많지만 내 속도를 지켜야 해요.", "상대가 나에게 힘을 실어 주는 사이예요. 곁에 있으면 기운이 나요."][rel]}`,
    good(dayRel) ? "생활의 결(태어난 날의 땅 기운)이 서로 잘 맞아 함께 지내기 편해요." : dayRel.includes("충") ? "생활의 결이 정반대라 습관이나 일정에서 자주 부딪힐 수 있어요. 대신 서로 모자란 점을 채워 줘요." : dayRel.length ? "생활의 결이 살짝 어긋나 작은 오해가 쌓이기 쉬워요." : "생활의 결이 무난해 큰 마찰은 적어요.",
    fillMe && fillThem ? `서로에게 필요한 기운(나는 ${EL_INFO[ma.yong].name}, 상대는 ${EL_INFO[oa.yong].name})을 상대가 넉넉히 가지고 있어 함께 있으면 둘 다 편안해져요.` : fillMe ? `상대가 나에게 필요한 ${EL_INFO[ma.yong].name} 기운을 넉넉히 가지고 있어 곁에 있으면 내가 안정돼요.` : fillThem ? `내가 상대에게 필요한 ${EL_INFO[oa.yong].name} 기운을 넉넉히 가지고 있어 상대가 나에게 기대기 쉬워요.` : "서로 필요한 기운을 직접 채워 주지는 않아, 함께 하는 활동으로 채우는 편이 좋아요.",
    `띠로 보면 ${ANIMALS[branchOf(me.year)]}띠와 ${ANIMALS[branchOf(other.year)]}띠로, ${good(yearRel) ? "서로 돕는 사이예요" : yearRel.includes("충") ? "마주 보는 자리라 생각이 다르기 쉬워요" : yearRel.length ? "살짝 엇갈리는 사이예요" : "특별히 부딪히지 않는 사이예요"}.`,
  ];
  if (covers.length) points.push(`내 사주에 없는 ${covers.map((e) => EL_INFO[e].name).join("·")} 기운을 상대가 가지고 있어요.`);

  const tips = [
    rel === 2 ? "중요한 결정 전에 상대 의견을 먼저 묻고, 내 생각은 그다음에 말해 보세요." : rel === 3 ? "끌려가는 느낌이 들면 ‘나는 이렇게 하고 싶어’라고 한 문장으로 먼저 말해 보세요." : rel === 1 ? "챙겨 주는 만큼 나도 기대고 싶다는 마음을 말로 전해 보세요." : "고마운 점을 하루에 하나씩 말로 표현해 보세요.",
    dayRel.includes("충") ? "생활 규칙(연락 주기, 쉬는 날 보내는 법)을 처음부터 같이 정해 두세요." : "함께하는 고정 일정(예: 일주일에 한 번 산책)을 하나 만들어 보세요.",
    ma.yong === oa.yong
      ? `두 사람 모두 ${EL_INFO[ma.yong].name} 기운이 필요해요. ‘${EL_INFO[ma.yong].act.split(", ")[0]}’ 같은 활동을 같이 해 보세요.`
      : `${EL_INFO[ma.yong].name}·${EL_INFO[oa.yong].name} 기운을 채우는 활동(${EL_INFO[ma.yong].act.split(", ")[0]}, ${EL_INFO[oa.yong].act.split(", ")[0]})을 번갈아 같이 해 보세요.`,
  ];
  const basis = [
    `일간 ${ganjiName(me.day)[0]}·${ganjiName(other.day)[0]}: ${hap ? "천간합" : STEM_REL[rel]}`,
    `일지 ${ganjiName(me.day)[1]}·${ganjiName(other.day)[1]}: ${dayRel.length ? dayRel.join("·") : "합충 없음"}`,
    `연지 ${ganjiName(me.year)[1]}·${ganjiName(other.year)[1]}: ${yearRel.length ? yearRel.join("·") : "합충 없음"}`,
    `용신 나 ${elText(ma.yong)}(상대 보유 ${oa.counts[ma.yong]}) · 상대 ${elText(oa.yong)}(나 보유 ${ma.counts[oa.yong]})`,
  ];
  return { score, grade, points, basis, tips };
}

function matchAnswer(c: Ctx, partner: Saju): Answer {
  // 상대 분석도 사주 간지만으로 한다
  const oa = analyze(partner);
  const d = matchDetail(c.saju, c.a, partner, oa);
  return {
    title: "두 사람의 사주 궁합",
    summary: `궁합 점수 ${d.score}점, ${d.grade}이에요. ${d.points[0]}`,
    why: d.points.slice(1).join(" "),
    actions: d.tips,
    basis: d.basis.join(" · "),
    note: "궁합은 관계의 결을 보는 참고일 뿐, 좋고 나쁨을 정하지 않아요.",
  };
}
