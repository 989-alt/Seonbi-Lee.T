import { SPREADS, TOPICS, type Reading, type SpreadId, type TopicId } from "@/lib/fortune/tarot/reading";
import { AiReading } from "./AiReading";
import { CardFace } from "./CardFace";

type Props = {
  reading: Reading;
  topic: TopicId;
  question: string;
  current: SpreadId;
  onAgain: () => void;
  onNewQuestion: () => void;
  onSpread: (id: SpreadId) => void;
};

const TONE_LABEL = ["조심", "지켜보기", "순조로움"];

export function TarotResult({ reading, topic, question, current, onAgain, onNewQuestion, onSpread }: Props) {
  const label = TOPICS.find((t) => t.id === topic)!.label;
  const few = reading.positions.length <= 3;
  return (
    <section aria-labelledby="result-title" className="mt-12" data-tarot-result>
      <h2 id="result-title" tabIndex={-1} className="fx-h2">{label} 리딩</h2>
      {question && <p className="fx-body mt-2">“{question}”</p>}

      <div className="fx-paper fx-reading mt-6" data-verdict>
        <h3 className="fx-h3">결론부터 말하면</h3>
        <p className="m-0 mt-2 text-[19px] font-bold leading-[1.6]">{reading.verdict}</p>
        {reading.flow.map((s) => <p key={s} className="m-0 mt-2 text-[15.5px] leading-[1.75]">{s}</p>)}
        <h3 className="fx-h3 mt-6">그래서 이렇게 해 보세요</h3>
        <ol className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
          {reading.actions.map((a) => (
            <li key={a.label} className="grid gap-x-4 text-[15.5px] leading-[1.7] sm:grid-cols-[9.5em_1fr]">
              <strong className="text-[#1f7a45]">{a.label}</strong>
              <span className="text-[#1b1530]">{a.text}</span>
            </li>
          ))}
        </ol>
        <AiReading body={{ kind: "tarot", topic, spread: current, cards: reading.positions.map((p) => ({ id: p.card.id, reversed: p.reversed })), question }} />
      </div>

      <h3 className="fx-h3 mt-10">카드별 풀이</h3>
      <div className={`mt-4 grid gap-5 ${few ? "lg:grid-cols-3" : "md:grid-cols-2"} ${reading.positions.length === 1 ? "lg:grid-cols-1" : ""}`}>
        {reading.positions.map((p, i) => (
          <article key={p.card.id} className="fx-panel fx-reading" style={{ "--i": i + 1 } as React.CSSProperties} data-result-card={p.card.id}>
            <div className="flex gap-4">
              <div className="relative aspect-[7/12] w-[92px] flex-none self-start overflow-hidden rounded-[10px] sm:w-[108px]">
                <CardFace card={p.card} reversed={p.reversed} />
              </div>
              <div className="min-w-0">
                <h4 className="fx-h3 m-0">
                  <span className="text-mint">{p.position}</span> {p.card.nameKo}
                </h4>
                <p className="m-0 mt-1 text-[13.5px] text-[#e8c77a]">{p.reversed ? "역방향" : "정방향"}, {p.card.keywords}</p>
                <p className="m-0 mt-2 inline-flex min-h-[26px] items-center rounded-full border border-[#8b7dcc] px-3 text-[13px] text-[#f3f1f8]">흐름: {TONE_LABEL[p.tone + 1]}</p>
                <p className="fx-body mt-3 text-[14px]!">{p.frame}</p>
              </div>
            </div>
            <dl className="m-0 mt-4 flex flex-col gap-3 text-[15px] leading-[1.75]">
              <div>
                <dt className="font-bold text-[#f7e8bd]">카드의 뜻</dt>
                <dd className="m-0 text-[#e4dff4]">{p.meaning}{p.topicLine && ` ${p.topicLine}`}</dd>
              </div>
              <div>
                <dt className="font-bold text-mint">해 볼 일</dt>
                <dd className="m-0 text-[#e4dff4]">{p.action}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {reading.notes.length > 0 && (
        <div className="mt-6">
          <h3 className="fx-h3">카드 구성에서 보이는 것</h3>
          <ul className="m-0 mt-2 list-disc pl-5">{reading.notes.map((s) => <li key={s} className="fx-body">{s}</li>)}</ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="fx-btn fx-btn-main" onClick={onAgain}>다시 뽑기</button>
        <button type="button" className="fx-btn fx-btn-line" onClick={onNewQuestion}>질문 바꾸기</button>
        {SPREADS.filter((s) => s.id !== current).map((s) => (
          <button key={s.id} type="button" className="fx-btn fx-btn-line" onClick={() => onSpread(s.id)}>{s.name} 배열로 보기</button>
        ))}
      </div>
    </section>
  );
}
