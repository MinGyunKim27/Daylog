import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { InsightCard } from '@/components/insights/insight-card'
import { AiInsightPanel } from '@/components/ai/ai-insight-panel'
import { computeInsights } from '@/lib/insights'
import { getLast90Days } from '@/lib/utils'
import { ExerciseLog, Expense, MoodLog, SleepLog } from '@/types'

export default async function InsightsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const last90Str = getLast90Days()[0]

  const [sleepLogs, moodLogs, exerciseLogs, expenses] = await Promise.all([
    supabase.from('sleep_logs').select('*').eq('user_id', user.id).gte('date', last90Str),
    supabase.from('mood_logs').select('*').eq('user_id', user.id).gte('date', last90Str),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id).gte('date', last90Str),
    supabase.from('expenses').select('*').eq('user_id', user.id).gte('date', last90Str),
  ])

  const sleepData = (sleepLogs.data as SleepLog[]) ?? []
  const moodData = (moodLogs.data as MoodLog[]) ?? []
  const exerciseData = (exerciseLogs.data as ExerciseLog[]) ?? []
  const expenseData = (expenses.data as Expense[]) ?? []

  const insights = computeInsights(sleepData, moodData, exerciseData, expenseData)

  const overallData = { sleep: sleepData, mood: moodData, exercise: exerciseData, expenses: expenseData }

  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12">
        <div className="px-6 py-6 w-full max-w-2xl mx-auto space-y-3">
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              최근 90일 기준으로 <span className="text-[hsl(var(--primary))] font-medium">{insights.length}개의 인사이트</span>를 찾았어요.
            </p>
          </div>

          <AiInsightPanel type="overall" data={overallData} />
          {insights.map((insight, index) => (
            <InsightCard key={`${insight.title}-${index}`} insight={insight} />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
