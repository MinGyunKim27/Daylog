'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpenseForm } from './expense-form'
import { SleepForm } from './sleep-form'
import { ExerciseForm } from './exercise-form'
import { MoodForm } from './mood-form'
import { DietForm } from './diet-form'
import { formatDate, moveDate, today } from '@/lib/utils'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const TAB_META = {
  expense: { label: '지출', emoji: '💸', color: '#F87171' },
  sleep: { label: '수면', emoji: '😴', color: '#818CF8' },
  exercise: { label: '운동', emoji: '💪', color: '#34D399' },
  mood: { label: '기분', emoji: '😊', color: '#FBBF24' },
  diet: { label: '식단', emoji: '🍚', color: '#FB923C' },
} as const

type LogTab = keyof typeof TAB_META

interface Props {
  initialTab?: string
}

export function LogContainer({ initialTab }: Props) {
  const params = useSearchParams()
  const queryTab = params.get('tab')
  const defaultTab = (initialTab || queryTab || 'expense') as LogTab

  const [date, setDate] = useState(today())
  const [activeTab, setActiveTab] = useState<LogTab>(TAB_META[defaultTab] ? defaultTab : 'expense')

  const todayStr = today()
  const isToday = date === todayStr
  const currentMeta = useMemo(() => TAB_META[activeTab], [activeTab])

  function goPrev() {
    setDate((prev) => moveDate(prev, -1))
  }

  function goNext() {
    if (!isToday) {
      setDate((prev) => moveDate(prev, 1))
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div>
        <div className="flex items-center gap-3 mb-4 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-3">
          <button onClick={goPrev} className="p-2 rounded-xl hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]">
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 text-center">
            <input
              type="date"
              value={date}
              max={todayStr}
              onChange={(event) => event.target.value && setDate(event.target.value)}
              className="sr-only"
              id="date-picker"
            />
            <label htmlFor="date-picker" className="cursor-pointer block">
              <p className="text-base font-semibold">{formatDate(date)}</p>
              {isToday ? <span className="text-xs text-[hsl(var(--primary))] font-medium">오늘</span> : null}
            </label>
          </div>

          <button
            onClick={goNext}
            disabled={isToday}
            className="p-2 rounded-xl hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
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
            <li>과거 날짜도 상단 날짜 선택으로 바로 수정 가능</li>
            <li>운동은 체중 기반 칼로리 자동 계산 지원</li>
            <li>식단은 kcal/사진 저장으로 회고에 유리</li>
            <li>통계 탭에서 카테고리별 차트를 확인 가능</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
