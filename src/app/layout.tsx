import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { ShutterLoader } from "@/components/layout/ShutterLoader";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SEONBI'S LAB // 선비이선생",
  description:
    "AI를 활용해 수업과 학급 운영에 도움이 되는 프로그램을 만드는 교사 이선학의 작업 아카이브",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${notoSansKR.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <ShutterLoader />
        <TopNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
