import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { TodayChecklist } from '@/components/dashboard/today-checklist'
import { ExpenseChart } from '@/components/dashboard/expense-chart'
import { SleepChart } from '@/components/dashboard/sleep-chart'
import { MoodChart } from '@/components/dashboard/mood-chart'
import { ExerciseHeatmap } from '@/components/dashboard/exercise-heatmap'
import { today, getThisMonth, getLast30Days, getLast90Days, formatDate } from '@/lib/utils'
import { Expense, SleepLog, ExerciseLog, MoodLog, DietLog } from '@/types'

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const todayDate = today()
  const thisMonthStart = getThisMonth()
  const last30Str = getLast30Days()[0]
  const last90Str = getLast90Days()[0]

  const [
    { data: monthExpenses },
    { data: sleepLogs },
    { data: exerciseLogs },
    { data: moodLogs },
    { data: todayDietArr },
    { data: todayExpenses },
    { data: todaySleepArr },
    { data: todayExercise },
    { data: todayMoodArr },
  ] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', user.id).gte('date', thisMonthStart).order('date'),
    supabase.from('sleep_logs').select('*').eq('user_id', user.id).gte('date', last30Str).order('date'),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id).gte('date', last90Str).order('date'),
    supabase.from('mood_logs').select('*').eq('user_id', user.id).gte('date', last30Str).order('date'),
    supabase.from('diet_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('expenses').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('sleep_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('mood_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
  ])

  const todaySleep = ((todaySleepArr as SleepLog[]) ?? [])[0] ?? null
  const todayMood = ((todayMoodArr as MoodLog[]) ?? [])[0] ?? null
  const todayDiet = ((todayDietArr as DietLog[]) ?? [])[0] ?? null
  const todayExpenseList = (todayExpenses as Expense[]) ?? []
  const todayExerciseList = (todayExercise as ExerciseLog[]) ?? []

  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12">
        {/* 날짜 서브헤더 */}
        <div className="px-6 py-4 border-b border-[hsl(var(--border))]">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">오늘</p>
          <p className="text-xl font-bold">{formatDate(new Date())}</p>
        </div>

        {/* 콘텐츠 */}
        <div className="px-6 py-6 w-full max-w-5xl mx-auto space-y-5">
          <TodayChecklist
            hasExpense={todayExpenseList.length > 0}
            hasSleep={!!todaySleep}
            hasExercise={todayExerciseList.length > 0}
            hasMood={!!todayMood}
            hasDiet={!!todayDiet}
          />
          <SummaryCards
            todayExpenses={todayExpenseList}
            todaySleep={todaySleep}
            todayExercise={todayExerciseList}
            todayMood={todayMood}
            todayDiet={todayDiet}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="💸 이번 달 지출">
              <ExpenseChart expenses={(monthExpenses as Expense[]) ?? []} />
            </ChartCard>
            <ChartCard title="😴 30일 수면 시간">
              <SleepChart sleepLogs={(sleepLogs as SleepLog[]) ?? []} />
            </ChartCard>
            <ChartCard title="😊 30일 기분 트렌드">
              <MoodChart moodLogs={(moodLogs as MoodLog[]) ?? []} />
            </ChartCard>
            <ChartCard title="💪 운동 히트맵 (3개월)">
              <ExerciseHeatmap exerciseLogs={(exerciseLogs as ExerciseLog[]) ?? []} />
            </ChartCard>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
