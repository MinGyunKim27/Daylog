import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { LogContainer } from '@/components/log/log-container'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { TodayChecklist } from '@/components/dashboard/today-checklist'
import { today } from '@/lib/utils'
import { DietLog, ExerciseLog, Expense, MoodLog, SleepLog } from '@/types'

interface PageProps {
  searchParams: {
    tab?: string
  }
}

export default async function TodayPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const todayDate = today()

  const [todayDietArr, todayExpenses, todaySleepArr, todayExercise, todayMoodArr] = await Promise.all([
    supabase.from('diet_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('expenses').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('sleep_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
    supabase.from('mood_logs').select('*').eq('user_id', user.id).eq('date', todayDate),
  ])

  const todaySleep = ((todaySleepArr.data as SleepLog[]) ?? [])[0] ?? null
  const todayMood = ((todayMoodArr.data as MoodLog[]) ?? [])[0] ?? null
  const todayDiet = ((todayDietArr.data as DietLog[]) ?? [])[0] ?? null
  const todayExpenseList = (todayExpenses.data as Expense[]) ?? []
  const todayExerciseList = (todayExercise.data as ExerciseLog[]) ?? []

  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12">
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
            clickable
          />

          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
            <LogContainer initialTab={searchParams.tab} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
