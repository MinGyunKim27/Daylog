'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, PenLine, Lightbulb, Settings, LogOut, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const nav = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/log', label: '기록하기', icon: PenLine },
  { href: '/insights', label: '인사이트', icon: Lightbulb },
  { href: '/settings', label: '설정', icon: Settings },
]

interface Props {
  expanded: boolean
  onClose?: () => void
}

export function Sidebar({ expanded, onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r border-[hsl(var(--border))] bg-[hsl(217.2,32.6%,7%)] transition-all duration-300 ease-in-out overflow-hidden',
        expanded ? 'w-56' : 'w-16'
      )}
    >
      {/* 모바일 닫기 버튼 */}
      {onClose && (
        <div className="flex items-center justify-end px-3 py-3 border-b border-[hsl(var(--border))]">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-all"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <nav className="flex-1 px-2 py-3 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                expanded ? 'justify-start' : 'justify-center',
                active
                  ? 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
              )}
              title={!expanded ? label : undefined}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className="shrink-0" />
              {expanded && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={cn('px-2 py-3 pb-20 md:pb-3 border-t border-[hsl(var(--border))]')}>
        <button
          onClick={handleSignOut}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-red-400 transition-all',
            !expanded && 'justify-center'
          )}
          title={!expanded ? '로그아웃' : undefined}
        >
          <LogOut size={20} className="shrink-0" />
          {expanded && <span>로그아웃</span>}
        </button>
      </div>
    </aside>
  )
}
