import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ProgressBar } from "@/components/layout/progress-bar";

export const metadata: Metadata = {
  title: "Daylog — 나의 하루 기록",
  description: "지출, 수면, 운동, 기분, 식단을 한 곳에서 트래킹하세요",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f1629",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[hsl(222.2,84%,4.9%)] font-pretendard">
        <ProgressBar />
        {children}
      </body>
    </html>
  );
}
