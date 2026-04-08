import Link from 'next/link'
import { CheckCircle2, Circle } from 'lucide-react'

interface Props {
  hasExpense: boolean
  hasSleep: boolean
  hasExercise: boolean
  hasMood: boolean
  hasDiet: boolean
}

const items = [
  { key: 'hasExpense' as const, label: '지출', emoji: '💸', color: '#F87171' },
  { key: 'hasSleep' as const, label: '수면', emoji: '😴', color: '#818CF8' },
  { key: 'hasExercise' as const, label: '운동', emoji: '💪', color: '#34D399' },
  { key: 'hasMood' as const, label: '기분', emoji: '😊', color: '#FBBF24' },
  { key: 'hasDiet' as const, label: '식단', emoji: '🍚', color: '#FB923C' },
]

export function TodayChecklist(props: Props) {
  const done = items.filter((item) => props[item.key]).length

  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">오늘 기록 진행</span>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">{done}/5 완료</span>
        </div>
        <Link href="/log" className="text-xs text-[hsl(var(--primary))] hover:underline font-medium">
          기록하러 가기
        </Link>
      </div>

      <div className="h-1 bg-[hsl(var(--muted))] rounded-full overflow-hidden mb-3">
        <div className="h-full bg-[hsl(var(--primary))] rounded-full transition-all duration-500" style={{ width: `${(done / 5) * 100}%` }} />
      </div>

      <div className="flex gap-2">
        {items.map(({ key, label, emoji, color }) => {
          const checked = props[key]

          return (
            <div
              key={key}
              className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2 rounded-xl border transition-all"
              style={{
                borderColor: checked ? `${color}55` : 'hsl(var(--border))',
                background: checked ? `${color}12` : 'transparent',
                opacity: checked ? 1 : 0.55,
              }}
            >
              <span className="text-base shrink-0">{emoji}</span>
              <span className="text-xs font-medium truncate text-[hsl(var(--foreground))]">{label}</span>
              <span className="ml-auto shrink-0">
                {checked ? <CheckCircle2 size={13} style={{ color }} /> : <Circle size={13} className="text-[hsl(var(--muted-foreground))]" />}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
