import { DISCLAIMER } from "@/data/fortune/saju-text";

export function Notice() {
  return (
    <p className="fx-wrap mt-14 text-center text-[13.5px] leading-[1.8] text-lilac">
      {DISCLAIMER}
      <br />
      생년월일은 이 브라우저 안에서만 쓰여요. ‘AI에게 더 자세히 듣기’를 누를 때만 카드 이름·사주 글자와 질문이 Claude(AI)로 전송되고, 저장하지 않아요.
    </p>
  );
}
