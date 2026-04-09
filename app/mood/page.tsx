import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import { MoodChart } from '@/components/dashboard/mood-chart'
import { AiInsightPanel } from '@/components/ai/ai-insight-panel'
import { MoodLog } from '@/types'
import { formatDate, getLast30Days } from '@/lib/utils'

function moodMeta(score: number): { color: string; bg: string; emoji: string } {
  if (score >= 9) return { color: '#818CF8', bg: 'rgba(129,140,248,0.12)', emoji: '🤩' }
  if (score >= 7) return { color: '#34D399', bg: 'rgba(52,211,153,0.12)', emoji: '😊' }
  if (score >= 4) return { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', emoji: '😐' }
  return { color: '#F87171', bg: 'rgba(248,113,113,0.12)', emoji: '😞' }
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
  const averageScore = moodLogs.length
    ? (moodLogs.reduce((sum, log) => sum + log.score, 0) / moodLogs.length).toFixed(1)
    : null
  const highScore = moodLogs.length ? Math.max(...moodLogs.map((log) => log.score)) : null
  const lowScore = moodLogs.length ? Math.min(...moodLogs.map((log) => log.score)) : null

  const goodDays = moodLogs.filter((l) => l.score >= 7).length
  const normalDays = moodLogs.filter((l) => l.score >= 4 && l.score < 7).length
  const badDays = moodLogs.filter((l) => l.score < 4).length
  const total = moodLogs.length || 1

  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* 상단 스탯 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[#FBBF24]/30 bg-[#FBBF24]/8 p-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">평균 기분</p>
              <p className="text-2xl font-black text-[#FBBF24] mt-1">{averageScore ?? '-'}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">/ 10점</p>
            </div>
            <div className="rounded-2xl border border-[#34D399]/30 bg-[#34D399]/8 p-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">최고</p>
              <p className="text-2xl font-black text-[#34D399] mt-1">{highScore ?? '-'}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">점</p>
            </div>
            <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/8 p-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">최저</p>
              <p className="text-2xl font-black text-[#F87171] mt-1">{lowScore ?? '-'}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">점</p>
            </div>
          </div>

          {/* 기분 분포 */}
          {moodLogs.length > 0 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
              <h2 className="text-sm font-semibold mb-3">30일 기분 분포</h2>
              <div className="flex rounded-full overflow-hidden h-3 mb-3 gap-0.5">
                {goodDays > 0 && (
                  <div className="h-full rounded-full" style={{ width: `${(goodDays / total) * 100}%`, backgroundColor: '#34D399' }} />
                )}
                {normalDays > 0 && (
                  <div className="h-full rounded-full" style={{ width: `${(normalDays / total) * 100}%`, backgroundColor: '#FBBF24' }} />
                )}
                {badDays > 0 && (
                  <div className="h-full rounded-full" style={{ width: `${(badDays / total) * 100}%`, backgroundColor: '#F87171' }} />
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#34D399]" />좋음 7-10점 · {goodDays}일</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FBBF24]" />보통 4-6점 · {normalDays}일</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F87171]" />나쁨 1-3점 · {badDays}일</span>
              </div>
            </div>
          )}

          {/* 차트 */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold mb-4">최근 30일 기분 추이</h2>
            <MoodChart moodLogs={moodLogs.slice().reverse()} />
          </div>

          <AiInsightPanel type="mood" data={moodLogs} accentColor="#FBBF24" />

          {/* 기록 목록 */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold mb-4">최근 기분 기록</h2>
            <div className="space-y-2">
              {moodLogs.length ? (
                moodLogs.map((log) => {
                  const meta = moodMeta(log.score)
                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 border"
                      style={{ borderColor: `${meta.color}30`, backgroundColor: meta.bg }}
                    >
                      <span className="text-xl shrink-0">{meta.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{formatDate(log.date)}</p>
                        {log.note ? <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 truncate">{log.note}</p> : null}
                      </div>
                      <span
                        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                        style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                      >
                        {log.score}
                      </span>
                    </div>
                  )
                })
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
