import localFont from "next/font/local";

export const galmuri = localFont({
  src: [
    { path: "./Galmuri11.woff2", weight: "400", style: "normal" },
    { path: "./Galmuri11-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-galmuri",
  display: "swap",
});
