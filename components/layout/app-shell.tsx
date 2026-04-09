'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { TopBar } from './top-bar'

export function AppShell({ children }: { children: React.ReactNode }) {
  // 데스크탑: 사이드바 확장/축소
  const [expanded, setExpanded] = useState(true)
  // 모바일: 오버레이 열기/닫기
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <TopBar
        onToggle={() => {
          // 모바일이면 오버레이, 데스크탑이면 확장/축소
          if (window.innerWidth < 768) {
            setMobileOpen((prev) => !prev)
          } else {
            setExpanded((prev) => !prev)
          }
        }}
      />

      {/* 모바일 오버레이 딤 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 모바일 오버레이 사이드바 */}
      <div
        className={`fixed inset-y-0 left-0 z-40 md:hidden transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar expanded={true} onClose={() => setMobileOpen(false)} />
      </div>

      {/* 데스크탑 고정 사이드바 */}
      <div
        className={`hidden md:flex fixed inset-y-0 left-0 z-30 pt-14 transition-all duration-300 ease-in-out ${
          expanded ? 'w-56' : 'w-16'
        }`}
      >
        <Sidebar expanded={expanded} />
      </div>

      {/* 메인 컨텐츠 */}
      <div
        className={`pt-14 transition-all duration-300 ease-in-out ${
          expanded ? 'md:ml-56' : 'md:ml-16'
        }`}
      >
        {children}
      </div>

      <Navbar />
    </div>
  )
}
