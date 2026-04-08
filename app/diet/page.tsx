import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import { DietCalorieChart } from '@/components/details/diet-calorie-chart'
import { getRecommendedCalories } from '@/lib/health'
import { DietLog, Profile } from '@/types'
import { formatDate, getDietTotalCalories, getLast30Days } from '@/lib/utils'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  )
}

export default async function DietPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [dietResult, profileResult] = await Promise.all([
    supabase.from('diet_logs').select('*').eq('user_id', user.id).gte('date', getLast30Days()[0]).order('date', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
  ])

  const dietLogs = (dietResult.data as DietLog[]) ?? []
  const profile = (profileResult.data as Profile | null) ?? null
  const averageCalories = dietLogs.length ? Math.round(dietLogs.reduce((sum, log) => sum + getDietTotalCalories(log), 0) / dietLogs.length) : 0
  const recommendedCalories = getRecommendedCalories(profile)
  const photoCount = dietLogs.filter((log) => !!log.photo_url).length

  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="최근 30일 평균 섭취" value={dietLogs.length ? `${averageCalories.toLocaleString('ko-KR')} kcal` : '기록 없음'} />
            <StatCard label="권장 섭취량" value={recommendedCalories ? `${recommendedCalories.toLocaleString('ko-KR')} kcal` : '프로필 필요'} />
            <StatCard label="사진 첨부 일수" value={`${photoCount}일`} />
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold mb-4">최근 14일 끼니별 칼로리</h2>
            <DietCalorieChart dietLogs={dietLogs} />
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold mb-4">최근 식단 기록</h2>
            <div className="space-y-4">
              {dietLogs.length ? (
                dietLogs.map((log) => (
                  <div key={log.id} className="border-b border-[hsl(var(--border))] pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{formatDate(log.date)}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                          아침 {log.breakfast_calories ?? 0} · 점심 {log.lunch_calories ?? 0} · 저녁 {log.dinner_calories ?? 0} kcal
                        </p>
                      </div>
                      <p className="font-semibold whitespace-nowrap">{getDietTotalCalories(log).toLocaleString('ko-KR')} kcal</p>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                      {log.breakfast ? <p>아침: {log.breakfast}</p> : null}
                      {log.lunch ? <p>점심: {log.lunch}</p> : null}
                      {log.dinner ? <p>저녁: {log.dinner}</p> : null}
                    </div>
                    {log.photo_url ? (
                      <img src={log.photo_url} alt="식단 사진" className="mt-3 h-32 w-full rounded-xl object-cover border border-[hsl(var(--border))]" />
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">식단 기록이 아직 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
