'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Profile } from '@/types'
import { calcBmr, calcTdee } from '@/lib/health'
import { CheckCircle2, Loader2 } from 'lucide-react'

type Activity = NonNullable<Profile['activity_level']>

const ACTIVITY_OPTIONS: { value: Activity; label: string }[] = [
  { value: 'sedentary', label: '거의 앉아서 생활' },
  { value: 'light', label: '가벼운 활동 주 1-3회' },
  { value: 'moderate', label: '중간 활동 주 3-5회' },
  { value: 'active', label: '활동 많음 주 6회 이상' },
  { value: 'very_active', label: '매우 활동적' },
]

export function ProfileForm() {
  const [profile, setProfile] = useState<Partial<Profile>>({
    sex: null,
    birth_year: null,
    height_cm: null,
    weight_kg: null,
    muscle_kg: null,
    activity_level: null,
  })
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setInitializing(false)
        return
      }

      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

      if (!error && data) {
        setProfile(data as Profile)
      }

      setInitializing(false)
    }

    void load()
  }, [])

  const bmr = calcBmr(profile as Profile)
  const tdee = calcTdee(profile as Profile)

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

    const { error } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: user.email ?? null,
        sex: profile.sex ?? null,
        birth_year: profile.birth_year ?? null,
        height_cm: profile.height_cm ?? null,
        weight_kg: profile.weight_kg ?? null,
        muscle_kg: profile.muscle_kg ?? null,
        activity_level: profile.activity_level ?? null,
      },
      { onConflict: 'id' }
    )

    if (error) {
      setError('프로필 저장에 실패했습니다.')
      setLoading(false)
      return
    }

    setSaved(true)
    setLoading(false)
  }

  if (initializing) {
    return <div className="h-56 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] animate-pulse" />
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p> : null}

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">성별</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setProfile((prev) => ({ ...prev, sex: 'male' }))}
            className={`h-10 rounded-xl border ${profile.sex === 'male' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}
          >
            남성
          </button>
          <button
            onClick={() => setProfile((prev) => ({ ...prev, sex: 'female' }))}
            className={`h-10 rounded-xl border ${profile.sex === 'female' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}
          >
            여성
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[hsl(var(--muted-foreground))] px-1">출생연도</span>
          <div className="relative">
            <input
              type="number"
              placeholder="1994"
              value={profile.birth_year ?? ''}
              onChange={(event) => setProfile((prev) => ({ ...prev, birth_year: event.target.value ? Number(event.target.value) : null }))}
              className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--muted-foreground))] pointer-events-none">년</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[hsl(var(--muted-foreground))] px-1">키</span>
          <div className="relative">
            <input
              type="number"
              placeholder="173"
              value={profile.height_cm ?? ''}
              onChange={(event) => setProfile((prev) => ({ ...prev, height_cm: event.target.value ? Number(event.target.value) : null }))}
              className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--muted-foreground))] pointer-events-none">cm</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[hsl(var(--muted-foreground))] px-1">몸무게</span>
          <div className="relative">
            <input
              type="number"
              placeholder="70"
              value={profile.weight_kg ?? ''}
              onChange={(event) => setProfile((prev) => ({ ...prev, weight_kg: event.target.value ? Number(event.target.value) : null }))}
              className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--muted-foreground))] pointer-events-none">kg</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[hsl(var(--muted-foreground))] px-1">근육량 <span className="opacity-50">(선택)</span></span>
          <div className="relative">
            <input
              type="number"
              placeholder="40"
              value={profile.muscle_kg ?? ''}
              onChange={(event) => setProfile((prev) => ({ ...prev, muscle_kg: event.target.value ? Number(event.target.value) : null }))}
              className="w-full h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--muted-foreground))] pointer-events-none">kg</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">활동량</p>
        <div className="space-y-2">
          {ACTIVITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setProfile((prev) => ({ ...prev, activity_level: option.value }))}
              className={`w-full h-10 rounded-xl border text-sm ${
                profile.activity_level === option.value
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm space-y-1">
        <p className="text-[hsl(var(--muted-foreground))]">기초대사량(BMR): <span className="text-[hsl(var(--foreground))] font-semibold">{bmr ? `${bmr.toLocaleString('ko-KR')} kcal` : '정보 부족'}</span></p>
        <p className="text-[hsl(var(--muted-foreground))]">권장 섭취량(TDEE): <span className="text-[hsl(var(--foreground))] font-semibold">{tdee ? `${tdee.toLocaleString('ko-KR')} kcal` : '정보 부족'}</span></p>
      </div>

      <Button onClick={() => void handleSave()} disabled={loading} className="w-full h-12">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
        {saved ? '저장 완료' : '프로필 저장'}
      </Button>
    </div>
  )
}
