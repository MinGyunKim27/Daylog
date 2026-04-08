'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ExerciseLog } from '@/types'
import { Loader2, Trash2, Plus } from 'lucide-react'

const EXERCISE_TYPES = [
  { label: '달리기', emoji: '🏃' },
  { label: '걷기', emoji: '🚶' },
  { label: '헬스', emoji: '💪' },
  { label: '수영', emoji: '🏊' },
  { label: '자전거', emoji: '🚴' },
  { label: '요가', emoji: '🧘' },
  { label: '등산', emoji: '⛰️' },
  { label: '기타', emoji: '⚡' },
]

interface Props { date: string }

export function ExerciseForm({ date }: Props) {
  const [type, setType] = useState('달리기')
  const [duration, setDuration] = useState(30)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [entries, setEntries] = useState<ExerciseLog[]>([])
  const supabase = createClient()

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('exercise_logs').select('*').eq('user_id', user.id).eq('date', date).order('created_at')
    setEntries((data as ExerciseLog[]) ?? [])
  }

  useEffect(() => { loadEntries() }, [date])

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('exercise_logs').insert({ user_id: user.id, date, type, duration_minutes: duration })
    await loadEntries()
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('exercise_logs').delete().eq('id', id)
    await loadEntries()
    setDeleting(null)
  }

  const totalMins = entries.reduce((s, e) => s + e.duration_minutes, 0)

  return (
    <div className="space-y-6">
      {entries.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">이날 운동 내역</p>
            <p className="text-sm font-bold text-[#34D399]">총 {totalMins}분</p>
          </div>
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[hsl(var(--foreground))]">{e.type}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{e.duration_minutes}분</span>
              </div>
              <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id}
                className="text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors p-1">
                {deleting === e.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">운동 종류</p>
        <div className="grid grid-cols-4 gap-2">
          {EXERCISE_TYPES.map(({ label, emoji }) => (
            <button key={label} onClick={() => setType(label)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                type === label
                  ? 'border-[#34D399] bg-[#34D399]/10 text-[#34D399]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[#34D399]/50'
              }`}>
              <span className="text-xl">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">운동 시간</p>
          <span className="text-2xl font-bold text-[#34D399]">{duration}분</span>
        </div>
        <Slider value={[duration]} onValueChange={([v]) => setDuration(v)} min={5} max={180} step={5} className="py-2" />
        <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] mt-1">
          <span>5분</span><span>1시간</span><span>3시간</span>
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading}
        className="w-full h-12 bg-[#34D399] hover:opacity-90 text-base font-semibold text-white">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        추가하기
      </Button>
    </div>
  )
}
