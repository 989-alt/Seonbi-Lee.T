/**
 * 타로 카드 78장 × 주제 7개 × 정·역방향 해석을 Claude로 미리 만들어 src/data/fortune/tarot-topics.json에 쓴다.
 * 실행: node scripts/fortune/pregenerate.ts  (ANTHROPIC_API_KEY는 .env.local에서 읽는다)
 * 이미 만든 카드는 건너뛴다. 다시 만들려면 JSON에서 그 카드를 지운다.
 */
import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import { TAROT_CARDS } from "../../src/data/fortune/tarot-cards.ts";

process.loadEnvFile(".env.local");
const OUT = "src/data/fortune/tarot-topics.json";
const TOPICS = { today: "오늘 하루", love: "연애·인연", money: "금전(수입·지출·저축)", work: "일·진로", study: "학업·시험·배움", people: "인간관계(가족·친구·동료)", choice: "선택·결정(할까 말까)" };

const SYSTEM = `당신은 20년 경력의 타로 상담가입니다. 손님 앞에서 카드를 짚으며 말하듯, 카드 한 장을 주제별로 풀이합니다. 손님은 직업과 나이를 모르는 일반 성인입니다.

[풀이 방법]
- meaning(2~3문장): 이 주제에서 이 카드가 나왔을 때 손님이 지금 어떤 상황에 있을 법한지 구체적인 장면으로 짚습니다. 카드 그림의 상징(인물, 사물, 숫자, 원소)이 왜 그런 뜻인지 한마디 근거를 댑니다. "좋은 흐름이에요" 같은 일반론으로 끝내지 않습니다.
- action(1~2문장): 손님이 이번 주 안에 할 수 있는 구체적인 행동입니다. 무엇을, 언제, 얼마나를 넣습니다. 주제와 직접 관련된 행동이어야 합니다(금전이면 돈에 관한 행동, 연애면 상대에게 하는 행동).
- 역방향은 정방향의 반대가 아니라, 그 힘이 막히거나 지나치거나 안으로 향한 상태로 읽습니다.
- 현실적으로 말합니다. 조심해야 할 카드는 무엇을 조심할지 분명히 말하고 달래는 말로 덮지 않습니다.

[지킬 것]
- 해요체(~예요, ~해요, ~하세요). 한 번 읽고 뜻을 알 수 있는 쉬운 말.
- 미래를 보장하거나 단정하지 않습니다(반드시, 무조건, 틀림없이 금지). "~하기 쉬워요", "~일 수 있어요"처럼 가능성으로 말합니다.
- 금전은 투자 종목·수익 예측을 말하지 않고 수입·지출·저축·계약을 대하는 태도와 행동만 말합니다. 건강 진단, 합격 단정, 특정 타인에 대한 단정은 하지 않습니다.
- 흉, 죽음, 파멸 같은 무서운 낱말을 쓰지 않습니다.
- 특정 직업(교사, 회사원 등)을 가정하지 않습니다.
- 주제마다, 방향마다 문장이 서로 달라야 합니다.

[출력] JSON만 냅니다. 설명이나 코드 블록 표시 없이 아래 모양 그대로:
{"today":{"up":{"meaning":"","action":""},"rev":{"meaning":"","action":""}},"love":{...},"money":{...},"work":{...},"study":{...},"people":{...},"choice":{...}}`;

const client = new Anthropic();
const done: Record<string, unknown> = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const todo = TAROT_CARDS.filter((c) => !done[c.id]);
console.log("남은 카드", todo.length);

function valid(o: Record<string, { up?: { meaning?: string; action?: string }; rev?: { meaning?: string; action?: string } }>) {
  return Object.keys(TOPICS).every((t) => [o[t]?.up, o[t]?.rev].every((x) => typeof x?.meaning === "string" && x.meaning.length > 20 && typeof x.action === "string" && x.action.length > 10));
}

async function one(card: (typeof TAROT_CARDS)[number]) {
  const user = `카드: ${card.nameKo} (${card.nameEn})\n핵심어: ${card.keywords}\n정방향 기본 뜻: ${card.upright}\n역방향 기본 뜻: ${card.reversed}\n\n주제: ${Object.entries(TOPICS).map(([k, v]) => `${k}=${v}`).join(", ")}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await client.messages.create({ model: "claude-sonnet-5-5", max_tokens: 6000, system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }], messages: [{ role: "user", content: user }] });
      const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
      const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
      if (!valid(json)) throw new Error("모양이 다름");
      done[card.id] = Object.fromEntries(Object.keys(TOPICS).map((t) => [t, json[t]]));
      fs.writeFileSync(OUT, JSON.stringify(done));
      return;
    } catch (e) {
      console.log(card.id, "다시 시도", attempt + 1, e instanceof Error ? e.message.slice(0, 80) : e);
    }
  }
  console.log(card.id, "실패");
}

let i = 0;
await Promise.all(Array.from({ length: 6 }, async () => { while (i < todo.length) await one(todo[i++]); }));
// 카드 순서대로 정렬해 저장
fs.writeFileSync(OUT, JSON.stringify(Object.fromEntries(TAROT_CARDS.filter((c) => done[c.id]).map((c) => [c.id, done[c.id]]))));
console.log("완료", Object.keys(done).length, "/ 78");
