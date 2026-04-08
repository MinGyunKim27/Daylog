import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import { SleepChart } from '@/components/dashboard/sleep-chart'
import { SleepLog } from '@/types'
import { formatDate, getLast30Days } from '@/lib/utils'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  )
}

export default async function SleepPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const sleepResult = await supabase
    .from('sleep_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', getLast30Days()[0])
    .order('date', { ascending: false })

  const sleepLogs = (sleepResult.data as SleepLog[]) ?? []
  const averageHours = sleepLogs.length ? (sleepLogs.reduce((sum, log) => sum + Number(log.duration_hours), 0) / sleepLogs.length).toFixed(1) : null
  const bestSleep = sleepLogs.length ? Math.max(...sleepLogs.map((log) => Number(log.duration_hours))) : null
  const goodSleepCount = sleepLogs.filter((log) => Number(log.duration_hours) >= 7).length

  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="최근 30일 평균 수면" value={averageHours ? `${averageHours}시간` : '기록 없음'} />
            <StatCard label="가장 길게 잔 날" value={bestSleep ? `${bestSleep.toFixed(1)}시간` : '기록 없음'} />
            <StatCard label="7시간 이상 달성" value={`${goodSleepCount}일`} />
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold mb-4">최근 30일 수면 추이</h2>
            <SleepChart sleepLogs={sleepLogs.slice().reverse()} />
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold mb-4">최근 수면 기록</h2>
            <div className="space-y-3">
              {sleepLogs.length ? (
                sleepLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">{formatDate(log.date)}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {log.bedtime.slice(0, 5)} ~ {log.wake_time.slice(0, 5)}
                      </p>
                    </div>
                    <p className="font-semibold whitespace-nowrap">{Number(log.duration_hours).toFixed(1)}시간</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">수면 기록이 아직 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
