import { Expense, SleepLog, ExerciseLog, MoodLog, DietLog } from '@/types'
import { formatKRW } from '@/lib/utils'
import { Wallet, Moon, Dumbbell, Smile, UtensilsCrossed } from 'lucide-react'

interface Props {
  todayExpenses: Expense[]
  todaySleep: SleepLog | null
  todayExercise: ExerciseLog[]
  todayMood: MoodLog | null
  todayDiet: DietLog | null
}

const MOOD_EMOJIS = ['😫', '😞', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳']

export function SummaryCards({ todayExpenses, todaySleep, todayExercise, todayMood, todayDiet }: Props) {
  const totalExpense = todayExpenses.reduce((s, e) => s + e.amount, 0)
  const totalExercise = todayExercise.reduce((s, e) => s + e.duration_minutes, 0)

  const cards = [
    {
      icon: <Wallet size={18} className="text-violet-400" />,
      label: '오늘 지출',
      value: totalExpense > 0 ? formatKRW(totalExpense) : '—',
      sub: todayExpenses.length > 0 ? `${todayExpenses.length}건` : '기록 없음',
      filled: totalExpense > 0,
    },
    {
      icon: <Moon size={18} className="text-blue-400" />,
      label: '수면',
      value: todaySleep ? `${todaySleep.duration_hours}시간` : '—',
      sub: todaySleep ? `${todaySleep.bedtime.slice(0,5)} ~ ${todaySleep.wake_time.slice(0,5)}` : '기록 없음',
      filled: !!todaySleep,
    },
    {
      icon: <Dumbbell size={18} className="text-emerald-400" />,
      label: '운동',
      value: totalExercise > 0 ? `${totalExercise}분` : '—',
      sub: todayExercise.length > 0 ? todayExercise.map(e => e.type).join(', ') : '기록 없음',
      filled: totalExercise > 0,
    },
    {
      icon: <Smile size={18} className="text-yellow-400" />,
      label: '기분',
      value: todayMood ? `${MOOD_EMOJIS[todayMood.score - 1]} ${todayMood.score}점` : '—',
      sub: todayMood?.note || '메모 없음',
      filled: !!todayMood,
    },
    {
      icon: <UtensilsCrossed size={18} className="text-pink-400" />,
      label: '식단',
      value: todayDiet ? '기록됨' : '—',
      sub: todayDiet
        ? [todayDiet.breakfast && '아침', todayDiet.lunch && '점심', todayDiet.dinner && '저녁'].filter(Boolean).join(', ') || '내용 없음'
        : '기록 없음',
      filled: !!todayDiet,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ icon, label, value, sub, filled }) => (
        <div
          key={label}
          className={`rounded-2xl p-4 border transition-all ${
            filled
              ? 'bg-[hsl(var(--card))] border-[hsl(var(--border))]'
              : 'bg-[hsl(217.2,32.6%,8%)] border-[hsl(217.2,32.6%,15%)] opacity-60'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{label}</span>
          </div>
          <p className="text-base font-bold text-[hsl(var(--foreground))] leading-tight">{value}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 truncate">{sub}</p>
        </div>
      ))}
    </div>
  )
}
