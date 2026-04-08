'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { TopBar } from './top-bar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <TopBar onToggle={() => setOpen((prev) => !prev)} />

      {open ? <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} /> : null}

      <div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      <div className="pt-14 w-full">{children}</div>
      <Navbar />
    </div>
  )
}
