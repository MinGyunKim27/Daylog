'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'

interface Props {
  onToggle: () => void
}

export function TopBar({ onToggle }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center gap-3 px-4 border-b border-[hsl(var(--border))] bg-[hsl(222.2,84%,4.9%)]/95 backdrop-blur-md">
      {/* 햄버거 */}
      <button
        onClick={onToggle}
        className="p-2 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-all shrink-0"
        aria-label="메뉴 열기"
      >
        <Menu size={20} />
      </button>

      {/* 로고 → 홈 */}
      <Link href="/dashboard" className="flex items-center gap-2 group" aria-label="홈으로">
        <span
          className="w-7 h-7 rounded-xl flex items-center justify-center text-[13px] font-black text-white shadow-md group-hover:scale-105 transition-transform"
          style={{ background: 'linear-gradient(135deg, #818CF8 0%, #38BDF8 100%)' }}
        >
          D
        </span>
        <span
          className="text-base font-bold tracking-tight group-hover:opacity-80 transition-opacity"
          style={{
            background: 'linear-gradient(90deg, #818CF8, #38BDF8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Daylog
        </span>
      </Link>
    </header>
  )
}
