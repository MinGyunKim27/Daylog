import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import { MoodChart } from '@/components/dashboard/mood-chart'
import { MoodLog } from '@/types'
import { formatDate, getLast30Days } from '@/lib/utils'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  )
}

export default async function MoodPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const moodResult = await supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', getLast30Days()[0])
    .order('date', { ascending: false })

  const moodLogs = (moodResult.data as MoodLog[]) ?? []
  const averageScore = moodLogs.length ? (moodLogs.reduce((sum, log) => sum + log.score, 0) / moodLogs.length).toFixed(1) : null
  const highScore = moodLogs.length ? Math.max(...moodLogs.map((log) => log.score)) : null
  const lowScore = moodLogs.length ? Math.min(...moodLogs.map((log) => log.score)) : null

  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="최근 30일 평균 기분" value={averageScore ? `${averageScore}점` : '기록 없음'} />
            <StatCard label="최고 점수" value={highScore ? `${highScore}점` : '기록 없음'} />
            <StatCard label="최저 점수" value={lowScore ? `${lowScore}점` : '기록 없음'} />
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold mb-4">최근 30일 기분 추이</h2>
            <MoodChart moodLogs={moodLogs.slice().reverse()} />
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold mb-4">최근 기분 기록</h2>
            <div className="space-y-3">
              {moodLogs.length ? (
                moodLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between gap-3 border-b border-[hsl(var(--border))] pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">{formatDate(log.date)}</p>
                      {log.note ? <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{log.note}</p> : null}
                    </div>
                    <p className="font-semibold whitespace-nowrap">{log.score}점</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">기분 기록이 아직 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
