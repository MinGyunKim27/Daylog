import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { ProfileForm } from '@/components/settings/profile-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12">
        <div className="px-6 py-6 w-full max-w-2xl mx-auto space-y-5">
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
            <h2 className="text-lg font-bold">신체 프로필</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              운동 칼로리 계산과 식단 권장 섭취량 계산에 사용됩니다.
            </p>
          </div>
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
            <ProfileForm />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
