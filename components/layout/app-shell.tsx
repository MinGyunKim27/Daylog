'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { TopBar } from './top-bar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">

      {/* 상단 바 — 햄버거 + 페이지 타이틀 */}
      <TopBar onToggle={() => setOpen((v) => !v)} />

      {/* 사이드바 오버레이 배경 */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 사이드바 슬라이드 */}
      <div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* 메인 콘텐츠 — 상단 바 높이(h-14=56px)만큼 pt 확보 */}
      <div className="pt-14 w-full">
        {children}
      </div>

      {/* 모바일 하단 네비 */}
      <Navbar />
    </div>
  )
}
