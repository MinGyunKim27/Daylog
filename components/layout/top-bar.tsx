'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, { label: string; sub: string }> = {
  '/dashboard': { label: '대시보드', sub: '오늘 요약' },
  '/log': { label: '기록하기', sub: '지출/수면/운동/기분/식단' },
  '/insights': { label: '인사이트', sub: '자동 분석' },
  '/settings': { label: '설정', sub: '신체 프로필' },
}

interface Props {
  onToggle: () => void
}

export function TopBar({ onToggle }: Props) {
  const pathname = usePathname()
  const page = PAGE_TITLES[pathname] ?? { label: 'Daylog', sub: '' }

  return (
    <header className="fixed top-0 left-0 right-0 z-20 h-14 flex items-center gap-3 px-4 border-b border-[hsl(var(--border))] bg-[hsl(222.2,84%,4.9%)]/90 backdrop-blur-md">
      <button
        onClick={onToggle}
        className="p-2 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-all shrink-0"
        aria-label="메뉴 열기"
      >
        <Menu size={20} />
      </button>
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-[hsl(var(--foreground))]">{page.label}</span>
        {page.sub ? <span className="text-xs text-[hsl(var(--muted-foreground))] hidden sm:inline">{page.sub}</span> : null}
      </div>
    </header>
  )
}
