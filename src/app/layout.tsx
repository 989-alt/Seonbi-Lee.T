import type { Metadata } from "next";
import { connection } from "next/server";
import { Space_Grotesk, Manrope, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { HideOnHome } from "@/components/layout/HideOnHome";
import { galmuri } from "@/fonts/galmuri";
import { SITE_NAME, SITE_URL } from "@/lib/site";

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

const DESCRIPTION = "초등교사 방구석게이머가 만든 교실 게임과 업무 도구를 바로 실행하는 런처";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "방구석게이머 // 교실 런처",
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    url: "/",
    title: "방구석게이머 // 교실 런처",
    description: DESCRIPTION,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "모니터 앞에 앉은 방구석게이머 캐릭터" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "방구석게이머 // 교실 런처",
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // CSP nonce는 요청마다 달라서 모든 페이지를 요청 시점에 렌더해야 한다
  await connection();
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
