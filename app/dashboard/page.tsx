import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Header } from '@/components/layout/header'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ExpenseChart } from '@/components/dashboard/expense-chart'
import { SleepChart } from '@/components/dashboard/sleep-chart'
import { MoodChart } from '@/components/dashboard/mood-chart'
import { ExerciseHeatmap } from '@/components/dashboard/exercise-heatmap'
import { today, getLast7Days } from '@/lib/utils'
import { Expense, SleepLog, ExerciseLog, MoodLog, DietLog } from '@/types'

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-4">
      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const todayDate = today()
  const last30 = new Date(); last30.setDate(last30.getDate() - 30)
  const last365 = new Date(); last365.setDate(last365.getDate() - 365)
  const last30Str = last30.toISOString().slice(0, 10)
  const last365Str = last365.toISOString().slice(0, 10)

  const [
    { data: allExpenses },
    { data: sleepLogs },
    { data: exerciseLogs },
    { data: moodLogs },
    { data: todayDietArr },
    { data: todayExpenses },
    { data: todaySleepArr },
    { data: todayExercise },
    { data: todayMoodArr },
  ] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', user.id).gte('date', getLast7Days()[0]).order('date'),
    supabase.from('sleep_logs').select('*').eq('user_id', user.id).gte('date', last30Str).order('date'),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id).gte('date', last365Str).order('date'),
    supabase.from('mood_logs').select('*').eq('user_id', user.id).gte('date', last30Str).order('date'),
    supabase.from('diet_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('expenses').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('sleep_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('mood_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
  ])

  return (
    <div className="min-h-screen pb-24">
      <Header title="대시보드" subtitle="나의 하루 요약" />

      <main className="px-4 space-y-4">
        <SummaryCards
          todayExpenses={(todayExpenses as Expense[]) ?? []}
          todaySleep={((todaySleepArr as SleepLog[]) ?? [])[0] ?? null}
          todayExercise={(todayExercise as ExerciseLog[]) ?? []}
          todayMood={((todayMoodArr as MoodLog[]) ?? [])[0] ?? null}
          todayDiet={((todayDietArr as DietLog[]) ?? [])[0] ?? null}
        />

        <ChartCard title="📊 이번 주 지출">
          <ExpenseChart expenses={(allExpenses as Expense[]) ?? []} />
        </ChartCard>

        <ChartCard title="😴 30일 수면 시간">
          <SleepChart sleepLogs={(sleepLogs as SleepLog[]) ?? []} />
        </ChartCard>

        <ChartCard title="😊 30일 기분 트렌드">
          <MoodChart moodLogs={(moodLogs as MoodLog[]) ?? []} />
        </ChartCard>

        <ChartCard title="🏃 운동 히트맵 (1년)">
          <ExerciseHeatmap exerciseLogs={(exerciseLogs as ExerciseLog[]) ?? []} />
        </ChartCard>
      </main>

      <Navbar />
    </div>
  )
}
