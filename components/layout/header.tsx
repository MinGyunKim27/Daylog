'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex items-center justify-between px-4 pt-6 pb-4">
      <div>
        <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{subtitle}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        title="로그아웃"
      >
        <LogOut size={18} />
      </Button>
    </header>
  )
}
