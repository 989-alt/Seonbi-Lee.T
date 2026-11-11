import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { HideOnHome } from "@/components/layout/HideOnHome";
import { galmuri } from "@/fonts/galmuri";

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
  title: "방구석게이머 // 교실 런처",
  description:
    "초등교사 방구석게이머가 만든 교실 게임과 업무 도구를 바로 실행하는 런처",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${notoSansKR.variable} ${galmuri.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <HideOnHome><TopNav /></HideOnHome>
        {children}
        <HideOnHome><Footer /></HideOnHome>
      </body>
    </html>
  );
}
