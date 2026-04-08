import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ProgressBar } from '@/components/layout/progress-bar'

export const metadata: Metadata = {
  title: 'Daylog | 개인 생활 데이터 트래커',
  description: '지출, 수면, 운동, 기분, 식단을 기록하고 패턴을 확인하세요.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0b1220',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
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
      <body className="antialiased min-h-screen bg-[hsl(var(--background))] font-pretendard">
        <ProgressBar />
        {children}
      </body>
    </html>
  )
}
