"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { EL_INFO, GROUP_LUCK, gradeOf, ILGAN, TODAY_THEME } from "@/data/fortune/saju-text";
import { analyze, STAGES, TEN_GODS } from "@/lib/fortune/saju/analysis";
import { answer, overview, QUESTIONS, relationshipInsight, routeQuestion, type Ctx, type QuestionId } from "@/lib/fortune/saju/answers";
import { ANIMALS, BRANCH_EL, BRANCH_KO, BRANCHES, branchOf, EL_HANJA, ganjiKo, ganjiName, lunarToSolar, sajuOf, stemEl, STEM_KO, stemOf, STEMS, type El, type Saju } from "@/lib/fortune/saju/core";
import { daeun, koreanAge, monthLuck, todayFortune } from "@/lib/fortune/saju/luck";
import { blockedQuestion } from "@/lib/fortune/tarot/reading";
import { AiReading } from "./AiReading";
import { EL_VARS, ElementChart, FlowChart, Gauge, type FlowPoint } from "./SajuCharts";

type Ymd = { y: number; m: number; d: number };
type Birth = Ymd & { time: string | null; gender: "M" | "F" | null };

const SAMPLE: Birth = { y: 1988, m: 5, d: 21, time: "15:20", gender: null };
const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

export function SajuRoom({ today }: { today: Ymd }) {
  const [birth, setBirth] = useState<Birth | null>(null);
  const b = birth ?? SAMPLE;
  const resultRef = useRef<HTMLDivElement>(null);

  const r = useMemo(() => {
    const saju = sajuOf(b);
    const a = analyze(saju);
    const steps = b.gender ? daeun(saju, a, b.gender) : null;
    const ctx: Ctx = { saju, a, today, daeun: steps, age: koreanAge(b.y, today.y) };
    return { saju, a, ctx, today: todayFortune(saju, a, today), insight: relationshipInsight(saju, a) };
  }, [b, today]);

  const submit = (next: Birth) => {
    setBirth(next);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" }));
  };

  const me = ILGAN[r.a.dayStem];
  const key = `${r.saju.year}-${r.saju.month}-${r.saju.day}-${r.saju.hour}`;

  return (
    <div className="fx-wrap">
      <BirthForm today={today} onSubmit={submit} />

      <div ref={resultRef} key={key} style={{ scrollMarginTop: 92 }} className="mt-10 flex flex-col gap-5">
        {!birth && <p role="note" className="m-0 rounded-[12px] border border-[#e8c77a] px-4 py-3 text-[14.5px] text-[#f7e8bd]">지금 보이는 내용은 예시(1988년 5월 21일 15시 20분)예요. 생년월일을 넣으면 내 결과로 바뀌어요.</p>}
        {birth && r.saju.nearTerm && <p role="note" className="m-0 rounded-[12px] border border-[#e8c77a] px-4 py-3 text-[14.5px] text-[#f7e8bd]">절기가 바뀌는 때에 태어나셨어요. 몇 분 차이로 연주나 월주가 달라질 수 있어요.</p>}

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <section aria-labelledby="pillar-title" className="fx-panel">
            <h2 id="pillar-title" className="fx-h2">{birth ? "나의 사주 원국" : "사주 원국 예시"}</h2>
            <p className="fx-body mt-2">태어난 해·달·날·시의 여덟 글자예요. {r.saju.solarTime ? `서울 태양시 ${r.saju.solarTime} 기준으로 세웠어요.` : "태어난 시각을 몰라 여섯 글자로 읽었어요."}</p>
            <div className="fx-pillars mt-5">
              <Pillar title="시주" sub="앞날·자녀" p={r.saju.hour} i={0} day={r.a.dayStem} />
              <Pillar title="일주" sub="나 자신" p={r.saju.day} i={2} day={r.a.dayStem} me />
              <Pillar title="월주" sub="사회·환경" p={r.saju.month} i={4} day={r.a.dayStem} />
              <Pillar title="연주" sub="뿌리·가족" p={r.saju.year} i={6} day={r.a.dayStem} />
            </div>
            <h3 className="fx-h3 mt-6">쉬운 말로 풀면</h3>
            <ul className="m-0 mt-2 flex list-disc flex-col gap-1 pl-5">{overview(r.a).map((l) => <li key={l} className="fx-body text-[15px]!">{l}</li>)}</ul>
            <p className="m-0 mt-3 text-[13px] leading-[1.7] text-lilac">근거: {ANIMALS[branchOf(r.saju.year)]}띠, {r.a.strength}(돕는 힘 {r.a.support}/100), 용신 {EL_INFO[r.a.yong].name}({EL_HANJA[r.a.yong]}). 간이 계산이에요.</p>
          </section>

          <section aria-labelledby="ilgan-title" className="fx-paper relative flex flex-col gap-5 sm:flex-row sm:items-stretch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={me.image} alt="" width={640} height={640} className="aspect-square w-full flex-none rounded-[14px] object-cover sm:aspect-auto sm:w-[44%]" />
            <div className="flex min-w-0 flex-col gap-3 sm:justify-center">
              <h2 id="ilgan-title" className="fx-h2">{me.title}</h2>
              <p className="m-0 text-[15px] font-bold text-[#4e43a0]!">{STEMS[r.a.dayStem]}({STEM_KO[r.a.dayStem]}) 일간, {me.headline}</p>
              <p className="m-0 text-[15.5px] leading-[1.8] break-keep">{me.desc}</p>
              <div className="flex flex-wrap gap-2">{me.tags.map((t) => <span key={t} className="fx-chip">{t}</span>)}</div>
              {r.a.sinsal.length > 0 && (
                <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0 text-[14px] leading-[1.6] text-[#463e66]">
                  {r.a.sinsal.map((s) => <li key={s.key}><strong className="text-[#1b1530]">{s.name}</strong> {s.desc}</li>)}
                </ul>
              )}
            </div>
          </section>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <section aria-labelledby="el-title" className="fx-panel flex flex-col">
            <h2 id="el-title" className="fx-h2 mb-5">오행 에너지 밸런스</h2>
            <ElementChart counts={r.a.counts} />
            <p className="fx-body mt-5">{elementLine(r.a.missing, r.a.strongest)}</p>
          </section>
          <TodayPanel r={r} today={today} />
        </div>

        <section aria-labelledby="flow-title" className="fx-panel">
          <h2 id="flow-title" className="fx-h2">{r.ctx.daeun ? "대운 흐름" : "앞으로 열두 달 흐름"}</h2>
          <p className="fx-body mt-2 mb-5">{r.ctx.daeun ? "10년마다 바뀌는 큰 흐름이에요. 월주와 절기까지의 날수로 계산했어요." : "대운은 성별을 골라야 계산할 수 있어 월운을 보여 드려요. 절기로 나눈 달의 기운을 내 사주와 견준 값이에요."}</p>
          <Flow ctx={r.ctx} />
        </section>

        <Relationship insight={r.insight} sample={!birth} />
        <Ask ctx={r.ctx} sample={!birth} today={today} />
      </div>
    </div>
  );
}

function elementLine(missing: El[], strongest: El): string {
  const strong = `${EL_INFO[strongest].name} 기운이 가장 많아요. ${EL_INFO[strongest].more}이 커요.`;
  return missing.length ? `${strong} ${missing.map((e) => EL_INFO[e].name).join("·")} 기운은 겉으로 보이지 않으니 ${EL_INFO[missing[0]].less}.` : `${strong} 다섯 기운이 모두 있어 어느 쪽으로도 잘 섞이는 편이에요.`;
}

function Pillar({ title, sub, p, i, day, me }: { title: string; sub: string; p: number | null; i: number; day: number; me?: boolean }) {
  if (p === null) {
    return (
      <div className="fx-pillar">
        <span className="text-[14px] font-bold">{title}</span>
        {[0, 1].map((k) => <span key={k} className="fx-glyph" style={{ "--el": "#8b7dcc", "--i": i + k } as React.CSSProperties}><span>모름</span></span>)}
        <span className="text-[12.5px] text-lilac">{sub}</span>
      </div>
    );
  }
  const s = stemOf(p);
  const br = branchOf(p);
  return (
    <div className="fx-pillar">
      <span className="text-[14px] font-bold">{title}</span>
      <span className="fx-glyph" style={{ "--el": EL_VARS[stemEl(s)], "--i": i } as React.CSSProperties}><b>{STEMS[s]}</b><span>{STEM_KO[s]} {EL_INFO[stemEl(s)].name}{me ? " (나)" : ""}</span></span>
      <span className="fx-glyph" style={{ "--el": EL_VARS[BRANCH_EL[br]], "--i": i + 1 } as React.CSSProperties}><b>{BRANCHES[br]}</b><span>{BRANCH_KO[br]} {EL_INFO[BRANCH_EL[br]].name}</span></span>
      <span className="text-[12.5px] text-lilac">{sub}</span>
      <span className="sr-only">{ganjiKo(p)}, 일간 {STEM_KO[day]} 기준</span>
    </div>
  );
}

function TodayPanel({ r, today }: { r: { a: ReturnType<typeof analyze>; today: ReturnType<typeof todayFortune> }; today: Ymd }) {
  const t = r.today;
  const theme = TODAY_THEME[Math.floor(t.god / 2)];
  const el = EL_INFO[r.a.yong];
  const weekday = "일월화수목금토"[new Date(Date.UTC(today.y, today.m - 1, today.d)).getUTCDay()];
  const sub = [["인연", t.love], ["재물", t.money], ["배움", t.study], ["활력", t.energy]] as const;
  return (
    <section aria-labelledby="today-title" className="fx-panel">
      <h2 id="today-title" className="fx-h2">오늘의 운세</h2>
      <p className="m-0 mt-1 text-[14px] text-lilac">{today.y}년 {today.m}월 {today.d}일({weekday}), {ganjiName(t.pillar)} {ganjiKo(t.pillar)}일</p>
      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[190px_1fr] lg:grid-cols-1 xl:grid-cols-[190px_1fr]">
        <Gauge score={t.total} />
        <div>
          <h3 className="fx-h3 text-mint">{theme.name}</h3>
          <p className="fx-body mt-2">{theme.line} {gradeOf(t.total).line}</p>
          <dl className="m-0 mt-3 flex flex-col gap-2 text-[15px] leading-[1.7]">
            <div><dt className="inline font-bold text-mint">하면 좋은 일 </dt><dd className="m-0 inline text-[#e4dff4]">{theme.good}</dd></div>
            <div><dt className="inline font-bold text-[#f7e8bd]">조심할 일 </dt><dd className="m-0 inline text-[#e4dff4]">{theme.care}</dd></div>
          </dl>
        </div>
      </div>
      <dl className="m-0 mt-5 grid grid-cols-4 gap-2 text-center">
        {sub.map(([n, v]) => (
          <div key={n} className="rounded-[12px] bg-[#120e22] py-3">
            <dt className="text-[13.5px] text-lilac">{n}</dt>
            <dd className="m-0 font-pixel text-[21px] font-bold text-white tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0 mt-4 text-[13px] leading-[1.7] text-lilac">점수는 오늘의 기운이 내 사주와 얼마나 잘 맞는지를 0~100으로 나타낸 값이에요. 근거: 십신 {TEN_GODS[t.god]}, 12운성 {STAGES[t.stage]}{t.relations.length ? `, 일지와 ${t.relations.join("·")}` : ""}.</p>
      <p className="m-0 mt-2 text-[14.5px] leading-[1.7] text-lilac">행운의 색 <span aria-hidden className="inline-block h-[11px] w-[11px] rounded-full align-[-1px]" style={{ background: el.hex }} /> <strong className="text-white">{el.color}</strong>, 숫자 <strong className="text-white">{el.nums}</strong>, 방향 <strong className="text-white">{el.dir}</strong></p>
    </section>
  );
}

function Flow({ ctx }: { ctx: Ctx }) {
  if (ctx.daeun) {
    const steps = ctx.daeun;
    const found = steps.findLastIndex((s) => ctx.age >= s.age);
    const points: FlowPoint[] = steps.map((s) => ({ key: String(s.age), label: `${s.age}세`, score: s.score, title: `${s.age}~${s.age + 9}세 ${ganjiName(s.pillar)} 대운`, detail: GROUP_LUCK[Math.floor(s.god / 2)] }));
    return <FlowChart key="d" points={points} now={ctx.age > steps[8].age + 9 ? -1 : found} caption="대운 흐름 그래프. 점을 고르면 설명이 나와요" />;
  }
  const points: FlowPoint[] = monthLuck(ctx.saju, ctx.a, ctx.today).map((x) => ({ key: `${x.year}-${x.month}`, label: `${x.month}월`, score: x.score, title: `${x.year}년 ${x.month}월 ${ganjiName(x.pillar)}월`, detail: gradeOf(x.score).line }));
  return <FlowChart key="m" points={points} now={0} caption="앞으로 열두 달 흐름 그래프. 점을 고르면 설명이 나와요" />;
}

function Relationship({ insight: n, sample }: { insight: ReturnType<typeof relationshipInsight>; sample: boolean }) {
  return (
    <section aria-labelledby="rel-title" className="fx-panel relative overflow-hidden border-[#8b7dcc]!" data-relationship>
      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[304px_1fr]">
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 lg:flex lg:flex-col lg:items-start">
          <div>
          <h2 id="rel-title" className="fx-h2">나와 잘 맞는 사람은?</h2>
          <p className="fx-body mt-3">어떤 사람과 편안한지, 어디에서 어떻게 만나면 좋을지 힌트를 모았어요.{sample && " 지금은 예시 사주 기준이에요."}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fortune/mascot-heart.webp" alt="" loading="lazy" width={520} height={520} className="w-[96px] flex-none sm:w-[120px] lg:mt-4 lg:-ml-4 lg:w-[176px]" />
        </div>
        <div className="contents">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <Fact title="잘 맞는 성향"><ul className="m-0 list-disc pl-5">{n.compatibleTraits.map((t) => <li key={t}>{t}</li>)}</ul></Fact>
            <Fact title="관계가 깊어지는 팁">{n.communicationStyle} {n.frictionPoints.join(", ")}는 잠깐 멈춰 보세요.</Fact>
            <Fact title="연애·결혼">{n.romance}</Fact>
            <Fact title="친구·동료">{n.friendshipWork}</Fact>
          </div>
          <div className="fx-paper grid gap-6 sm:grid-cols-2 lg:col-span-2">
            <div>
              <h3 className="fx-h3">어디에서 만날까</h3>
              <ul className="m-0 mt-2 list-disc pl-5 text-[15px] leading-[1.8] text-[#463e66]">{n.meetingContexts.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
            <div>
              <h3 className="fx-h3">어떻게 시작할까</h3>
              <ul className="m-0 mt-2 list-disc pl-5 text-[15px] leading-[1.8] text-[#463e66]">{n.practicalActions.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          </div>
          <p className="m-0 text-[13px] leading-[1.7] text-lilac lg:col-span-2">{n.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}

function Fact({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="fx-h3 text-[#f7e8bd]">{title}</h3>
      <div className="fx-body mt-2 text-[15px]!">{children}</div>
    </div>
  );
}

type AskId = QuestionId | "free";

function Ask({ ctx, sample, today }: { ctx: Ctx; sample: boolean; today: Ymd }) {
  const [id, setId] = useState<AskId | null>(null);
  const [other, setOther] = useState(0);
  const [partner, setPartner] = useState<Saju | null>(null);
  const [matchMode, setMatchMode] = useState<"birth" | "animal">("birth");
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  // 궁합을 생년월일로 보려는데 아직 상대를 넣지 않았으면 답 대신 입력부터 받는다
  const waiting = id === "match" && matchMode === "birth" && !partner;
  const a = id && id !== "free" && !waiting ? answer(id, ctx, other, id === "match" && matchMode === "birth" ? partner : null) : null;

  const open = (next: AskId, question = "") => {
    setId(next);
    setAsked(question);
    setNote(null);
    requestAnimationFrame(() => boxRef.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = q.trim();
    if (!text) return setNote("궁금한 것을 한 줄로 적거나 아래 주제를 골라 주세요.");
    const blocked = blockedQuestion(text);
    if (blocked) { setId(null); return setNote(blocked); }
    // 정해진 주제에 없는 질문은 AI 상담가가 사주 전체를 보고 답한다
    open(routeQuestion(text) ?? "free", text);
  };

  const pillars = { year: ctx.saju.year, month: ctx.saju.month, day: ctx.saju.day, hour: ctx.saju.hour };
  const pKey = partner ? `${partner.year}-${partner.month}-${partner.day}-${partner.hour}` : "none";
  const usePartner = (id === "match" || id === "free") && matchMode === "birth";
  const aiBody = id && { kind: "saju", questionId: id, other, pillars, partner: usePartner && partner ? { year: partner.year, month: partner.month, day: partner.day, hour: partner.hour } : null, question: asked.slice(0, 200) };

  return (
    <section aria-labelledby="ask-title" className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div className="pb-4">
          <h2 id="ask-title" className="fx-h2">방구석게이머에게 직접 묻기</h2>
          <p className="fx-body mt-2">무엇이든 물어보세요. 내 사주 계산 결과로 먼저 답하고, AI 상담가와 이어서 대화할 수 있어요.</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fortune/mascot-ask.webp" alt="" loading="lazy" width={520} height={520} className="hidden w-[150px] flex-none sm:block" />
      </div>
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="saju-q" className="sr-only">질문</label>
        <input id="saju-q" className="fx-input" maxLength={120} autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} placeholder="예) 내년에 이직해도 괜찮을까?" />
        <button type="submit" className="fx-btn fx-btn-main flex-none">질문하기</button>
      </form>
      {note && <p role="alert" className="m-0 mt-3 rounded-[10px] bg-[#4a2036] px-4 py-3 text-[14.5px] leading-[1.6] text-[#ffd7dd]">{note}</p>}
      <div className="fx-tiles mt-4">
        {QUESTIONS.map((x) => (
          <button key={x.id} type="button" className="fx-tile" aria-pressed={id === x.id} onClick={() => open(x.id)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/fortune/icons/${x.id}.webp`} alt="" loading="lazy" width={120} height={120} />
            <span><strong>{x.label}</strong><span>{x.hint}</span></span>
          </button>
        ))}
      </div>
      <div ref={boxRef} aria-live="polite" style={{ scrollMarginBottom: 24 }}>
        {id === "free" && (
          <div key={`free-${asked}-${pKey}`} className="fx-paper fx-reading mt-4" data-answer="free">
            <h3 className="fx-h3">“{asked}”</h3>
            <p className="m-0 mt-3 text-[15.5px] leading-[1.8] break-keep">정해진 열두 주제에 딱 맞지 않는 질문이라, AI 상담가가 내 사주 전체(글자, 오행, 올해·내년 흐름, 좋은 달)를 보고 답해 드려요.</p>
            {sample ? <SampleNote /> : <AiReading body={aiBody!} />}
          </div>
        )}
        {waiting && (
          <div className="fx-paper fx-reading mt-4" data-answer="match">
            <h3 className="fx-h3">두 사람의 사주 궁합</h3>
            <p className="m-0 mt-2 text-[15.5px] leading-[1.8] break-keep">상대의 생년월일과 태어난 시각을 넣으면 두 사람의 여덟 글자를 견주어 봐요. 생일을 모르면 ‘띠로만’을 골라 주세요.</p>
            <PartnerPicker today={today} mode={matchMode} setMode={setMatchMode} other={other} setOther={setOther} partner={partner} setPartner={setPartner} />
          </div>
        )}
        {a && id && id !== "free" && (
          <div key={`${id}${other}${id === "match" ? `${matchMode}${pKey}` : ""}`} className="fx-paper fx-reading mt-4" data-answer={id}>
            <h3 className="fx-h3">{a.title}</h3>
            {sample && <p className="m-0 mt-1 text-[13.5px] font-bold text-[#4e43a0]!">예시 사주로 본 답이에요. 생년월일을 넣으면 내 답으로 바뀌어요.</p>}
            {id === "match" && <PartnerPicker today={today} mode={matchMode} setMode={setMatchMode} other={other} setOther={setOther} partner={partner} setPartner={setPartner} />}
            <p className="m-0 mt-3 text-[17px] font-bold leading-[1.7] text-[#1b1530]! break-keep">{a.summary}</p>
            <h4 className="fx-h3 mt-5 text-[15px]!">왜 그렇게 보나요?</h4>
            <p className="m-0 mt-1 text-[15.5px] leading-[1.8] break-keep">{a.why}</p>
            <h4 className="fx-h3 mt-5 text-[15px]!">이렇게 해 보세요</h4>
            <ul className="m-0 mt-1 list-disc pl-5 text-[15.5px] leading-[1.8] text-[#1b1530]">{a.actions.map((l) => <li key={l}>{l}</li>)}</ul>
            <p className="m-0 mt-4 text-[13px] leading-[1.6] text-[#5c5578]!">근거: {a.basis}{a.note ? `. ${a.note}` : ""}</p>
            {sample ? <SampleNote /> : <AiReading body={aiBody!} />}
          </div>
        )}
      </div>
    </section>
  );
}

function SampleNote() {
  return <p className="m-0 mt-4 rounded-[10px] bg-[#eeeaf6] px-4 py-3 text-[14px] leading-[1.6] text-[#463e66]">AI 상담은 내 생년월일을 넣은 뒤에 받을 수 있어요. 위의 ‘사주 펼쳐 보기’에 먼저 입력해 주세요.</p>;
}

type DateFields = { y: string; m: string; d: string };

/** 입력한 날짜를 양력으로 바꾼다. 문제가 있으면 안내 문구를 돌려준다 */
function readDate(f: DateFields, cal: "solar" | "lunar", leap: boolean, today: Ymd): Ymd | string {
  if (!f.y || !f.m || !f.d) return "태어난 연·월·일을 모두 숫자로 적어 주세요.";
  let date: Ymd = { y: Number(f.y), m: Number(f.m), d: Number(f.d) };
  if (date.y < 1920 || date.y > today.y) return `연도는 1920부터 ${today.y} 사이로 적어 주세요.`;
  if (date.m < 1 || date.m > 12) return "월은 1부터 12 사이로 적어 주세요.";
  if (cal === "lunar") {
    const s = lunarToSolar(date.y, date.m, date.d, leap);
    if (!s) return leap ? "그해에는 입력한 윤달 날짜가 없어요. 윤달 표시를 확인해 주세요." : "그달에는 없는 음력 날짜예요.";
    date = s;
  } else if (date.d < 1 || date.d > daysInMonth(date.y, date.m)) return "그달에는 없는 날짜예요.";
  if (Date.UTC(date.y, date.m - 1, date.d) > Date.UTC(today.y, today.m - 1, today.d)) return "오늘보다 뒤의 날짜예요.";
  return date;
}

/** 궁합 상대: 띠만 고르거나, 생년월일(시각)까지 넣어 사주로 본다. 상대 생일은 이 화면에서만 계산하고 보내지 않는다 */
function PartnerPicker({ today, mode, setMode, other, setOther, partner, setPartner }: { today: Ymd; mode: "birth" | "animal"; setMode: (m: "birth" | "animal") => void; other: number; setOther: (n: number) => void; partner: Saju | null; setPartner: (s: Saju | null) => void }) {
  const [cal, setCal] = useState<"solar" | "lunar">("solar");
  const [leap, setLeap] = useState(false);
  const [f, setF] = useState({ y: "", m: "", d: "", time: "" });
  const [noTime, setNoTime] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const num = (k: "y" | "m" | "d") => (e: { target: { value: string } }) => { setF((p) => ({ ...p, [k]: e.target.value.replace(/\D/g, "") })); setErr(null); };

  const apply = (e: FormEvent) => {
    e.preventDefault();
    const date = readDate(f, cal, leap, today);
    if (typeof date === "string") return setErr(date);
    if (!noTime && !f.time) return setErr("상대가 태어난 시각을 넣거나 ‘시각 모름’을 골라 주세요.");
    setPartner(sajuOf({ ...date, time: noTime ? null : f.time }));
  };

  return (
    <div className="mt-3 rounded-[12px] border border-[#d8d2ea] bg-[#f8f7fc] p-4" data-partner>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-[14.5px] font-bold text-[#1b1530]">상대 정보</p>
        <div className="fx-seg" role="group" aria-label="궁합 보는 방법">
          <button type="button" aria-pressed={mode === "birth"} onClick={() => setMode("birth")}>생년월일로</button>
          <button type="button" aria-pressed={mode === "animal"} onClick={() => setMode("animal")}>띠로만</button>
        </div>
      </div>
      {mode === "animal" ? (
        <div className="fx-field mt-3 max-w-[260px]">
          <label htmlFor="other" className="text-[#463e66]!">상대의 띠</label>
          <select id="other" className="fx-input" value={other} onChange={(e) => setOther(Number(e.target.value))}>{ANIMALS.map((n, i) => <option key={n} value={i}>{n}띠</option>)}</select>
        </div>
      ) : (
        <form noValidate onSubmit={apply} className="mt-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="fx-seg" role="group" aria-label="상대 생일 달력 종류">
              {(["solar", "lunar"] as const).map((c) => <button key={c} type="button" aria-pressed={cal === c} onClick={() => { setCal(c); setLeap(false); setErr(null); }}>{c === "solar" ? "양력" : "음력"}</button>)}
            </div>
            {cal === "lunar" && <label className="fx-check text-[#463e66]!"><input type="checkbox" checked={leap} onChange={(e) => setLeap(e.target.checked)} />윤달</label>}
          </div>
          <div className="mt-3 grid grid-cols-6 gap-3 md:grid-cols-[1.2fr_1fr_1fr_1.5fr_auto] md:items-end">
            <div className="fx-field col-span-2 md:col-span-1"><label htmlFor="py" className="text-[#463e66]!">해</label><input id="py" className="fx-input" inputMode="numeric" maxLength={4} autoComplete="off" placeholder="1990" value={f.y} onChange={num("y")} /></div>
            <div className="fx-field col-span-2 md:col-span-1"><label htmlFor="pm" className="text-[#463e66]!">월</label><input id="pm" className="fx-input" inputMode="numeric" maxLength={2} autoComplete="off" placeholder="5" value={f.m} onChange={num("m")} /></div>
            <div className="fx-field col-span-2 md:col-span-1"><label htmlFor="pd" className="text-[#463e66]!">일</label><input id="pd" className="fx-input" inputMode="numeric" maxLength={2} autoComplete="off" placeholder="21" value={f.d} onChange={num("d")} /></div>
            <div className="fx-field col-span-6 md:col-span-1"><label htmlFor="pt" className="text-[#463e66]!">태어난 시각</label><input id="pt" type="time" className="fx-input" value={f.time} disabled={noTime} onChange={(e) => { setF((p) => ({ ...p, time: e.target.value })); setErr(null); }} /></div>
            <button type="submit" className="fx-btn fx-btn-main col-span-6 md:col-span-1">{partner ? "다시 보기" : "궁합 보기"}</button>
          </div>
          <label className="fx-check mt-1 text-[#463e66]!"><input type="checkbox" checked={noTime} onChange={(e) => { setNoTime(e.target.checked); setErr(null); }} />시각 모름</label>
          <p className="m-0 text-[12.5px] leading-[1.6] text-[#5c5578]">상대 생일은 이 화면에서만 사주 글자로 바꾸고, 생일 자체는 어디에도 보내거나 저장하지 않아요. 상대의 동의를 받고 넣어 주세요.</p>
          {err && <p role="alert" className="m-0 mt-2 rounded-[10px] bg-[#4a2036] px-4 py-3 text-[14.5px] text-[#ffd7dd]">{err}</p>}
          {partner && <p className="m-0 mt-2 text-[14px] text-[#1b1530]">상대 사주: {[partner.year, partner.month, partner.day, ...(partner.hour === null ? [] : [partner.hour])].map(ganjiName).join(" ")}{partner.hour === null ? " (시 모름)" : ""}</p>}
        </form>
      )}
    </div>
  );
}

function BirthForm({ today, onSubmit }: { today: Ymd; onSubmit: (b: Birth) => void }) {
  const [cal, setCal] = useState<"solar" | "lunar">("solar");
  const [leap, setLeap] = useState(false);
  const [f, setF] = useState({ y: "", m: "", d: "", time: "", gender: "" });
  const [noTime, setNoTime] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setF((p) => ({ ...p, [k]: e.target.value })); setErr(null); };
  const num = (k: "y" | "m" | "d") => (e: { target: { value: string } }) => set(k)({ target: { value: e.target.value.replace(/\D/g, "") } });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const missing = !f.y ? "by" : !f.m ? "bm" : !f.d ? "bd" : null;
    if (missing) { document.getElementById(missing)?.focus(); return setErr("태어난 연·월·일을 모두 숫자로 적어 주세요."); }
    if (!noTime && !f.time) { document.getElementById("bt")?.focus(); return setErr("태어난 시각을 넣거나 ‘시각 모름’을 골라 주세요."); }
    const date = readDate(f, cal, leap, today);
    if (typeof date === "string") return setErr(date);
    onSubmit({ ...date, time: noTime ? null : f.time, gender: f.gender === "M" || f.gender === "F" ? f.gender : null });
  };

  return (
    <form id="saju-form" noValidate onSubmit={submit} className="fx-panel mt-6 border-[#8b7dcc]!" style={{ scrollMarginTop: 92 }} aria-labelledby="form-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="form-title" className="fx-h2">사주 펼쳐 보기</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="fx-seg" role="group" aria-label="달력 종류">
            {(["solar", "lunar"] as const).map((c) => <button key={c} type="button" aria-pressed={cal === c} onClick={() => { setCal(c); setLeap(false); setErr(null); }}>{c === "solar" ? "양력" : "음력"}</button>)}
          </div>
          {cal === "lunar" && <label className="fx-check"><input type="checkbox" checked={leap} onChange={(e) => { setLeap(e.target.checked); setErr(null); }} />윤달</label>}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-6 gap-3 md:grid-cols-[1.2fr_1fr_1fr_1.5fr_1.2fr_auto] md:items-end">
        <div className="fx-field col-span-2 md:col-span-1"><label htmlFor="by">태어난 해</label><input id="by" className="fx-input" inputMode="numeric" maxLength={4} autoComplete="off" placeholder="1990" value={f.y} onChange={num("y")} /></div>
        <div className="fx-field col-span-2 md:col-span-1"><label htmlFor="bm">월</label><input id="bm" className="fx-input" inputMode="numeric" maxLength={2} autoComplete="off" placeholder="5" value={f.m} onChange={num("m")} /></div>
        <div className="fx-field col-span-2 md:col-span-1"><label htmlFor="bd">일</label><input id="bd" className="fx-input" inputMode="numeric" maxLength={2} autoComplete="off" placeholder="21" value={f.d} onChange={num("d")} /></div>
        <div className="fx-field col-span-3 md:col-span-1"><label htmlFor="bt">태어난 시각</label><input id="bt" type="time" className="fx-input" value={f.time} disabled={noTime} onChange={set("time")} /></div>
        <div className="fx-field col-span-3 md:col-span-1"><label htmlFor="bg">성별</label><select id="bg" className="fx-input" value={f.gender} onChange={set("gender")}><option value="">선택 안 함</option><option value="F">여성</option><option value="M">남성</option></select></div>
        <button type="submit" className="fx-btn fx-btn-main col-span-6 md:col-span-1">분석 시작</button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6">
        <label className="fx-check"><input type="checkbox" checked={noTime} onChange={(e) => { setNoTime(e.target.checked); setErr(null); }} />시각 모름</label>
        <p className="m-0 text-[13px] text-lilac">성별은 대운 방향을 정할 때만 써요. 서울에서 태어난 것으로 계산해요.</p>
      </div>
      {err && <p role="alert" className="m-0 mt-2 rounded-[10px] bg-[#4a2036] px-4 py-3 text-[14.5px] text-[#ffd7dd]">{err}</p>}
    </form>
  );
}
