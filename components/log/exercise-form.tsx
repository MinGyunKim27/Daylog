'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ExerciseLog, Profile } from '@/types'
import { calcExerciseCalories } from '@/lib/health'
import { Loader2, Plus, Trash2 } from 'lucide-react'

const EXERCISE_TYPES = [
  { label: '러닝', emoji: '🏃' },
  { label: '걷기', emoji: '🚶' },
  { label: '웨이트', emoji: '🏋️' },
  { label: '수영', emoji: '🏊' },
  { label: '자전거', emoji: '🚴' },
  { label: '필라테스', emoji: '🧘' },
  { label: '축구', emoji: '⚽' },
  { label: '기타', emoji: '🏅' },
] as const

const INTENSITY_OPTIONS: { value: 'low' | 'medium' | 'high'; label: string }[] = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
]

interface Props {
  date: string
}

export function ExerciseForm({ date }: Props) {
  const [type, setType] = useState<(typeof EXERCISE_TYPES)[number]['label']>('러닝')
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [duration, setDuration] = useState(30)
  const [entries, setEntries] = useState<ExerciseLog[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function loadAll() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const [entriesResult, profileResult] = await Promise.all([
      supabase.from('exercise_logs').select('*').eq('user_id', user.id).eq('date', date).order('created_at'),
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    ])

    if (entriesResult.error) {
      setError('운동 기록을 불러오지 못했습니다.')
    } else {
      setEntries((entriesResult.data as ExerciseLog[]) ?? [])
    }

    if (!profileResult.error && profileResult.data) {
      setProfile(profileResult.data as Profile)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [date])

  const estimatedCalories = useMemo(() => {
    return calcExerciseCalories(profile?.weight_kg ?? null, type, intensity, duration)
  }, [profile?.weight_kg, type, intensity, duration])

  async function handleSave() {
    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('로그인 정보가 만료되었습니다. 다시 로그인해 주세요.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('exercise_logs').insert({
      user_id: user.id,
      date,
      type,
      intensity,
      duration_minutes: duration,
      calories_burned: estimatedCalories,
    })

    if (error) {
      setError('운동 저장에 실패했습니다.')
      setLoading(false)
      return
    }

    await loadAll()
    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    setError(null)

    const { error } = await supabase.from('exercise_logs').delete().eq('id', id)

    if (error) {
      setError('운동 삭제에 실패했습니다.')
      setDeleting(null)
      return
    }

    await loadAll()
    setDeleting(null)
  }

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration_minutes, 0)
  const totalCalories = entries.reduce((sum, entry) => sum + (entry.calories_burned ?? 0), 0)

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p> : null}

      {!profile?.weight_kg ? (
        <p className="text-xs text-yellow-300 bg-yellow-500/10 rounded-lg px-3 py-2">
          설정에서 몸무게를 입력하면 운동 칼로리가 더 정확해집니다.
        </p>
      ) : null}

      {entries.length ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">오늘 운동 내역</p>
            <p className="text-sm font-bold text-[#34D399]">총 {totalMinutes}분 · {totalCalories.toLocaleString('ko-KR')} kcal</p>
          </div>

          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold">{entry.type} · {entry.duration_minutes}분 ({entry.intensity})</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  소모 칼로리 {entry.calories_burned ? `${entry.calories_burned.toLocaleString('ko-KR')} kcal` : '계산 없음'}
                </p>
              </div>
              <button
                onClick={() => void handleDelete(entry.id)}
                disabled={deleting === entry.id}
                className="text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors p-1"
                aria-label="운동 삭제"
              >
                {deleting === entry.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">운동 종류</p>
        <div className="grid grid-cols-4 gap-2">
          {EXERCISE_TYPES.map(({ label, emoji }) => (
            <button
              key={label}
              onClick={() => setType(label)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                type === label
                  ? 'border-[#34D399] bg-[#34D399]/10 text-[#34D399]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[#34D399]/50'
              }`}
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">강도</p>
        <div className="grid grid-cols-3 gap-2">
          {INTENSITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setIntensity(option.value)}
              className={`h-10 rounded-xl border text-sm ${
                intensity === option.value
                  ? 'border-[#34D399] bg-[#34D399]/10 text-[#34D399]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">운동 시간</p>
          <span className="text-2xl font-bold text-[#34D399]">{duration}분</span>
        </div>
        <Slider value={[duration]} onValueChange={([value]) => setDuration(value)} min={5} max={180} step={5} className="py-2" />
      </div>

      <div className="rounded-xl border border-[#34D399]/40 bg-[#34D399]/10 px-4 py-3">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">예상 소모 칼로리</p>
        <p className="text-xl font-bold text-[#34D399]">{estimatedCalories ? `${estimatedCalories.toLocaleString('ko-KR')} kcal` : '프로필 입력 필요'}</p>
      </div>

      <Button onClick={() => void handleSave()} disabled={loading} className="w-full h-12 bg-[#34D399] hover:opacity-90 text-base font-semibold text-white">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        운동 추가
      </Button>
    </div>
  )
}
