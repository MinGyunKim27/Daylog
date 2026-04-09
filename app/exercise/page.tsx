import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import { ExerciseHeatmap } from '@/components/dashboard/exercise-heatmap'
import { AiInsightPanel } from '@/components/ai/ai-insight-panel'
import { ExerciseLog } from '@/types'
import { formatDate, getLast90Days } from '@/lib/utils'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  )
}

export default async function ExercisePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const exerciseResult = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', getLast90Days()[0])
    .order('date', { ascending: false })

  const exerciseLogs = (exerciseResult.data as ExerciseLog[]) ?? []
  const totalMinutes = exerciseLogs.reduce((sum, log) => sum + log.duration_minutes, 0)
  const totalCalories = exerciseLogs.reduce((sum, log) => sum + (log.calories_burned ?? 0), 0)
  const topType = Object.entries(
    exerciseLogs.reduce<Record<string, number>>((acc, log) => {
      acc[log.type] = (acc[log.type] ?? 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]

  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="최근 3개월 운동 횟수" value={`${exerciseLogs.length}회`} />
            <StatCard label="총 운동 시간" value={`${totalMinutes.toLocaleString('ko-KR')}분`} />
            <StatCard label="가장 자주 한 운동" value={topType ? `${topType[0]} · ${topType[1]}회` : '기록 없음'} />
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-semibold">운동 히트맵 (3개월)</h2>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{totalCalories.toLocaleString('ko-KR')} kcal 소모</span>
            </div>
            <ExerciseHeatmap exerciseLogs={exerciseLogs.slice().reverse()} />
          </div>

          <AiInsightPanel type="exercise" data={exerciseLogs} accentColor="#34D399" />

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold mb-4">최근 운동 기록</h2>
            <div className="space-y-3">
              {exerciseLogs.length ? (
                exerciseLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between gap-3 border-b border-[hsl(var(--border))] pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">{log.type}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(log.date)} · {log.intensity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold whitespace-nowrap">{log.duration_minutes}분</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{log.calories_burned ? `${log.calories_burned.toLocaleString('ko-KR')} kcal` : '계산 없음'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">운동 기록이 아직 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
