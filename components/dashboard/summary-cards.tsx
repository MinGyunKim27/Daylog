import Link from 'next/link'
import { DietLog, ExerciseLog, Expense, MoodLog, SleepLog } from '@/types'
import { formatKRW, getDietTotalCalories } from '@/lib/utils'

interface Props {
  todayExpenses: Expense[]
  todaySleep: SleepLog | null
  todayExercise: ExerciseLog[]
  todayMood: MoodLog | null
  todayDiet: DietLog | null
}

const MOOD_EMOJIS = ['😫', '😞', '🙁', '😕', '😐', '🙂', '😊', '😁', '🤩', '🥳']

export function SummaryCards({ todayExpenses, todaySleep, todayExercise, todayMood, todayDiet }: Props) {
  const totalExpense = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalExercise = todayExercise.reduce((sum, exercise) => sum + exercise.duration_minutes, 0)
  const totalDietCalories = getDietTotalCalories(todayDiet)

  const cards = [
    {
      href: '/log?tab=expense',
      emoji: '💸',
      label: '오늘 지출',
      color: '#F87171',
      value: totalExpense > 0 ? formatKRW(totalExpense) : '미입력',
      sub: todayExpenses.length > 0 ? `${todayExpenses.length}건 기록` : '기록 없음',
      filled: totalExpense > 0,
    },
    {
      href: '/log?tab=sleep',
      emoji: '😴',
      label: '수면',
      color: '#818CF8',
      value: todaySleep ? `${todaySleep.duration_hours}시간` : '미입력',
      sub: todaySleep ? `${todaySleep.bedtime.slice(0, 5)} ~ ${todaySleep.wake_time.slice(0, 5)}` : '기록 없음',
      filled: !!todaySleep,
    },
    {
      href: '/log?tab=exercise',
      emoji: '💪',
      label: '운동',
      color: '#34D399',
      value: totalExercise > 0 ? `${totalExercise}분` : '미입력',
      sub: todayExercise.length > 0 ? todayExercise.map((exercise) => exercise.type).join(', ') : '기록 없음',
      filled: totalExercise > 0,
    },
    {
      href: '/log?tab=mood',
      emoji: '😊',
      label: '기분',
      color: '#FBBF24',
      value: todayMood ? `${MOOD_EMOJIS[todayMood.score - 1]} ${todayMood.score}점` : '미입력',
      sub: todayMood?.note || (todayMood ? '메모 없음' : '기록 없음'),
      filled: !!todayMood,
    },
    {
      href: '/log?tab=diet',
      emoji: '🍚',
      label: '식단',
      color: '#FB923C',
      value: totalDietCalories > 0 ? `${totalDietCalories.toLocaleString('ko-KR')} kcal` : todayDiet ? '기록됨' : '미입력',
      sub: todayDiet
        ? [todayDiet.breakfast && '아침', todayDiet.lunch && '점심', todayDiet.dinner && '저녁'].filter(Boolean).join(' · ') || '메뉴 없음'
        : '기록 없음',
      filled: !!todayDiet,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(({ href, emoji, label, value, sub, color, filled }) => (
        <Link
          key={label}
          href={href}
          className="rounded-2xl p-4 border transition-all hover:-translate-y-0.5"
          style={{
            background: filled ? 'hsl(var(--card))' : 'hsl(217.2 32.6% 8%)',
            borderColor: filled ? `${color}44` : 'hsl(var(--border))',
            borderLeftWidth: '3px',
            borderLeftColor: color,
            opacity: filled ? 1 : 0.65,
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-base">{emoji}</span>
            <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{label}</span>
          </div>
          <p className="text-sm font-bold leading-tight truncate">{value}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 truncate">{sub}</p>
        </Link>
      ))}
    </div>
  )
}
