'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { today, calcSleepDuration } from '@/lib/utils'
import { CheckCircle2, Loader2, Moon } from 'lucide-react'

export function SleepForm() {
  const [bedtime, setBedtime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const duration = calcSleepDuration(bedtime, wakeTime)
  const durationColor =
    duration >= 8 ? 'text-blue-400' : duration >= 7 ? 'text-green-400' : duration >= 6 ? 'text-yellow-400' : 'text-red-400'

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('sleep_logs').upsert({
      user_id: user.id,
      date: today(),
      bedtime,
      wake_time: wakeTime,
      duration_hours: duration,
    }, { onConflict: 'user_id,date' })

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="text-center bg-[hsl(var(--card))] rounded-2xl px-8 py-5 border border-[hsl(var(--border))]">
          <Moon className="mx-auto mb-1 text-blue-400" size={28} />
          <p className={`text-4xl font-bold ${durationColor}`}>{duration}시간</p>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">수면 시간</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[hsl(var(--muted-foreground))]">🌙 취침 시간</Label>
          <input
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="w-full h-12 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-[hsl(var(--foreground))] text-lg font-semibold focus:outline-none focus:border-[hsl(var(--primary))]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[hsl(var(--muted-foreground))]">☀️ 기상 시간</Label>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="w-full h-12 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-[hsl(var(--foreground))] text-lg font-semibold focus:outline-none focus:border-[hsl(var(--primary))]"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full h-12 bg-[hsl(var(--primary))] hover:opacity-90 text-base font-semibold"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장됨!' : '저장하기'}
      </Button>
    </div>
  )
}
