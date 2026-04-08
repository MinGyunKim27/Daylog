import type { Metadata, Viewport } from "next";
import "./globals.css";

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
      <body className="antialiased min-h-screen bg-[hsl(222.2,84%,4.9%)]">
        {children}
      </body>
    </html>
  );
}
