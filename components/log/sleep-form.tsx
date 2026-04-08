'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { calcSleepDuration } from '@/lib/utils'
import { CheckCircle2, Loader2, Moon } from 'lucide-react'

interface Props {
  date: string
}

export function SleepForm({ date }: Props) {
  const [bedtime, setBedtime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [existingId, setExistingId] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    setInitializing(true)

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setInitializing(false)
        return
      }

      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle()

      if (error) {
        setError('수면 기록을 불러오지 못했습니다.')
        setInitializing(false)
        return
      }

      if (data) {
        setBedtime(data.bedtime.slice(0, 5))
        setWakeTime(data.wake_time.slice(0, 5))
        setExistingId(data.id)
      } else {
        setBedtime('23:00')
        setWakeTime('07:00')
        setExistingId(null)
      }

      setInitializing(false)
    }

    void load()
  }, [date])

  const duration = calcSleepDuration(bedtime, wakeTime)

  async function handleSave() {
    setLoading(true)
    setSaved(false)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('로그인 정보가 만료되었습니다. 다시 로그인해 주세요.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('sleep_logs').upsert(
      {
        ...(existingId ? { id: existingId } : {}),
        user_id: user.id,
        date,
        bedtime,
        wake_time: wakeTime,
        duration_hours: duration,
      },
      { onConflict: 'user_id,date' }
    )

    if (error) {
      setError('수면 기록 저장에 실패했습니다.')
      setLoading(false)
      return
    }

    setSaved(true)
    setLoading(false)
  }

  if (initializing) {
    return <div className="h-40 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] animate-pulse" />
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p> : null}
      {existingId ? <p className="text-xs text-[#818CF8] bg-[#818CF8]/10 rounded-lg px-3 py-2">기록이 있어서 수정 모드로 열었습니다.</p> : null}

      <div className="flex items-center justify-center">
        <div className="text-center bg-[hsl(var(--card))] rounded-2xl px-8 py-5 border border-[hsl(var(--border))]">
          <Moon className="mx-auto mb-1 text-[#818CF8]" size={28} />
          <p className="text-4xl font-bold text-[#818CF8]">{duration}시간</p>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">자동 계산 수면시간</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[hsl(var(--muted-foreground))]">취침 시간</Label>
          <input
            type="time"
            value={bedtime}
            onChange={(event) => setBedtime(event.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-full h-12 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-lg font-semibold text-white [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-80"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[hsl(var(--muted-foreground))]">기상 시간</Label>
          <input
            type="time"
            value={wakeTime}
            onChange={(event) => setWakeTime(event.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-full h-12 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-lg font-semibold text-white [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-80"
          />
        </div>
      </div>

      <Button onClick={() => void handleSave()} disabled={loading} className="w-full h-12 bg-[#818CF8] hover:opacity-90 text-base font-semibold text-white">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장 완료' : existingId ? '수면 수정' : '수면 저장'}
      </Button>
    </div>
  )
}
