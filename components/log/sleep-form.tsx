'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { calcSleepDuration } from '@/lib/utils'
import { Loader2, Moon, CheckCircle2 } from 'lucide-react'

interface Props { date: string }

export function SleepForm({ date }: Props) {
  const [bedtime, setBedtime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [existingId, setExistingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('sleep_logs').select('*').eq('user_id', user.id).eq('date', date).single()
      if (data) {
        setBedtime(data.bedtime.slice(0, 5))
        setWakeTime(data.wake_time.slice(0, 5))
        setExistingId(data.id)
      } else {
        setBedtime('23:00')
        setWakeTime('07:00')
        setExistingId(null)
      }
    }
    load()
  }, [date])

  const duration = calcSleepDuration(bedtime, wakeTime)
  const durationColor = duration >= 8 ? 'text-blue-400' : duration >= 7 ? 'text-green-400' : duration >= 6 ? 'text-yellow-400' : 'text-red-400'

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('sleep_logs').upsert({
      ...(existingId ? { id: existingId } : {}),
      user_id: user.id, date, bedtime, wake_time: wakeTime, duration_hours: duration,
    }, { onConflict: 'user_id,date' })

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="text-center bg-[hsl(var(--card))] rounded-2xl px-8 py-5 border border-[hsl(var(--border))]">
          <Moon className="mx-auto mb-1 text-[#818CF8]" size={28} />
          <p className={`text-4xl font-bold ${durationColor}`}>{duration}시간</p>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">수면 시간</p>
          {existingId && <p className="text-xs text-[#818CF8] mt-1">기록됨 — 수정 중</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[hsl(var(--muted-foreground))]">🌙 취침 시간</Label>
          <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)}
            className="w-full h-12 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-[hsl(var(--foreground))] text-lg font-semibold focus:outline-none focus:border-[#818CF8]" />
        </div>
        <div className="space-y-2">
          <Label className="text-[hsl(var(--muted-foreground))]">☀️ 기상 시간</Label>
          <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}
            className="w-full h-12 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-[hsl(var(--foreground))] text-lg font-semibold focus:outline-none focus:border-[#818CF8]" />
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading}
        className="w-full h-12 bg-[#818CF8] hover:opacity-90 text-base font-semibold text-white">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장됨!' : existingId ? '수정하기' : '저장하기'}
      </Button>
    </div>
  )
}
