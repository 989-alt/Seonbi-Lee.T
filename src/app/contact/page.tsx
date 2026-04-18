import { ContactForm } from "@/components/contact/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "연락 // SEONBI'S LAB",
  description: "프로젝트 제안, 교육 협력 및 파트너십 문의",
};

export default function ContactPage() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center p-6 lg:p-8 pt-28">
      <div className="w-full max-w-5xl stagger stagger-2">
        <div className="mb-8 flex items-center gap-4">
          <div
            aria-hidden="true"
            className="h-px flex-grow bg-gradient-to-r from-transparent via-outline/20 to-transparent"
          />
          <div className="font-[family-name:var(--font-label)] text-[10px] text-primary/80 tracking-[0.3em] bg-surface/50 px-4 py-1.5 uppercase">
            STATUS: CONTACT LINE
          </div>
          <div
            aria-hidden="true"
            className="h-px flex-grow bg-gradient-to-r from-transparent via-outline/20 to-transparent"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <section className="lg:col-span-5 space-y-8 py-2">
            <div>
              <h1 className="font-[family-name:var(--font-headline)] text-4xl md:text-5xl font-bold text-on-surface mb-3 tracking-tight uppercase leading-none">
                선비이선생
              </h1>
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="h-[1px] w-8 bg-primary"
                />
                <h2 className="font-[family-name:var(--font-label)] text-sm text-primary tracking-[0.3em] uppercase">
                  Contact Protocol
                </h2>
              </div>
            </div>

            <p className="font-[family-name:var(--font-body)] text-on-surface-variant text-sm leading-relaxed max-w-md">
              프로젝트 제안, 교육 협력 및 파트너십 논의를 위한 연락망입니다.
              문의 사항을 남겨주시면 신속히 회신해 드립니다.
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
            <div className="bg-surface-container-low p-6 md:p-8 relative overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 w-[2px] h-full bg-primary"
              />
              <ContactForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
