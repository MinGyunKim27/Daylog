import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Header } from '@/components/layout/header'
import { InsightCard } from '@/components/insights/insight-card'
import { computeInsights } from '@/lib/insights'
import { SleepLog, MoodLog, ExerciseLog, Expense } from '@/types'

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const last90 = new Date(); last90.setDate(last90.getDate() - 90)
  const last90Str = last90.toISOString().slice(0, 10)

  const [
    { data: sleepLogs },
    { data: moodLogs },
    { data: exerciseLogs },
    { data: expenses },
  ] = await Promise.all([
    supabase.from('sleep_logs').select('*').eq('user_id', user.id).gte('date', last90Str),
    supabase.from('mood_logs').select('*').eq('user_id', user.id).gte('date', last90Str),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id).gte('date', last90Str),
    supabase.from('expenses').select('*').eq('user_id', user.id).gte('date', last90Str),
  ])

  const insights = computeInsights(
    (sleepLogs as SleepLog[]) ?? [],
    (moodLogs as MoodLog[]) ?? [],
    (exerciseLogs as ExerciseLog[]) ?? [],
    (expenses as Expense[]) ?? []
  )

  return (
    <div className="min-h-screen pb-24">
      <Header title="인사이트" subtitle="AI가 분석한 나의 패턴" />

      <main className="px-4 space-y-3">
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-4 mb-2">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            최근 90일 데이터 기준 •{' '}
            <span className="text-[hsl(var(--primary))]">{insights.length}개의 인사이트</span>
          </p>
        </div>

        {insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </main>

      <Navbar />
    </div>
  )
}
