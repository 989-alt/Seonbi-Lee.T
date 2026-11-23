import type { TarotCard } from "@/data/fortune/tarot-cards";

/** 카드 앞면. 그림에는 글자가 없고 번호와 이름은 여기서 쓴다 */
export function CardFace({ card, reversed }: { card: TarotCard; reversed: boolean }) {
  return (
    <span className="fx-face" data-rev={reversed}>
      <span className="fx-face-in">
        <span className="fx-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.front} alt="" draggable={false} />
        </span>
        <span className="fx-name">
          {card.group === "major" && <i>{card.numberOrRank}</i>}
          {card.nameKo}
        </span>
      </span>
    </span>
  );
}
