import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "앱 제안·문의 // 방구석게이머",
  description: "프로젝트 제안, 교육 협력 및 파트너십 문의",
};

export default function ContactPage() {
  return (
    <main className="flex-grow flex flex-col items-center px-6 pb-12 lg:px-8 pt-28">
      <div className="w-full max-w-5xl stagger stagger-2">
        <div className="mb-10">
          <PageHero
            label="SEND MESSAGE · PLAYER 2 입장 대기 중"
            title="앱 제안·문의"
            desc="“이런 게임 있으면 좋겠어요”, 버그 제보, 연수·협업 문의 모두 환영해요. 남겨 주시면 빠르게 답장드릴게요."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <section className="lg:col-span-5 space-y-8 py-2">
            <div>
              <h2 className="font-[family-name:var(--font-headline)] text-3xl md:text-4xl font-bold text-on-surface mb-3 tracking-tight leading-none">
                방구석게이머
              </h2>
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="h-[1px] w-8 bg-primary"
                />
                <p className="font-[family-name:var(--font-label)] text-sm text-primary tracking-[0.2em] uppercase m-0">
                  PLAYER 1 · 초등교사
                </p>
              </div>
            </div>

            <p className="font-[family-name:var(--font-body)] text-on-surface-variant text-sm leading-relaxed max-w-md">
              수업에 쓰고 싶은 게임 아이디어, 써 보신 앱의 불편한 점,
              연수·협업 제안을 남겨 주세요. 방구석에서 하나씩 만들어 갈게요.
            </p>

            <ul className="space-y-4">
              <li className="flex items-center gap-5">
                <div
                  aria-hidden="true"
                  className="w-10 h-10 flex items-center justify-center bg-surface-container-high text-primary text-lg"
                >
                  @
                </div>
                <div>
                  <div className="text-[10px] text-on-surface-variant tracking-widest uppercase mb-0.5">
                    E-MAIL
                  </div>
                  <a
                    href="mailto:sunhak98@naver.com"
                    className="font-[family-name:var(--font-label)] text-sm tracking-wider text-on-surface hover:text-primary transition-colors"
                  >
                    sunhak98@naver.com
                  </a>
                </div>
              </li>
            </ul>
          </section>

          <section className="lg:col-span-7">
            <div className="bg-white rounded-[14px] border border-outline-variant p-6 md:p-8 relative overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 w-full h-[4px] bg-mint"
              />
              <ContactForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
