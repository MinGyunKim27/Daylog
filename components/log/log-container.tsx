'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, parseISO, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpenseForm } from './expense-form'
import { SleepForm } from './sleep-form'
import { ExerciseForm } from './exercise-form'
import { MoodForm } from './mood-form'
import { DietForm } from './diet-form'
import { cn, formatDate, moveDate, today } from '@/lib/utils'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const TAB_META = {
  expense: { label: '지출', emoji: '💸', color: '#F87171' },
  sleep: { label: '수면', emoji: '😴', color: '#818CF8' },
  exercise: { label: '운동', emoji: '💪', color: '#34D399' },
  mood: { label: '기분', emoji: '😊', color: '#FBBF24' },
  diet: { label: '식단', emoji: '🍚', color: '#FB923C' },
} as const

type LogTab = keyof typeof TAB_META
type DayStatus = Record<LogTab, boolean>
type DayStatusMap = Record<string, DayStatus>

interface Props {
  initialTab?: string
}

const EMPTY_STATUS: DayStatus = {
  expense: false,
  sleep: false,
  exercise: false,
  mood: false,
  diet: false,
}

export function LogContainer({ initialTab }: Props) {
  const params = useSearchParams()
  const queryTab = params.get('tab')
  const defaultTab = (initialTab || queryTab || 'expense') as LogTab

  const [date, setDate] = useState(today())
  const [activeTab, setActiveTab] = useState<LogTab>(TAB_META[defaultTab] ? defaultTab : 'expense')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(parseISO(today())))
  const [monthStatus, setMonthStatus] = useState<DayStatusMap>({})
  const calendarRef = useRef<HTMLDivElement | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const todayStr = today()
  const isToday = date === todayStr
  const currentMeta = useMemo(() => TAB_META[activeTab], [activeTab])
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [visibleMonth])
  const canGoNextMonth = format(addMonths(visibleMonth, 1), 'yyyy-MM') <= format(parseISO(todayStr), 'yyyy-MM')

  function goPrev() {
    setDate((prev) => moveDate(prev, -1))
  }

  function goNext() {
    if (!isToday) {
      setDate((prev) => moveDate(prev, 1))
    }
  }

  function selectDate(nextDate: string) {
    setDate(nextDate)
    setIsCalendarOpen(false)
  }

  useEffect(() => {
    setVisibleMonth(startOfMonth(parseISO(date)))
  }, [date])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isCalendarOpen) return

    async function loadMonthStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const start = format(startOfMonth(visibleMonth), 'yyyy-MM-dd')
      const end = format(endOfMonth(visibleMonth), 'yyyy-MM-dd')

      const [expenseResult, sleepResult, exerciseResult, moodResult, dietResult] = await Promise.all([
        supabase.from('expenses').select('date').eq('user_id', user.id).gte('date', start).lte('date', end),
        supabase.from('sleep_logs').select('date').eq('user_id', user.id).gte('date', start).lte('date', end),
        supabase.from('exercise_logs').select('date').eq('user_id', user.id).gte('date', start).lte('date', end),
        supabase.from('mood_logs').select('date').eq('user_id', user.id).gte('date', start).lte('date', end),
        supabase.from('diet_logs').select('date').eq('user_id', user.id).gte('date', start).lte('date', end),
      ])

      const nextStatus: DayStatusMap = {}

      function ensureDate(targetDate: string) {
        if (!nextStatus[targetDate]) {
          nextStatus[targetDate] = { ...EMPTY_STATUS }
        }
      }

      ;(expenseResult.data ?? []).forEach(({ date }) => {
        ensureDate(date)
        nextStatus[date].expense = true
      })
      ;(sleepResult.data ?? []).forEach(({ date }) => {
        ensureDate(date)
        nextStatus[date].sleep = true
      })
      ;(exerciseResult.data ?? []).forEach(({ date }) => {
        ensureDate(date)
        nextStatus[date].exercise = true
      })
      ;(moodResult.data ?? []).forEach(({ date }) => {
        ensureDate(date)
        nextStatus[date].mood = true
      })
      ;(dietResult.data ?? []).forEach(({ date }) => {
        ensureDate(date)
        nextStatus[date].diet = true
      })

      setMonthStatus(nextStatus)
    }

    void loadMonthStatus()
  }, [isCalendarOpen, supabase, visibleMonth])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div>
        <div ref={calendarRef} className="relative">
          <div className="flex items-center gap-3 mb-4 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-3">
            <button onClick={goPrev} className="p-2 rounded-xl hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]">
              <ChevronLeft size={18} />
            </button>

            <div className="flex-1 text-center">
              <button
                type="button"
                onClick={() => setIsCalendarOpen((prev) => !prev)}
                className="w-full rounded-xl py-1.5 hover:bg-[hsl(var(--accent))] transition-colors"
              >
                <p className="text-base font-semibold">{formatDate(date)}</p>
                <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] font-medium">
                  <CalendarDays size={12} />
                  {isToday ? '오늘 · 날짜 선택' : '날짜 선택'}
                </span>
              </button>
            </div>

            <button
              onClick={goNext}
              disabled={isToday}
              className="p-2 rounded-xl hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {isCalendarOpen ? (
            <div className="mb-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setVisibleMonth((prev) => subMonths(prev, 1))}
                  className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]"
                >
                  <ChevronLeft size={16} />
                </button>
                <p className="text-sm font-semibold">{format(visibleMonth, 'yyyy년 M월', { locale: ko })}</p>
                <button
                  type="button"
                  onClick={() => canGoNextMonth && setVisibleMonth((prev) => addMonths(prev, 1))}
                  disabled={!canGoNextMonth}
                  className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs text-[hsl(var(--muted-foreground))] mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const dayStr = format(day, 'yyyy-MM-dd')
                  const status = monthStatus[dayStr] ?? EMPTY_STATUS
                  const isSelected = dayStr === date
                  const isCurrentMonth = format(day, 'yyyy-MM') === format(visibleMonth, 'yyyy-MM')
                  const isFutureDate = dayStr > todayStr
                  const filledCount = Object.values(status).filter(Boolean).length

                  return (
                    <button
                      key={dayStr}
                      type="button"
                      onClick={() => !isFutureDate && selectDate(dayStr)}
                      disabled={isFutureDate}
                      className={cn(
                        'min-h-[68px] rounded-xl border p-2 text-left transition-colors',
                        isSelected
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.12]'
                          : 'border-[hsl(var(--border))] bg-[hsl(var(--background))]',
                        !isCurrentMonth && 'opacity-45',
                        isFutureDate && 'opacity-30 cursor-not-allowed',
                        !isFutureDate && 'hover:border-[hsl(var(--primary))/0.5] hover:bg-[hsl(var(--accent))]'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn('text-sm font-semibold', isSelected && 'text-[hsl(var(--primary))]')}>
                          {format(day, 'd')}
                        </span>
                        {dayStr === todayStr ? <span className="text-[10px] text-[hsl(var(--primary))]">오늘</span> : null}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {(Object.entries(TAB_META) as [LogTab, (typeof TAB_META)[LogTab]][]).map(([key, meta]) => (
                          <span
                            key={key}
                            className="h-2 w-2 rounded-full border"
                            style={{
                              backgroundColor: status[key] ? meta.color : 'transparent',
                              borderColor: status[key] ? meta.color : 'rgba(148, 163, 184, 0.28)',
                            }}
                            title={`${meta.label} ${status[key] ? '기록 있음' : '미기록'}`}
                          />
                        ))}
                      </div>

                      <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                        {filledCount ? `${filledCount}개 기록` : '미기록'}
                      </p>
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-[hsl(var(--muted-foreground))]">
                {(Object.entries(TAB_META) as [LogTab, (typeof TAB_META)[LogTab]][]).map(([key, meta]) => (
                  <span key={key} className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                    {meta.label}
                  </span>
                ))}
                <span>빈 점은 미기록</span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mb-4 rounded-2xl border p-4" style={{ borderColor: `${currentMeta.color}55`, background: `${currentMeta.color}12` }}>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">현재 기록 중</p>
          <p className="text-lg font-bold" style={{ color: currentMeta.color }}>
            {currentMeta.emoji} {currentMeta.label}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LogTab)} className="w-full">
          <TabsList className="grid grid-cols-5 w-full mb-6 bg-[hsl(var(--card))] h-11">
            <TabsTrigger value="expense" className="text-xs px-1">💸 지출</TabsTrigger>
            <TabsTrigger value="sleep" className="text-xs px-1">😴 수면</TabsTrigger>
            <TabsTrigger value="exercise" className="text-xs px-1">💪 운동</TabsTrigger>
            <TabsTrigger value="mood" className="text-xs px-1">😊 기분</TabsTrigger>
            <TabsTrigger value="diet" className="text-xs px-1">🍚 식단</TabsTrigger>
          </TabsList>

          <TabsContent value="expense"><ExpenseForm date={date} /></TabsContent>
          <TabsContent value="sleep"><SleepForm date={date} /></TabsContent>
          <TabsContent value="exercise"><ExerciseForm date={date} /></TabsContent>
          <TabsContent value="mood"><MoodForm date={date} /></TabsContent>
          <TabsContent value="diet"><DietForm date={date} /></TabsContent>
        </Tabs>
      </div>

      <div className="hidden lg:flex flex-col gap-4">
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5 sticky top-6">
          <div className="text-3xl mb-3">{currentMeta.emoji}</div>
          <h3 className="text-sm font-semibold mb-1.5">{currentMeta.label} 입력 중</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
            탭을 바꾸면 즉시 다른 항목을 기록할 수 있습니다. 오늘 기준으로 3분 안에 전체 입력이 가능하도록 구성했습니다.
          </p>
        </div>

        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={15} className="text-[hsl(var(--muted-foreground))]" />
            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">기록 안내</span>
          </div>
          <ul className="space-y-2 text-xs text-[hsl(var(--muted-foreground))]">
            <li>상단 날짜를 누르면 월 캘린더에서 바로 이동할 수 있어요.</li>
            <li>날짜 칸의 색 점으로 어떤 기록이 있는지 바로 확인할 수 있어요.</li>
            <li>운동은 체중 기반 칼로리 자동 계산을 지원합니다.</li>
            <li>식단은 kcal와 사진 저장으로 회고하기 좋게 구성했습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
