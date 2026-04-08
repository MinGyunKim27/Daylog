import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { TodayChecklist } from '@/components/dashboard/today-checklist'
import { ExpenseChart } from '@/components/dashboard/expense-chart'
import { SleepChart } from '@/components/dashboard/sleep-chart'
import { MoodChart } from '@/components/dashboard/mood-chart'
import { ExerciseHeatmap } from '@/components/dashboard/exercise-heatmap'
import { DietTimeline } from '@/components/dashboard/diet-timeline'
import { DietLog, ExerciseLog, Expense, MoodLog, SleepLog } from '@/types'
import { formatDate, getLast30Days, getLast90Days, getThisMonth, today } from '@/lib/utils'

function ChartCard({
  title,
  href,
  children,
}: {
  title: string
  href: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Link href={href} className="text-xs text-[hsl(var(--primary))] hover:underline whitespace-nowrap">
          상세 보기 &gt;
        </Link>
      </div>
      {children}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const todayDate = today()
  const thisMonthStart = getThisMonth()
  const last30Str = getLast30Days()[0]
  const last90Str = getLast90Days()[0]

  const [
    monthExpensesResult,
    sleepLogsResult,
    exerciseLogsResult,
    moodLogsResult,
    dietLogsResult,
    todayDietResult,
    todayExpensesResult,
    todaySleepResult,
    todayExerciseResult,
    todayMoodResult,
  ] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', user.id).gte('date', thisMonthStart).order('date'),
    supabase.from('sleep_logs').select('*').eq('user_id', user.id).gte('date', last30Str).order('date'),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id).gte('date', last90Str).order('date'),
    supabase.from('mood_logs').select('*').eq('user_id', user.id).gte('date', last30Str).order('date'),
    supabase.from('diet_logs').select('*').eq('user_id', user.id).gte('date', last30Str).order('date'),
    supabase.from('diet_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('expenses').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('sleep_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('mood_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
  ])

  const monthExpenses = (monthExpensesResult.data as Expense[]) ?? []
  const sleepLogs = (sleepLogsResult.data as SleepLog[]) ?? []
  const exerciseLogs = (exerciseLogsResult.data as ExerciseLog[]) ?? []
  const moodLogs = (moodLogsResult.data as MoodLog[]) ?? []
  const dietLogs = (dietLogsResult.data as DietLog[]) ?? []
  const todayDiet = ((todayDietResult.data as DietLog[]) ?? [])[0] ?? null
  const todayExpenses = (todayExpensesResult.data as Expense[]) ?? []
  const todaySleep = ((todaySleepResult.data as SleepLog[]) ?? [])[0] ?? null
  const todayExercise = (todayExerciseResult.data as ExerciseLog[]) ?? []
  const todayMood = ((todayMoodResult.data as MoodLog[]) ?? [])[0] ?? null

  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12">
        <div className="px-6 py-4 border-b border-[hsl(var(--border))]">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">오늘</p>
          <p className="text-xl font-bold">{formatDate(new Date())}</p>
        </div>

        <div className="px-6 py-6 w-full max-w-5xl mx-auto space-y-5">
          <TodayChecklist
            hasExpense={todayExpenses.length > 0}
            hasSleep={!!todaySleep}
            hasExercise={todayExercise.length > 0}
            hasMood={!!todayMood}
            hasDiet={!!todayDiet}
          />

          <SummaryCards
            todayExpenses={todayExpenses}
            todaySleep={todaySleep}
            todayExercise={todayExercise}
            todayMood={todayMood}
            todayDiet={todayDiet}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="이번달 지출" href="/expenses">
              <ExpenseChart expenses={monthExpenses} />
            </ChartCard>
            <ChartCard title="최근 30일 수면" href="/sleep">
              <SleepChart sleepLogs={sleepLogs} />
            </ChartCard>
            <ChartCard title="최근 30일 기분" href="/mood">
              <MoodChart moodLogs={moodLogs} />
            </ChartCard>
            <ChartCard title="운동 히트맵 (3개월)" href="/exercise">
              <ExerciseHeatmap exerciseLogs={exerciseLogs} />
            </ChartCard>
            <div className="lg:col-span-2">
              <ChartCard title="최근 식단 타임라인" href="/diet">
                <DietTimeline dietLogs={dietLogs} />
              </ChartCard>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
